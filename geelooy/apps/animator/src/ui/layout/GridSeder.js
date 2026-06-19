
// B"H
/**
 * @file GridSeder.js
 * @brief THE ORDER OF BOUNDARIES (Seder HaGvulot).
 * 
 * CHAPTER 6: THE ARCHITECTURE OF PROPORTION
 * The Awtsmoos established the boundaries for the seas and the dry land. 
 * This class establishes the CSS variables that dictate the proportions 
 * of our digital universe.
 * 
 * THE POEM OF THE GRID:
 * Three hundred pixels for the sidebar to stand,
 * A vertical pillar across the whole land!
 * The timeline is short, to let the world breathe,
 * While underneath, many variables seethe.
 * We resize and shift, we adapt and we change,
 * Within the mathematical, physical range!
 */

export class GridSeder {
    /**
     * @function init
     * @description Bestows the initial physical constants upon the document.
     */
    static init() {
        const root = document.documentElement;
        const isMobile = window.innerWidth <= 1024;
        
        // THE TZIMTZUM CONSTANTS
        root.style.setProperty('--sidebar-w', isMobile ? '85vw' : '360px');
        root.style.setProperty('--inspector-w', isMobile ? '0px' : '320px');
        
        // A compact timeline (180px) to maximize the Canvas stage
        root.style.setProperty('--timeline-h', isMobile ? '240px' : '180px'); 
        root.style.setProperty('--resizer-size', '6px'); 

        // Rhythmic response to the changing window dimensions
        window.addEventListener('resize', () => {
            const isMobileNow = window.innerWidth <= 1024;
            root.style.setProperty('--sidebar-w', isMobileNow ? '85vw' : '360px');
        });
    }

    /**
     * @function setTimelineHeight
     * @description Modifies the horizontal boundary of Malchut (Time).
     * @param {number} pixels - The new height from the bottom of the screen.
     */
    static setTimelineHeight(pixels) {
        document.documentElement.style.setProperty('--timeline-h', `${pixels}px`);
    }
}
