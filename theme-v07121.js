/* Elektryk Symulator v0.7.12.2 — jedyny motyw Dark */
(()=>{
'use strict';
const root=document.documentElement;
root.dataset.theme='dark';
root.dataset.themePreference='dark';
root.style.colorScheme='dark';
// Dawne ustawienia Light/Auto nie mają zastosowania w tej wersji.
try{localStorage.removeItem('elektryk_theme_v07121')}catch(e){}
window.ElektrykTheme={getMode:()=> 'dark',getResolved:()=> 'dark'};
})();
