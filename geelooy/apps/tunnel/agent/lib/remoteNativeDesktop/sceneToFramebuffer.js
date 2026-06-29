// B"H
const Scene = require('./scene/geelooyScene.js');
const Painter = require('./scene/painter.js');
function render(input = {}) { return Painter.paint(Scene.normalize(input)); }
module.exports = { render };
