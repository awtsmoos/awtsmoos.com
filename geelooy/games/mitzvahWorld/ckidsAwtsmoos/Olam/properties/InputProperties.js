// B"H
/**
 * @module InputProperties
 * @description
 * Chapter 35: The Runner Stopped Being Born Running.
 *
 * The Awtsmoos gives input a quiet first breath. Walking is the default; run is
 * a deliberate state from Shift or an explicit UI run toggle. This removes the
 * hidden sprint multiplier that made lava traversal too twitchy.
 */
import * as THREE from '/games/scripts/build/three.module.js';

/**
 * Creates the mutable input state for an Olam instance.
 *
 * @returns {object} Input vectors, key states, bindings, and movement flags.
 */
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
        RUNNING: false
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
