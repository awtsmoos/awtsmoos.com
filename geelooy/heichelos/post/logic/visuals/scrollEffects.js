//B"H
/**
 * @file scrollEffects.js
 * @description 
 * Handles Scroll Physics and Dark Matter textures.
 * Fixed: Static grain no longer re-renders on every scroll, saving CPU.
 */

export function setupScrollUnrollEffect() {
    const scroller = document.querySelector('.scroll-view-wrapper');
    if (!scroller) return;

    // 1. One-time Canvas Generation
    let canvas = document.getElementById('awtsmoos-scroll-fx');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'awtsmoos-scroll-fx';
        canvas.style.cssText = `
            position: fixed; top: 0; left: 0;
            width: 100vw; height: 100vh;
            pointer-events: none; z-index: 5;
            mix-blend-mode: overlay; opacity: 0.12;
        `;
        // Attach to root context to prevent scrolling with content
        const context = document.querySelector('.post-reader-localized-context');
        if(context) context.appendChild(canvas);
        else document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    
    const generateGrain = () => {
        const w = canvas.width = window.innerWidth;
        const h = canvas.height = window.innerHeight;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        
        for(let i=0; i<800; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            ctx.fillRect(x,y,1, 1 + Math.random() * 20);
        }
    };

    window.addEventListener('resize', () => requestAnimationFrame(generateGrain));
    generateGrain();

    // 2. Roller Parallax
    const topRoll = document.querySelector('.scroll-roll-top');
    const bottomRoll = document.querySelector('.scroll-roll-bottom');

    scroller.addEventListener('scroll', () => {
        if(!topRoll || !bottomRoll) return;
        const y = scroller.scrollTop;
        const shift = (y * 0.22).toFixed(1); 
        
        topRoll.style.backgroundPositionY = `${shift}px`;
        bottomRoll.style.backgroundPositionY = `${-shift}px`;
    }, { passive: true });
}