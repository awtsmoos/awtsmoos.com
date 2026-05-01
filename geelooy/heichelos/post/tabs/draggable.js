
//B"H
/**
 * @file draggable.js
 * @description 
 * The Physics Engine of the Sidebar.
 * FIXED: Global body modifications removed. Safely isolated to the local context.
 */
import { performGeometricCheck } from '../logic/visuals/observer.js';

let lastDesktopWidth = 420;
let lastMobileHeight = 400; 

export function makeResizable({ sidebar, target }) {
    if (!sidebar || !target) return;
    
    target.style.touchAction = "none";
    target.style.userSelect = "none";
    target.style.pointerEvents = "auto";

    let isResizing = false;
    let pointerId = null;
    const rootContext = document.querySelector('.post-reader-localized-context');

    target.addEventListener('pointerdown', (e) => {
        if(e.cancelable) e.preventDefault(); 
        e.stopPropagation();
        
        isResizing = true;
        pointerId = e.pointerId;
        target.setPointerCapture(pointerId);
        
        const isMobile = window.innerWidth <= 900;
        if(rootContext) rootContext.classList.add('resizing-active');
        sidebar.classList.add('is-resizing');

        if(!isMobile) {
            document.documentElement.style.setProperty('--sidebar-width', `${sidebar.getBoundingClientRect().width}px`);
        }
    });

    target.addEventListener('pointermove', (e) => {
        if (!isResizing || e.pointerId !== pointerId) return;
        if (e.cancelable) e.preventDefault();
        
        requestAnimationFrame(() => {
            const isMobile = window.innerWidth <= 900;
            
            if (isMobile) {
                let h = window.innerHeight - e.clientY;
                h = Math.max(100, Math.min(h, window.innerHeight - 80));
                
                lastMobileHeight = h;
                sidebar.style.setProperty('height', `${h}px`, 'important');
                sidebar.style.removeProperty('width');
                sidebar.style.removeProperty('flex-basis');
            } else {
                let w = window.innerWidth - e.clientX;
                w = Math.max(280, Math.min(w, window.innerWidth * 0.7));
                
                lastDesktopWidth = w;
                sidebar.style.setProperty('width', `${w}px`, 'important');
                sidebar.style.setProperty('flex-basis', `${w}px`, 'important');
                sidebar.style.removeProperty('height');
                document.documentElement.style.setProperty('--sidebar-width', `${w}px`);
            }
        });
    });

    const stop = (e) => {
        if (!isResizing) return;
        isResizing = false;
        if(rootContext) rootContext.classList.remove('resizing-active');
        sidebar.classList.remove('is-resizing');
        if (target.hasPointerCapture(pointerId)) {
            target.releasePointerCapture(pointerId);
        }
        performGeometricCheck();
    };

    target.addEventListener('pointerup', stop);
    target.addEventListener('pointercancel', stop);
}

export function setupLayoutSyncer(sidebar) {
    if (!sidebar) return;
    let wasMobile = window.innerWidth <= 900;

    const sync = () => {
        const isMobile = window.innerWidth <= 900;
        if (isMobile !== wasMobile) {
            sidebar.style.width = '';
            sidebar.style.height = '';
            sidebar.style.flexBasis = '';

            if (isMobile) {
                sidebar.style.height = `${lastMobileHeight}px`;
            } else {
                sidebar.style.width = `${lastDesktopWidth}px`;
                sidebar.style.flexBasis = `${lastDesktopWidth}px`;
            }
            wasMobile = isMobile;
        }
    };
    window.addEventListener('resize', sync);
    setTimeout(sync, 100);
}
