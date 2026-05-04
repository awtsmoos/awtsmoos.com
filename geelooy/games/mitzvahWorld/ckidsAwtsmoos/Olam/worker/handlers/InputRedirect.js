
/**
 * @module InputRedirect
 * @description
 * 📬 CHAPTER 6: THE REDIRECTOR OF FREE WILL 📬
 * 
 * This module broadcasts the user's intentions into the Olam's event bus.
 */

export default function InputRedirect(me) {
    return {
        _broadcast(type, payload) {
            if (!me.olam) return;

            // B"H: Intense Impulse Logging
            if (type === 'mousedown' || type === 'keydown' || type === 'wheel') {
                // B"H: silent

            }

            me.olam.ayshPeula(type, payload);
        },

        keydown(e) { this._broadcast("keydown", e); },
        keyup(e) { this._broadcast("keyup", e); },
        mousedown(e) { this._broadcast("mousedown", e); },
        mouseup(e) { this._broadcast("mouseup", e); },
        mousemove(e) { this._broadcast("mousemove", e); },
        wheel(e) { this._broadcast("wheel", e); },
        resize(e) { this._broadcast("resize", e); },

        cameraDrag(data) {
            if (me.olam && me.olam.ayin && typeof me.olam.ayin.rotateAroundTarget === 'function') {
                // High frequency gaze adjustment
                me.olam.ayin.rotateAroundTarget(data.dx, data.dy);
            }
        }
    };
}
