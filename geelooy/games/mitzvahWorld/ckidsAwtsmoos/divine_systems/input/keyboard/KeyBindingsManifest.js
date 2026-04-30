
// B"H
/**
 * @class KeyBindingsManifest
 * @description
 * 📜 THE SCROLL OF DECREES 📜
 * 
 * Binds meaningless physical key codes ('KeyW') to profound spiritual intentions ('FORWARD').
 * This is pure data. No logic. It acts as the cipher for the engine.
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
            "KeyC": "UP",
            "KeyR": "PAN_UP",
            "KeyF": "PAN_DOWN"
        };
    }
}
