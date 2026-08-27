
// B"H
/**
 * @file TimelineGevurah.js
 * @brief THE UNBREAKABLE RESIZER (Achiza HaEtana).
 * 
 * CHAPTER 7: THE GRIP OF STRENGTH
 * In the World of Asiyah, listeners often die when their elements are 
 * recreated. To ensure the user can always resize the timeline, 
 * we bind the event to the root of the universe (the document).
 * 
 * RECTIFIED: We wrap the CSS variable injection in requestAnimationFrame
 * and defensively check for document.body existence to prevent zero-frame 
 * rendering crashes before the DOM is fully solidified.
 */

import { GridSeder } from '../../ui/layout/GridSeder.js';

export class TimelineGevurah {
    /**
     * @function activate
     * @description Sets up a global delegation for the timeline resizer.
     * @param {string} resizerId - The ID of the target element.
     */
    static activate(resizerId = 'h-resizer') {
        // B"H - Wait until the DOM is actually present to establish the laws of physics
        if (!document.body) {
            requestAnimationFrame(() => this.activate(resizerId));
            return;
        }

        let isDragging = false;

        const doResize = (e) => {
            if (!isDragging) return;
            
            // Capture client Y from touch or mouse
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            // Recalculate height relative to the viewport bottom
            const newHeight = window.innerHeight - clientY;

            // Enforce Tzimtzum (Restriction) limits
            if (newHeight >= 50 && newHeight <= window.innerHeight * 0.85) {
                // Batch DOM writes via RAF for extreme performance
                requestAnimationFrame(() => {
                    GridSeder.setTimelineHeight(newHeight);
                });
            }
        };

        const stopResize = () => {
            if (!isDragging) return;
            isDragging = false;
            
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            
            const shield = document.getElementById('gevurah-shield');
            if (shield) shield.remove();
        };

        // GLOBAL DELEGATION: The listeners are eternal!
        document.addEventListener('mousedown', (e) => {
            if (e.target && e.target.id === resizerId) {
                isDragging = true;
                document.body.style.cursor = 'row-resize';
                document.body.style.userSelect = 'none';

                // Summon the Invisible Shield
                let shield = document.getElementById('gevurah-shield');
                if (!shield) {
                    shield = document.createElement('div');
                    shield.id = 'gevurah-shield';
                    shield.style.cssText = `
                        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                        z-index: 999999; cursor: row-resize; background: transparent;
                    `;
                    document.body.appendChild(shield);
                }
            }
        });

        // Touch support for mobile emanations
        document.addEventListener('touchstart', (e) => {
            if (e.target && e.target.id === resizerId) {
                e.preventDefault(); 
                isDragging = true;
                document.body.style.userSelect = 'none';
            }
        }, { passive: false });

        document.addEventListener('mousemove', doResize);
        document.addEventListener('touchmove', doResize, { passive: false });
        
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchend', stopResize);

        console.log(`B"H - [Gevurah] Timeline Resizer is now eternally vigilant and DOM-safe.`);
    }
}
