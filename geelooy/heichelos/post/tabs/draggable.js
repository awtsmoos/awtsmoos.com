//B"H
/**
 * @file draggable.js
 * @description 
 * The Physics Engine of the Sidebar.
 * FIXED: Re-enabled Desktop flex-basis manipulation for reliable resizing.
 */

let lastDesktopWidth = 420;
let lastMobileHeight = 400; 

export function makeResizable({ sidebar, target }) {
    if (!sidebar || !target) return;
    
    target.style.touchAction = "none";
    target.style.userSelect = "none";
    target.style.pointerEvents = "auto";

    let isResizing = false;
    let startVal = 0;
    let startDim = 0;
    let pointerId = null;

    target.addEventListener('pointerdown', (e) => {
        // Prevent scroll/selection interactions
        if(e.cancelable) e.preventDefault(); 
        e.stopPropagation();
        
        isResizing = true;
        pointerId = e.pointerId;
        target.setPointerCapture(pointerId);
        
        const isMobile = window.innerWidth <= 900;
        document.body.classList.add('resizing-active');
        sidebar.classList.add('is-resizing');

        if (isMobile) {
            startVal = e.clientY;
            startDim = sidebar.getBoundingClientRect().height;
        } else {
            startVal = e.clientX;
            startDim = sidebar.getBoundingClientRect().width;
        }
    });

    target.addEventListener('pointermove', (e) => {
        if (!isResizing || e.pointerId !== pointerId) return;
        if (e.cancelable) e.preventDefault();
        
        requestAnimationFrame(() => {
            const isMobile = window.innerWidth <= 900;
            const currentVal = isMobile ? e.clientY : e.clientX;
            
            // delta = start - current
            const delta = startVal - currentVal;
            
            if (isMobile) {
                let h = startDim + delta;
                h = Math.max(100, Math.min(h, window.innerHeight - 80));
                lastMobileHeight = h;
                sidebar.style.setProperty('height', `${h}px`, 'important');
                sidebar.style.removeProperty('width');
                sidebar.style.removeProperty('flex-basis');
            } else {
                let w = startDim + delta;
                w = Math.max(280, Math.min(w, window.innerWidth * 0.7));
                lastDesktopWidth = w;
                // ON DESKTOP, flex-basis is required for flex layouts to respect size
                sidebar.style.setProperty('width', `${w}px`, 'important');
                sidebar.style.setProperty('flex-basis', `${w}px`, 'important');
                sidebar.style.removeProperty('height');
            }
        });
    });

    const stop = (e) => {
        if (!isResizing) return;
        isResizing = false;
        document.body.classList.remove('resizing-active');
        sidebar.classList.remove('is-resizing');
        if (target.hasPointerCapture(pointerId)) {
            target.releasePointerCapture(pointerId);
        }
    };

    target.addEventListener('pointerup', stop);
    target.addEventListener('pointercancel', stop);
}

export function setupLayoutSyncer(sidebar) {
    if (!sidebar) return;
    let wasMobile = window.innerWidth <= 900;

    const sync = () => {
        const isMobile = window.innerWidth <= 900;
        if (isMobile !== wasMobile || !sidebar.style.height) {
            sidebar.style.cssText = ""; // Reset
            if (isMobile) {
                sidebar.style.height = `${lastMobileHeight}px`;
                sidebar.style.width = '100%';
            } else {
                sidebar.style.width = `${lastDesktopWidth}px`;
                sidebar.style.flexBasis = `${lastDesktopWidth}px`;
                sidebar.style.height = '100%';
            }
            wasMobile = isMobile;
        }
    };
    window.addEventListener('resize', sync);
    setTimeout(sync, 100);
}

export function makeDraggable() {}