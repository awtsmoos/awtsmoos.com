
/**
 * B"H
 * @module InputProperties
 * @description 
 * 🧵 THE STRINGS OF THE PUPPETEER 🧵
 */
import * as THREE from '/games/scripts/build/three.module.js';

export const getInputProperties = () => ({
    achbar: new THREE.Vector2(),
    keyStates: {},
    mouseDown: false,
    inputs: {
        FORWARD: false, BACKWARD: false,
        LEFT_ROTATE: false, RIGHT_ROTATE: false,
        LEFT_STRIDE: false, RIGHT_STRIDE: false,
        JUMP: false, RUNNING: true
    },
    keyBindings: {
        "KeyW": "FORWARD", "ArrowUp": "FORWARD", "ArrowDown": "BACKWARD",
        "ArrowRight":"RIGHT_ROTATE", "ArrowLeft": "LEFT_ROTATE",
        "KeyA": "LEFT_ROTATE", "KeyD": "RIGHT_ROTATE",
        "KeyS": "BACKWARD", "KeyE": "RIGHT_STRIDE", "KeyQ": "LEFT_STRIDE",
        "KeyR": "PAN_UP", "KeyF": "PAN_DOWN",
        "Space": "JUMP", "KeyX": "DOWN", "KeyC": "INTERACT"
    }
});
