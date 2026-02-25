
// B"H
// FILE: js/app/visual-controller.js

/**
 * @class VisualController
 * @description A vessel for the expansion and contraction of the world's 
 * visual form. It manages the 'boundaries of the universe'—the fullscreen 
 * state—allowing the editor to either shrink into a humble box or expand 
 * to occupy the totality of the screen.
 */
export class VisualController {
    /**
     * @method toggleDimension
     * @description Switches the reality of the display. Like the heartbeat 
     * of creation, it alternates between the limited and the limitless.
     */
    static toggleDimension() {
        const isFull = document.fullscreenElement;
        const action = isFull ? 'exitFullscreen' : 'requestFullscreen';
        const target = isFull ? document : document.documentElement;

        target[action]().catch(err => {
            console.error(`B"H: Visual expansion failed: ${err.message}`);
        });
    }
}
