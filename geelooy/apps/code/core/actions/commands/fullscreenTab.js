
// B"H
/**
 * @file fullscreenTab.js
 * @brief THE INFINITE HORIZON.
 * 
 * POEM OF THE EXPANSION:
 * One vessel grows to encompass the whole,
 * Reflecting the breadth of the digital soul.
 * The sidebars recede, the borders are gone,
 * From evening's focus to a wide-awake dawn.
 * The Awtsmoos is Simple, the Awtsmoos is Wide,
 * In this massive vision, the Truth can reside.
 */

/**
 * @class FullscreenTabCommand
 * @description Toggles the workspace layout to hide sidebars and maximize the active tab area.
 */
export class FullscreenTabCommand {
    /**
     * B"H - Executes the expansion or contraction of the UI.
     */
    static run() {
        const layoutRoot = document.getElementById('main-layout-root');
        if (!layoutRoot) return;

        const isFullscreen = layoutRoot.classList.toggle('awtsmoos-fullscreen-mode');
        
        console.log(`B"H - Fullscreen: Mode ${isFullscreen ? 'Engaged' : 'Dismissed'}.`);
        
        // Trigger resize events for any canvases (like WebGL) inside
        window.dispatchEvent(new Event('resize'));
    }
}

export const run = () => FullscreenTabCommand.run();
