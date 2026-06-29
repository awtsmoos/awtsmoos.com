// B"H
function pointerToAction(event = {}) { return { action:'virtualPointer', x:event.x || 0, y:event.y || 0, buttons:event.buttons || 0, hint:'Translate to Geelooy focus/click/drag in bridge layer.' }; }
module.exports = { pointerToAction };
