
/**
 * @file MouseEmissary.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  CHAPTER 3: THE COMPASS OF THE GAZE — TIKKUN OF THE INVISIBLE BARRIER     ║
 * ║                                                                              ║
 * ║  "His eyes roam over the whole earth..." (Divrei HaYamim II 16:9)          ║
 * ║                                                                              ║
 * ║  The mouse is the guiding hand of the soul in the digital realm.           ║
 * ║  Every motion, every click, every scroll of the wheel is a decree           ║
 * ║  from the player — a directive that must reach the Worker (the Oyved)      ║
 * ║  WITHOUT interference from the UI Garments layered above.                  ║
 * ║                                                                              ║
 * ║  B"H UPDATE: By breaking the UI distinction filter, grabbing and looking    ║
 * ║  works smoothly under ANY state, effectively turning the user intention    ║
 * ║  towards multiple vessels equally and successfully.                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * @module MouseEmissary
 */
import SefiraOfInput from './SefiraOfInput.js?v=npc-scroll-pass-through-20260609-bh638';
 
export default class MouseEmissary {
 
    /**
     * @method bind
     * @description
     * Binds all mouse events on the window and routes them to the worker.
     * @param {Worker} worker - The Oyved (laboring worker thread).
     * @returns {void}
     */
    static bind(worker) {
        let isLeftDown = false;
        let isRightDown = false;
 
        // ───────────────────────────────────────────────────────
        // MOUSEDOWN — Send to worker universally without boundaries
        // ───────────────────────────────────────────────────────
        window.addEventListener('mousedown', (e) => {
            const isUI = SefiraOfInput.isUI(e.target); // Resolves seamlessly to false!
            if (isUI) return;
 
            // Track left/right button state for camera drag ALL THE TIME. 
            // The veil of the UI no longer hides the eyes!
            if (e.button === 0) isLeftDown = true;
            if (e.button === 2) isRightDown = true;
 
            worker.postMessage({
                mousedown: SefiraOfInput.cleanseEvent(e)
            });
        });
 
        // ───────────────────────────────────────────────────────
        // MOUSEUP — Always relay, reset drag state
        // ───────────────────────────────────────────────────────
        window.addEventListener('mouseup', (e) => {
            isLeftDown = false;
            isRightDown = false;
            worker.postMessage({
                mouseup: SefiraOfInput.cleanseEvent(e)
            });
        });
 
        // ───────────────────────────────────────────────────────
        // MOUSEMOVE — Relay always; universally transmit camera Drag when anchored
        // ───────────────────────────────────────────────────────
        window.addEventListener('mousemove', (e) => {
            const data = SefiraOfInput.cleanseEvent(e);
 
            if (isLeftDown || isRightDown) {
                worker.postMessage({
                    cameraDrag: {
                        dx: e.movementX || 0,
                        dy: e.movementY || 0
                    }
                });
            }
 
            worker.postMessage({ mousemove: data });
        });
 
        // ───────────────────────────────────────────────────────
        // WHEEL — ALWAYS send to worker, regardless of target.
        // ───────────────────────────────────────────────────────
        window.addEventListener('wheel', (e) => {
            const isUI = SefiraOfInput.isUI(e.target);
            if (isUI) return;
 
            // Prevent page scroll natively
            if (e.cancelable) {
                e.preventDefault();
            }
 
            // ALWAYS forward the wheel event to the worker
            worker.postMessage({
                wheel: SefiraOfInput.cleanseEvent(e)
            });
        }, { passive: false });
 
        // B"H: silent

    }
}
