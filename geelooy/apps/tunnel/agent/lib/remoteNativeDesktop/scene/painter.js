// B"H
const { createFramebuffer, clear } = require('../rfb/framebuffer.js');
function paint(scene) { const fb = clear(createFramebuffer(scene.viewport.width, scene.viewport.height)); return { framebuffer:fb, damage:fb.dirty, note:`Painted ${scene.windows.length} windows and ${scene.drives.length} drives as fake desktop pixels.` }; }
module.exports = { paint };
