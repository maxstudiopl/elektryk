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
