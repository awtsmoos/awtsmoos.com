// B"H
export function gameplayReadyState(scope=globalThis){const doc=scope.document;const text=doc?.body?.innerText||"";const loading=/loading|generating|preparing|initializing|please wait/i.test(text);const canvas=!!doc?.querySelector?.('canvas');const ui=!!doc?.querySelector?.('#mitzvahUiBridge,#ikar,#scrollBookButton');const boot=!!(scope.__AWTSMOOS_BOOT_LOADED__||scope.__AWTSMOOS_VISUAL_TUNING__||scope.__AWTSMOOS_SCROLL_UI__);return{ready:!!(doc?.readyState==='complete'&&canvas&&ui&&boot&&!loading),canvas,ui,boot,loading}}
export default gameplayReadyState;
