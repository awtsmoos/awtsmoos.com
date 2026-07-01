// B"H
/**
 * @class KeyBindingsManifest
 * @description
 * 📜 THE SCROLL OF TRUE STRIDES 📜
 *
 * The user's hand asked for a reversal, and the Awtsmoos writes it plainly:
 * Q is left stride, E is right stride. Every caller that drinks from this
 * manifest now receives the same covenant, so no hidden vessel fights another.
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
      "KeyQ": "LEFT_STRIDE",
      "KeyE": "RIGHT_STRIDE",
      "Space": "JUMP",
      "KeyX": "DOWN",
      "KeyC": "INTERACT",
      "KeyR": "PAN_UP",
      "KeyF": "PAN_DOWN"
    };
  }
}
