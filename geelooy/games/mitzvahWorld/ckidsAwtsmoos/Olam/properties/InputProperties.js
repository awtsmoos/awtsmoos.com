// B"H
/**
 * @module InputProperties
 * @description
 * Chapter 67: The Keyboard Rivers Crossed Without Confusion.
 *
 * The Awtsmoos lets the same world-state be born from direct keys, manifests,
 * and mobile bridges. E now carries LEFT_STRIDE and Q carries RIGHT_STRIDE, so
 * all input vessels agree with the user's command.
 */
import * as THREE from '/games/scripts/build/three.module.js';

/** @returns {object} Input vectors, key states, bindings, and movement flags. */
export const getInputProperties = () => ({
  achbar: new THREE.Vector2(),
  keyStates: {},
  mouseDown: false,
  inputs: {
    FORWARD: false,
    BACKWARD: false,
    LEFT_ROTATE: false,
    RIGHT_ROTATE: false,
    LEFT_STRIDE: false,
    RIGHT_STRIDE: false,
    JUMP: false,
    RUNNING: true
  },
  keyBindings: {
    "KeyW": "FORWARD",
    "ArrowUp": "FORWARD",
    "ArrowDown": "BACKWARD",
    "ArrowRight": "RIGHT_ROTATE",
    "ArrowLeft": "LEFT_ROTATE",
    "KeyA": "LEFT_ROTATE",
    "KeyD": "RIGHT_ROTATE",
    "KeyS": "BACKWARD",
    "KeyE": "LEFT_STRIDE",
    "KeyQ": "RIGHT_STRIDE",
    "KeyR": "PAN_UP",
    "KeyF": "PAN_DOWN",
    "ShiftLeft": "RUNNING",
    "ShiftRight": "RUNNING",
    "Space": "JUMP",
    "KeyX": "DOWN",
    "KeyC": "INTERACT",
    "KeyV": "ATTACK"
  }
});
