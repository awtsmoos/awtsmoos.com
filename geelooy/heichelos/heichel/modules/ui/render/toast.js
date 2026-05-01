
/**
 * B"H
 * @module ToastRenderer
 * @description
 * Like a whisper from the infinite, the Toast manifest briefly 
 * before returning to the void.
 */

import { DOMElements } from '../../dom.js';
import { ScribeOfManifestation } from '../../engine/scribe-of-manifestation.js';

/**
 * @function notify
 * @description Manifests a transient notification vessel.
 */
export function notify(message, type = 'info', duration = 4000) {
    if (!DOMElements.toastContainer) return;

    const blueprint = {
        tag: 'div',
        attr: { class: `awtsmoos-toast-spark ${type}` },
        children: [message],
        events: {
            click: (e) => e.target.remove()
        }
    };

    const toast = ScribeOfManifestation.speakElement(blueprint);
    DOMElements.toastContainer.appendChild(toast);

    // B"H - Animation Initiation
    requestAnimationFrame(() => {
        toast.classList.add('ignited');
    });

    // B"H - Automatic dismantling after duration
    setTimeout(() => {
        toast.classList.remove('ignited');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode === DOMElements.toastContainer) {
                toast.remove();
            }
        }, { once: true });
    }, duration);
}
