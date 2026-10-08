(()=>{
const TEMPLATES=[
  {
    id:'TRAINING-18',
    name:'Treningowa 1×18',
    family:'training',
    mounting:'training',
    rows:1,
    modulesPerRow:18,
    totalModules:18,
    sourceRef:null,
    level:'basic',
    engineStatus:'supported',
    notes:'Aktualny format treningowy gry.'
  },
  {
    id:'REF-3X12-FLUSH-SURFACE',
    name:'Domowa 3×12 • SPD / RCCB / MCB',
    family:'residential',
    mounting:'flush_or_surface',
    rows:3,
    modulesPerRow:12,
    totalModules:36,
    sourceRef:'SW-001',
    level:'intermediate',
    engineStatus:'supported',
    equipmentHint:{spd:true,rccb:2,mcb:14}
  },
  {
    id:'REF-3X12-SURFACE',
    name:'Natynkowa 3×12 • RCCB / MCB',
    family:'residential',
    mounting:'surface',
    rows:3,
    modulesPerRow:12,
    totalModules:36,
    sourceRef:'SW-004',
    level:'intermediate',
    engineStatus:'supported',
    equipmentHint:{spd:null,rccb:2,mcb:14}
  },
  {
    id:'REF-5X12',
    name:'Duża 5×12',
    family:'large_residential',
    mounting:'unknown',
    rows:5,
    modulesPerRow:12,
    totalModules:60,
    sourceRef:'SW-007',
    level:'advanced',
    engineStatus:'supported',
    equipmentHint:null
  },
  {
    id:'REF-5X24',
    name:'XL 5×24',
    family:'large_residential',
    mounting:'unknown',
    rows:5,
    modulesPerRow:24,
    totalModules:120,
    sourceRef:'SW-005',
    level:'advanced',
    engineStatus:'supported',
    equipmentHint:null
  },
  {
    id:'REF-CONSTRUCTION',
    name:'Rozdzielnica budowlana',
    family:'construction',
    mounting:'portable',
    rows:null,
    modulesPerRow:null,
    totalModules:null,
    sourceRef:'SW-006',
    level:'special',
    engineStatus:'planned',
    equipmentHint:null
  }
];

function all(){return TEMPLATES.map(t=>structuredClone(t))}
function get(id){
  const t=TEMPLATES.find(x=>x.id===id);
  return t?structuredClone(t):null;
}
function byFamily(family){
  return TEMPLATES.filter(t=>t.family===family).map(t=>structuredClone(t));
}
function supported(){
  return TEMPLATES.filter(t=>t.engineStatus==='supported').map(t=>structuredClone(t));
}

window.ElektrykSwitchboardDB={
  version:'0.2.0',
  all,
  get,
  byFamily,
  supported
};
})();