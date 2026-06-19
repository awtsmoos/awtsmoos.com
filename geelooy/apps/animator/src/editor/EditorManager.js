
// B"H
/**
 * @file EditorManager.js
 * @brief THE MASTER WEAVER OF ATTRIBUTES (Sar HaMiddot).
 * 
 * CHAPTER 2: THE COORDINATION OF THE SEFIROT
 * A character is not a static image; it is a composition of infinite choices. 
 * The EditorManager is the intelligence (Binah) that organizes these choices.
 * 
 * RECTIFICATION (The Scroll Amnesia):
 * Previously, clicking a color swatch triggered a full `innerHTML` wipe, 
 * violently snapping the scrollbar back to the top of the heavens. 
 * Now, the Editor captures the physical `scrollTop` integer right before 
 * the wipe, and instantly re-applies it to the newly generated vessel, 
 * maintaining continuous spatial logic for the user.
 */

import { EditorLayout } from './layout/EditorLayout.js';
import { EditorListeners } from './core/listeners.js';
import { EditorState } from './core/EditorState.js';
import { EditorManifestor } from './state/EditorManifestor.js';
import { EditorDOM } from './utils/EditorDOM.js';

export class EditorManager {
    /**
     * @constructor
     * @param {AppCore} app 
     * @param {Object} partsData 
     */
    constructor(app, partsData) {
        this.app = app;
        this.state = app.state;
        this.partsData = partsData;
        this.editorState = new EditorState(this);
        this.container = EditorDOM.getContainer();
        
        if (!this.container) {
            console.warn("B\"H - The Makom (Place) for the Editor is not yet manifest.");
            return;
        }
        
        EditorManifestor.bindToState(this);
        this.render();
    }

    get activeTab() { return this.editorState.activeTab; }
    set activeTab(v) { 
        this.editorState.activeTab = v; 
        this.render(); 
    }

    get tabs() { return this.editorState.tabs; }

    /**
     * @function render
     * @description Translates the internal intent into physical DOM strings, saving the scroll state.
     */
    render() {
        if (!this.container) return;
        
        // 1. Capture the memory of position
        const scrollVessel = this.container.querySelector('.editor-content');
        const lastScrollY = scrollVessel ? scrollVessel.scrollTop : 0;
        
        // 2. The Shattering and Recreation
        this.container.innerHTML = EditorLayout.render(this);
        EditorListeners.bind(this);
        
        // 3. The Restoration of Place
        const newScrollVessel = this.container.querySelector('.editor-content');
        if (newScrollVessel) {
            newScrollVessel.scrollTop = lastScrollY;
        }
    }
}
