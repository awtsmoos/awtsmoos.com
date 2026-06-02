// B"H
/**
 * @module InputProperties
 * @description
 * Chapter 66: Run And Walk Became Two Honest Gates.
 *
 * The Awtsmoos begins this lava level in run mode, but the mode is no longer a
 * lie. The dock may toggle RUNNING false and the Chossid will truly slow down
 * and use the walk clip.
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
        "KeyE": "RIGHT_STRIDE",
        "KeyQ": "LEFT_STRIDE",
        "KeyR": "PAN_UP",
        "KeyF": "PAN_DOWN",
        "ShiftLeft": "RUNNING",
        "ShiftRight": "RUNNING",
        "Space": "JUMP",
        "KeyX": "DOWN",
        "KeyC": "INTERACT"
    }
});
