// B"H
function normalize(input = {}) { return { viewport:input.viewport || { width:1024, height:768 }, windows:input.windows || [], drives:input.drives || [], taskbar:input.taskbar || {}, title:input.title || 'Geelooy OS' }; }
function sample() { return normalize({ windows:[{ title:'Desktop', rect:{ x:40, y:40, width:700, height:480 }, active:true }], drives:[{ title:'Virtual OS' }, { title:'Connected Tunnels' }] }); }
module.exports = { normalize, sample };
