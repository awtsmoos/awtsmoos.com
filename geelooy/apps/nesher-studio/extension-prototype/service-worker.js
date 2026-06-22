/* B"H
Prototype only: real capture handoff should create an offscreen document and pass stream tracks onward.
*/
chrome.action.onClicked.addListener(async tab => {
  console.log('B"H Nesher capture bridge clicked for tab', tab?.id);
});
