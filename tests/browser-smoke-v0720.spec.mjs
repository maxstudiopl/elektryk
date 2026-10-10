/* RozdzielnicaPRO v0.7.20 — Chromium smoke tests on isolated local server.
 * No production credentials or server accounts are accessed.
 * Session stub is applied only in the test browser's local storage. */
import {test,expect} from '@playwright/test';

async function localTestSession(page){
  await page.addInitScript(()=>{
    localStorage.setItem('elektryk_auth_v050',JSON.stringify({
      accountId:'admin',user:'admin',expires:Date.now()+60*60*1000
    }));
    localStorage.removeItem('elektryk_app_state_v0710');
  });
}
async function openWorkstation(page){
  await localTestSession(page);
  await page.goto('/');
  await expect(page.locator('#playerHub')).toBeVisible();
  await page.locator('#modeFree').click();
  await expect(page.locator('#boardSelectorModal')).toBeVisible();
  await page.locator('.board-choice-card[data-board-id="REF-3X12-SURFACE"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-game-mode','free');
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2?.getBoardConfig?.()?.rows)).toBe(3);
}
test('Application loads 300 tasks and demo session without JavaScript exceptions',async({page})=>{
  const exceptions=[];page.on('pageerror',error=>exceptions.push(error.message));
  await page.goto('/');
  await expect(page.locator('#authLogin')).toBeVisible();
  await page.locator('#authLogin').fill('demo');
  await page.locator('#authPassword').fill('demo123');
  await page.locator('#authSubmit').click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykTasks?.all?.length)).toBe(300);
  await expect(page.locator('.game-shell')).toBeVisible();
  await expect(page.locator('.pro-workspace-toolbar')).toBeVisible();
  expect(exceptions).toEqual([]);
});
test('Free Build: choose cabinet, install apparatus, run electrical report and save project',async({page})=>{
  const exceptions=[];page.on('pageerror',error=>exceptions.push(error.message));
  await openWorkstation(page);
  await expect(page.locator('.rightbar .catalog-card')).not.toHaveCount(0);
  await page.locator('.catalog-card[data-part="B10"]').first().click();
  await page.locator('.mount-grid[data-row="0"] .din-slot').first().click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2?.getMounted?.().length)).toBe(1);
  await page.locator('#checkPower').click();
  await expect(page.locator('#verificationProModal')).toBeVisible();
  await expect(page.locator('#verificationProVerdict')).toContainText(/BŁĘDY|WYMAGA|MODEL|KONTROLI/);
  await page.locator('#verificationProBack').click();
  await page.locator('#freeProjectName').fill('Audyt wersji 0.7.20');
  await page.locator('#saveFreeProject').click();
  await expect(page.locator('#freeSaveState')).toHaveText('ZAPISANO');
  const storage=await page.evaluate(()=>localStorage.getItem('elektryk_freebuild_saves_v0711'));
  expect(storage).toBeTruthy();
  expect(exceptions).toEqual([]);
});
test('Laptop, tablet and phone layouts keep cabinet scroll and side tools reachable',async({page})=>{
  await openWorkstation(page);
  for(const viewport of [
    {width:1366,height:768,area:'three'},
    {width:1024,height:768,area:'two'},
    {width:390,height:844,area:'one'}
  ]){
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    const measure=await page.evaluate(()=>{
      const shell=document.querySelector('.game-shell');
      const workspace=document.querySelector('.game-shell>.workspace');
      const tools=document.querySelector('.game-shell>.rightbar');
      const cabinet=document.querySelector('.workspace>.cabinet');
      const shortcuts=document.querySelector('.pro-responsive-shortcuts');
      return {
        shell:getComputedStyle(shell).gridTemplateAreas,
        workspaceWidth:workspace.getBoundingClientRect().width,
        pageWidth:document.documentElement.scrollWidth,
        viewport:innerWidth,toolsVisible:getComputedStyle(tools).display!=='none',
        cabinetOverflow:getComputedStyle(cabinet).overflowX,
        shortcuts:shortcuts?getComputedStyle(shortcuts).display:'none'
      };
    });
    expect(measure.workspaceWidth).toBeGreaterThan(240);
    expect(measure.pageWidth).toBeLessThanOrEqual(measure.viewport+12);
    expect(measure.cabinetOverflow).toBe('auto');
    if(viewport.area==='three')expect(measure.shell).toContain('left center right');
    if(viewport.area==='two')expect(measure.shell).toContain('center center');
    if(viewport.area==='one'){
      expect(measure.shell).toContain('center');
      expect(measure.shortcuts).not.toBe('none');
      await page.locator('.pro-mobile-jump').first().click();
    }
  }
});
test('Enlarged board keeps original catalogue and wire controls in focus dock',async({page})=>{
  await openWorkstation(page);
  await page.locator('#proFocusMode').click();
  await expect(page.locator('body')).toHaveClass(/pro-tools-docked/);
  await expect(page.locator('#proFocusDock .rightbar .catalog-panel')).toBeVisible();
  const state=await page.evaluate(()=>({
    count:document.querySelectorAll('.catalog-panel').length,
    root:document.querySelector('#proToolSidebar')?.parentElement?.id,
    wired:!!window.ElektrykStage3?.redraw,
    bridged:!!window.ElektrykBridges?.redraw
  }));
  expect(state.count).toBe(1);
  expect(state.root).toBe('proFocusDock');
  expect(state.wired).toBe(true);
  expect(state.bridged).toBe(true);
  await page.locator('#proFocusMode').click();
  await expect(page.locator('body')).not.toHaveClass(/pro-tools-docked/);
});

test('Real terminal clicks create a wire, undo works and removal prunes stale endpoints',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await openWorkstation(page);
  await page.locator('.catalog-card[data-part="B10"]').first().click();
  await page.locator('.mount-grid[data-row="0"] .din-slot').first().click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length)).toBe(1);
  console.log('MOUNT_DIAG_WIRES',JSON.stringify(await page.evaluate(()=>({
    mounted:window.ElektrykStage2.getMounted(),count:document.querySelectorAll('.mounted-device').length,
    inRows:document.querySelector('.din-rows-host')?.querySelectorAll('.mounted-device').length,
    grid:document.querySelector('.mount-grid[data-row="0"]')?.outerHTML.slice(0,280),
    mountId:window.ElektrykStage2.getMounted()[0]?.id,
    bodyMode:document.body.dataset.gameMode
  }))));
  await expect.poll(()=>page.locator('.mounted-device').count(),{timeout:10000}).toBe(1);
  const supply=page.locator('[data-terminal="SUPPLY:L1"]');
  const breaker=page.locator('.mounted-device [data-role="L"][data-zone="top"]').first();
  await expect(supply).toBeVisible();
  await expect(breaker).toBeVisible();
  await supply.click();
  await breaker.click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage3.getConnections().length)).toBe(1);
  await page.locator('#undoWire').click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage3.getConnections().length)).toBe(0);
  await supply.click();await breaker.click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage3.getConnections().length)).toBe(1);
  await page.locator('.mounted-device').first().hover();
  await expect(page.locator('.mounted-device .remove-device').first()).toBeVisible();
  await page.locator('.mounted-device .remove-device').first().click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length)).toBe(0);
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage3.getConnections().length)).toBe(0);
  expect(errors).toEqual([]);
});
test('Saved free-build project restores mounted apparatus from selected slot',async({page})=>{
  await openWorkstation(page);
  await page.locator('.catalog-card[data-part="B10"]').first().click();
  await page.locator('.mount-grid[data-row="0"] .din-slot').first().click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length)).toBe(1);
  console.log('MOUNT_DIAG_SAVE',JSON.stringify(await page.evaluate(()=>({
    mounted:window.ElektrykStage2.getMounted(),count:document.querySelectorAll('.mounted-device').length,
    inRows:document.querySelector('.din-rows-host')?.querySelectorAll('.mounted-device').length,
    grid:document.querySelector('.mount-grid[data-row="0"]')?.outerHTML.slice(0,280)
  }))));
  await expect.poll(()=>page.locator('.mounted-device').count(),{timeout:10000}).toBe(1);
  await page.locator('#freeProjectName').fill('Projekt do odtworzenia');
  await page.locator('#saveFreeProject').click();
  await expect(page.locator('#freeSaveState')).toHaveText('ZAPISANO');
  await page.locator('.mounted-device').first().hover();
  await expect(page.locator('.mounted-device .remove-device').first()).toBeVisible();
  await page.locator('.mounted-device .remove-device').first().click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length)).toBe(0);
  await page.locator('#loadFreeProject').click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length)).toBe(1);
  await expect(page.locator('#freeProjectName')).toHaveValue('Projekt do odtworzenia');
  await expect(page.locator('#freeSaveState')).toHaveText('ZAPISANO');
});
test('Learning catalogue contains task 300 and running a task cannot award XP without wiring',async({page})=>{
  await localTestSession(page);
  await page.goto('/');
  await expect(page.locator('#playerHub')).toBeVisible();
  await page.locator('#modeLearn').click();
  await expect.poll(()=>page.evaluate(()=>window.ElektrykTasks?.all?.length)).toBe(300);
  await page.locator('.task-button').click();
  await expect(page.locator('#taskModal')).toBeVisible();
  await page.locator('#taskCatalogSearch').fill('300');
  await expect(page.locator('.task-card[data-task-id="300"]')).toBeVisible();
  await page.locator('.task-card[data-task-id="300"]').click();
  await expect.poll(()=>page.evaluate(()=>Number(window.ElektrykStage2?.getTask?.()?.id))).toBe(300);
  const before=await page.evaluate(()=>window.ElektrykProgress?.get?.()?.xp);
  await page.locator('#checkPower').click();
  const after=await page.evaluate(()=>window.ElektrykProgress?.get?.()?.xp);
  expect(after).toBe(before);
});

test('Industrial X1 cannot produce a green electrical verification and expires after editing X1',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await localTestSession(page);
 await page.goto('/');
 await expect(page.locator('#playerHub')).toBeVisible();
 await page.locator('#modeFree').click();
 await expect(page.locator('#boardSelectorModal')).toBeVisible();
 await page.locator('.board-choice-card[data-board-id="IND-PRO-4X24"]').click();
 await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2?.getBoardConfig?.()?.family)).toBe('industrial');
 await page.locator('#checkPower').click();
 await expect(page.locator('#verificationProModal')).toBeVisible();
 await expect(page.locator('#verificationProVerdict')).not.toContainText('MODEL PRZESZEDŁ');
 await expect(page.locator('#verificationProIssues')).toContainText('X1');
 await expect.poll(()=>page.evaluate(()=>window.ElektrykVerificationPRO?.isCurrent?.())).toBe(true);
 await page.evaluate(()=>window.ElektrykIndustrialZug.setSlot(0,'L1'));
 await expect.poll(()=>page.evaluate(()=>window.ElektrykVerificationPRO?.isCurrent?.())).toBe(false);
 await page.locator('#verificationProRun').click();
 await expect(page.locator('#verificationProVerdict')).not.toContainText('MODEL PRZESZEDŁ');
 expect(errors).toEqual([]);
});

test('All seven supported cabinets retain exact DIN capacity and apparatus fits the final module',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await openWorkstation(page);
 const models=await page.evaluate(()=>window.ElektrykSwitchboardDB.supported().map(({id,rows,modulesPerRow,family,zugSlots})=>({id,rows,modulesPerRow,family,zugSlots})));
 expect(models).toHaveLength(7);
 for(const model of models){
   const selected=await page.evaluate(id=>window.ElektrykStage2.configureBoard(window.ElektrykSwitchboardDB.get(id)),model.id);
   expect(selected,model.id).toBe(true);
   await expect.poll(()=>page.locator('.din-row').count()).toBe(model.rows);
   const result=await page.evaluate(()=>{
     const board=window.ElektrykStage2.getBoardConfig();
     return {board,
       slots:document.querySelectorAll('.mount-grid .din-slot').length,
       rails:document.querySelectorAll('.mount-grid').length,
       zug:window.ElektrykIndustrialZug.getState()};
   });
   expect(result.board.rows,model.id).toBe(model.rows);
   expect(result.board.modulesPerRow,model.id).toBe(model.modulesPerRow);
   expect(result.board.totalModules,model.id).toBe(model.rows*model.modulesPerRow);
   expect(result.rails,model.id).toBe(model.rows);
   expect(result.slots,model.id).toBe(model.rows*model.modulesPerRow);
   if(model.family==='industrial'){
     expect(result.zug?.capacity).toBe(model.zugSlots);
     expect(result.zug?.slots).toHaveLength(model.zugSlots);
   }else expect(result.zug).toBeNull();
   await page.locator('.catalog-card[data-part="B10"]').first().click();
   await page.locator('.mount-grid[data-row="0"] .din-slot').last().click();
   await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length)).toBe(1);
   const mounted=await page.evaluate(()=>window.ElektrykStage2.getMounted()[0]);
   expect(mounted.start,model.id).toBe(model.modulesPerRow-1);
   await page.locator('.mounted-device').first().hover();
   await page.locator('.mounted-device .remove-device').first().click();
   await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length)).toBe(0);
 }
 expect(errors).toEqual([]);
});
test('Clear cabinet removes both DIN apparatus and industrial X1 terminals',async({page})=>{
 await openWorkstation(page);
 await page.evaluate(()=>window.ElektrykStage2.configureBoard(window.ElektrykSwitchboardDB.get('IND-PRO-5X24')));
 await page.evaluate(()=>window.ElektrykIndustrialZug.setSlot(0,'L1'));
 await expect.poll(()=>page.evaluate(()=>window.ElektrykIndustrialZug.getState().slots[0])).toBe('L1');
 await page.locator('.catalog-card[data-part="B10"]').first().click();
 await page.locator('.mount-grid[data-row="0"] .din-slot').first().click();
 await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length)).toBe(1);
 await page.locator('#resetMount').click();
 await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length)).toBe(0);
 expect(await page.evaluate(()=>window.ElektrykIndustrialZug.getState().slots[0])).toBeNull();
});

test('XL 5x24 preserves 60 independently rendered wires and their saved apparatus',async({page})=>{
 test.setTimeout(90_000);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await openWorkstation(page);
 const expectedMounts=61,expectedWires=60;
 const mounted=await page.evaluate(()=>{
   const board=window.ElektrykSwitchboardDB.get('REF-5X24');
   window.ElektrykStage2.configureBoard(board);
   const records=Array.from({length:61},(_,i)=>({
     id:'M'+(i+1),code:'B10',row:Math.floor(i/24),start:i%24,modules:1
   }));
   return window.ElektrykStage2.restoreMounted(records);
 });
 expect(mounted).toBe(expectedMounts);
 await expect(page.locator('.mounted-device')).toHaveCount(expectedMounts);
 await expect.poll(()=>page.locator('.mounted-device .wire-terminal').count()).toBe(expectedMounts*2);
 const cables=await page.evaluate(()=>{
   const records=Array.from({length:60},(_,index)=>{
     const a=document.querySelector('.mounted-device[data-mount-id="M'+(index+1)+'"] .device-topterm .wire-terminal');
     const b=document.querySelector('.mounted-device[data-mount-id="M'+(index+2)+'"] .device-bottomterm .wire-terminal');
     if(!a||!b)throw Error('Missing cable endpoint '+index);
     return {id:'W'+(index+1),a:a.dataset.terminal,b:b.dataset.terminal,type:'L1',cable:'1x1.5'};
   });
   return window.ElektrykStage3.setConnections(records);
 });
 expect(cables).toBe(expectedWires);
 await expect.poll(()=>page.evaluate(()=>window.ElektrykStage3.getConnections().length)).toBe(expectedWires);
 await expect.poll(()=>page.locator('.wire-path').count()).toBe(expectedWires);
 await page.locator('#freeProjectName').fill('XL 60 przewodów test');
 await page.locator('#saveFreeProject').click();
 await expect(page.locator('#freeSaveState')).toHaveText('ZAPISANO');
 await page.evaluate(()=>window.ElektrykStage2.reset());
 await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length)).toBe(0);
 await page.locator('#loadFreeProject').click();
 await expect.poll(()=>page.evaluate(()=>window.ElektrykStage2.getMounted().length),{timeout:15000}).toBe(expectedMounts);
 await expect.poll(()=>page.evaluate(()=>window.ElektrykStage3.getConnections().length),{timeout:15000}).toBe(expectedWires);
 await expect.poll(()=>page.locator('.wire-path').count(),{timeout:15000}).toBe(expectedWires);
 await expect(page.locator('#freeSaveState')).toHaveText('ZAPISANO');
 expect(errors).toEqual([]);
});
