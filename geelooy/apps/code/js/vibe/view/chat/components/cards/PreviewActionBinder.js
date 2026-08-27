
/**
 * @file PreviewActionBinder.js
 * @brief THE THREADS OF ACTION: Connecting visual vessels to spiritual intent.
 * 
 * CHAPTER LXXXVII: THE RECTIFICATION OF CHOICE
 * A click is an expression of will. If the will points to a vessel 
 * but the system opens another, the observer is lost in confusion. 
 * This module binds the buttons on the manifestation card to 
 * their undeniable physical identities.
 * 
 * It has been rectified to use the absolute path and the original 
 * project realm (Workspace). Now, when the user touches a card, 
 * the system accurately manifestations the Editor or the Preview 
 * for that specific spark, revealing the fruit of the AI's labor.
 */

export const PreviewActionBinder = {
    /**
     * B"H - Binds click events to the finalized Manifestation Card.
     * 
     * @param {HTMLElement} cardDOM - The physical UI card.
     * @param {Object} changeObj - The data representing the change.
     * @param {Object} tab - The Vibe session context.
     * @param {Object} controller - The Vibe controller.
     * @param {boolean} isHtmlType - True if the file is an HTML raiment.
     */
    bind(cardDOM, changeObj, tab, controller, isHtmlType) {
        // 1. Forge the absolute coordinate model
        const targetVessel = {
            path: changeObj.path,
            name: changeObj.path.split('/').pop(),
            workspaceId: tab.item.workspaceId,
            kind: 'file',
            type: tab.item.originalType || tab.item.type,
            originalType: tab.item.originalType || tab.item.type
        };

        // 2. Bind the Magical Preview Button (Chesed)
        if (isHtmlType) {
            const playBtn = cardDOM.querySelector('.play-preview-btn');
            if (playBtn) {
                playBtn.onclick = (e) => {
                    e.stopPropagation(); // Avoid triggering the outer card click
                    console.log(`B"H [ActionBinder] Opening Preview Vision: ${targetVessel.path}`);
                    
                    import('../../../../../actions/index.js').then(m => {
                        m.Actions.handle('view-html', targetVessel);
                    });
                };
            }
        }
        
        // 3. Bind the Overarching Card Click (The Editor Vision)
        cardDOM.onclick = (e) => {
            if (!e.target.closest('.play-preview-btn')) {
                console.log(`B"H [ActionBinder] Opening Editor vision: ${targetVessel.path}`);
                
                // Inform the controller to manifest a new tab for this specific file
                controller.previewFile(tab, targetVessel.path);
            }
        };

        cardDOM.style.cursor = 'pointer';
    }
};
