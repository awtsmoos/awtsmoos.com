//B"H
/**
 * @file lens.js
 * @description The Scribe's Lens (Focus Mode).
 */

export function setupScribeLens() {
    const context = document.querySelector('.post-reader-localized-context');
    if (!context) return;
    
    let rafId;
    const updateCoordinates = (e) => {
        if(rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            context.style.setProperty('--mouse-x', `${e.clientX}px`);
            context.style.setProperty('--mouse-y', `${e.clientY}px`);
        });
    };

    const toggle = document.getElementById('focusModeToggle');
    if (toggle) {
        toggle.addEventListener('change', () => {
            if(toggle.checked) {
                context.classList.add('focus-mode-active');
                document.addEventListener('mousemove', updateCoordinates);
            } else {
                context.classList.remove('focus-mode-active');
                document.removeEventListener('mousemove', updateCoordinates);
            }
        });
    }
}