
/**
 * @file animations.js
 * @description
 * Chapter 12: THE ASCENSION OF THE SPARKS
 * 
 * This module generates the physical vessels (rectangles) that rise 
 * from the bottom of the screen. We have simplified the math to ensure 
 * 60fps performance on all devices.
 */

export default {
    /**
     * @function ready
     * @description Initiates the drift of the sparks.
     */
    ready(me) {
        if (!me) return;
        me.isGoing = true;

        const createSpark = () => {
            if (!me.isGoing) return;
            
            const rect = document.createElement('div');
            const size = Math.random() * 5 + 2; // size in vmin
            
            rect.classList.add('rectangle');
            rect.style.width = `${size}vmin`;
            rect.style.height = `${size}vmin`;
            rect.style.left = `${Math.random() * 100}vw`;
            rect.style.bottom = `-10vmin`;
            rect.style.opacity = (Math.random() * 0.4 + 0.1).toString();
            
            me.appendChild(rect);

            const speed = Math.random() * 2 + 1; // vmin per frame equivalent
            let currentPos = -10;

            const animate = () => {
                if (!me.isGoing || !rect.parentNode) {
                    rect.remove();
                    return;
                }

                currentPos += speed * 0.5;
                rect.style.bottom = `${currentPos}vmin`;
                rect.style.transform = `rotate(${currentPos * 2}deg)`;

                if (currentPos < 110) {
                    requestAnimationFrame(animate);
                } else {
                    rect.remove();
                }
            };
            
            requestAnimationFrame(animate);
        };

        let counter = 0;
        const loop = () => {
            if (!me.isGoing) return;
            if (counter++ % 30 === 0) createSpark();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
};
