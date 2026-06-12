// B"H
function keyboardMouse(window) {
  return {
    keyboard: { type: async text => window.keyboard.type(text), press: async key => window.keyboard.press(key), down: async key => window.keyboard.down(key), up: async key => window.keyboard.up(key) },
    mouse: { click: async (x, y) => { window.mouse.move(Number(x)||0, Number(y)||0); return window.mouse.click(); }, move: async (x, y) => window.mouse.move(Number(x)||0, Number(y)||0), down: async () => window.mouse.down(), up: async () => window.mouse.up() }
  };
}
module.exports = { keyboardMouse };
