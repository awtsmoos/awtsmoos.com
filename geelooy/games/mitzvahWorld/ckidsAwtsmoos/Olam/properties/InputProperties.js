// B"H
/**
 * @module InputProperties
 * Chapter 68: The V key is no rumor; it is named attack in clear letters.
 */
import { Vector2 } from "../rendering/ThreeAdapter.js";
export const getInputProperties = () => ({
  achbar: new Vector2(),
  keyStates: {},
  mouseDown: false,
  inputs: {
    FORWARD: false, BACKWARD: false, LEFT_ROTATE: false, RIGHT_ROTATE: false,
    LEFT_STRIDE: false, RIGHT_STRIDE: false, JUMP: false, RUNNING: true
  },
  keyBindings: {
    "KeyW": "FORWARD", "ArrowUp": "FORWARD", "ArrowDown": "BACKWARD",
    "ArrowRight": "RIGHT_ROTATE", "ArrowLeft": "LEFT_ROTATE", "KeyA": "LEFT_ROTATE",
    "KeyD": "RIGHT_ROTATE", "KeyS": "BACKWARD", "KeyE": "LEFT_STRIDE",
    "KeyQ": "RIGHT_STRIDE", "KeyR": "PAN_UP", "KeyF": "PAN_DOWN",
    "ShiftLeft": "RUNNING", "ShiftRight": "RUNNING", "Space": "JUMP",
    "KeyX": "DOWN", "KeyC": "INTERACT", "KeyV": "ATTACK"
  }
});
export default getInputProperties;
