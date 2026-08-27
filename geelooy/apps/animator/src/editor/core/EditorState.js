
// B"H
/**
 * @file EditorState.js
 * @brief THE MEMORY OF CHOICES (Zikaron HaMetzaref).
 * 
 * CHAPTER 3: THE TAXONOMY OF EXISTENCE
 * The EditorState does not hold the character's data—that belongs to the 
 * Master State. This class holds the state *of the editor itself*. 
 * It remembers which tab is open, which slider is active, and how the 
 * menus are structured. 
 * 
 * THE POEM OF THE ORGANIZED MIND:
 * Not all of reality is seen at once,
 * For the eyes of the creator are not those of a dunce!
 * We split the world into layers of thought,
 * To find the specific spark that we sought.
 * Clothing and skin, and the blink of the eye,
 * Arranged in a grid, beneath the blue sky!
 */

export class EditorState {
    /**
     * @constructor
     * @param {EditorManager} editor - The orchestrator this state serves.
     */
    constructor(editor) {
        /** @type {EditorManager} */
        this.editor = editor;
        
        /** @type {string} The active dimension of the UI */
        this.activeTab = 'appearance';
        
        /** 
         * @type {Object.<string, Array.<string>>} 
         * @description The map connecting UI tabs to the properties in the PartsRegistry.
         */
        this.tabs = {
            appearance: [
                'skin', 
                'hairType', 
                'beard', 
                'eyebrowShape', 
                'eyes', 
                'mouth', 
                'emotion', 
                'earShape', 
                'flipX', 
                'isTalking'
            ],
            clothing: [
                'shirt', 
                'shirtColor', 
                'pantsStyle', 
                'pantsColor', 
                'hatType', 
                'hat'
            ],
            visibility: [
                'v_head', 
                'v_body', 
                'v_shirt', 
                'v_pants', 
                'v_hat', 
                'v_hands', 
                'v_eyebrows', 
                'v_cheeks'
            ],
            poses: [
                'pose'
            ]
        };
    }

    /**
     * @function setTab
     * @description Shifts the focus of the Creator to a new realm.
     * @param {string} tab - The destination name.
     */
    setTab(tab) {
        if (this.tabs[tab]) {
            this.activeTab = tab;
        }
    }
}
