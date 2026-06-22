// B"H
/**
 * @class KeyBindingsManifest
 * @description
 * 📜 THE SCROLL OF SWITCHED STRIDES 📜
 *
 * The Awtsmoos makes the physical key a vessel for intention. The user's
 * decree is exact: E and Q exchange their lateral stride missions everywhere
 * this manifest translates keyboard breath into movement flag.
 */
export default class KeyBindingsManifest {
  static getBindings() {
    return {
      "KeyW": "FORWARD",
      "ArrowUp": "FORWARD",
      "KeyS": "BACKWARD",
      "ArrowDown": "BACKWARD",
      "KeyA": "LEFT_ROTATE",
      "ArrowLeft": "LEFT_ROTATE",
      "KeyD": "RIGHT_ROTATE",
      "ArrowRight": "RIGHT_ROTATE",
      "KeyE": "LEFT_STRIDE",
      "KeyQ": "RIGHT_STRIDE",
      "Space": "JUMP",
      "KeyX": "DOWN",
      "KeyC": "INTERACT",
      "KeyR": "PAN_UP",
      "KeyF": "PAN_DOWN"
    };
  }
}
