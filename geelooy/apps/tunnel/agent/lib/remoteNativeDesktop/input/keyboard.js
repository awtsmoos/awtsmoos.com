// B"H
function keyToAction(event = {}) { return { action:'virtualKey', key:event.key || '', code:event.code || '', hint:'Translate to Geelooy type/shortcut in bridge layer.' }; }
module.exports = { keyToAction };
