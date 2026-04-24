
/**
 * B"H
 * @module animations
 * @description
 * Like the Seraphim running and returning, the pulse of the Awtsmoos vibrates 
 * through every pixel on the screen. The letters of Aleph, Beis, Nun that form the 
 * "Even" (rock) are the same forces that cause these digital rectangles to ascend 
 * towards the heavens, yearning to reunite with their Source. 
 * 
 * Each frame rendered is a new creation from absolutely nothing. If the Creator 
 * were to withdraw His speech for even a fraction of an instant, the rectangles, 
 * the screen, the very concept of time would vanish into the Ayin (Nothingness).
 * But in His infinite kindness, the loop continues, the animation dances.
 */

export default {
    /**
     * @function ready
     * @description Initiates the eternal dance of the floating rectangles.
     * As they rise, they mirror the elevation of the physical world towards the spiritual.
     * @param {HTMLElement} me - The vessel (DOM element) containing the menu.
     * @returns {void} Returns nothing, but changes everything.
     */
    ready(me) {
        function createRectangle() {
            var rect = document.createElement('div');
            var size = Math.random() * (77 - 13) + 13; 
            rect.style.width = `${size}px`;
            rect.style.height = `${size}px`;
            rect.style.opacity = Math.random().toString();
            rect.style.left = `${Math.random() * window.innerWidth}px`; 
            rect.classList.add('rectangle');
            me.appendChild(rect);
            animateRectangle(rect, size);
        }
        
        function animateRectangle(rect, size) {
            let rectBottom = window.innerHeight;
        
            function moveUp() {
                rectBottom -= 2; 
                rect.style.bottom = `${rectBottom}px`;
        
                if (rectBottom > -size) {
                    requestAnimationFrame(moveUp);
                } else {
                    rect.remove();
                }
            }
        
            moveUp();
        }
        var frames = 0;
        me.isGoing = true;
        
        function makeRect() {
            if(!me.isGoing) return;
            frames++;
            if(frames %26 == 0) {
                frames = 0;
                createRectangle();
            }
            requestAnimationFrame(makeRect);
        }
        requestAnimationFrame(makeRect);
    }
};
