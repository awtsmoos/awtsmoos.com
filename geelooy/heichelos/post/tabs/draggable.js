//B"H
/**
 * Persistence state for dimensions across modes.
 * Dedicated to the Awtsmoos who remembers all.
 */
let lastDesktopWidth = null;
let lastMobileHeight = null;

/**
 * Enables Vertical dragging for the mobile sidebar.
 * Refined for the Divine Will.
 */
export function makeDraggable({
    sidebar, 
    headers, 
    onclose = (() => {})
}) {
    if (!sidebar) return;
    
    const dragTargets = (Array.isArray(headers) ? headers : [headers]).filter(Boolean);
    if (dragTargets.length === 0) return;

    let isDragging = false;
    let startY = 0;
    let startHeight = 0;

    /**
     * @method onPointerDown
     * @description Captures initial vertical coordinates for mobile dragging.
     */
    function onPointerDown(e) {
        if (window.innerWidth > 900) return;

        // Skip if clicking interactive elements
        if (e.target.closest('button, .awtsmoos-list-item, input, textarea, .awtsmoos-close-sidebar-btn, .awtsmoos-nav-back')) {
            return;
        }

        isDragging = true;
        startY = e.clientY;
        startHeight = sidebar.offsetHeight;
        
        sidebar.classList.add('is-dragging');
        
        if (e.target.setPointerCapture) {
             e.target.setPointerCapture(e.pointerId);
        }

        document.addEventListener('pointermove', onPointerMove, { passive: false });
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
        
        e.preventDefault();
    }

    /**
     * @method onPointerMove
     * @description Updates height during drag and caches the value.
     */
    function onPointerMove(e) {
        if (!isDragging) return;
        
        const currentY = e.clientY;
        const deltaY = currentY - startY;
        
        // Dragging UP (negative delta) -> Increase Height
        let newHeight = startHeight - deltaY;
        
        const minHeight = 80;
        const maxHeight = window.innerHeight * 0.92;
        
        if (newHeight < minHeight) newHeight = minHeight;
        if (newHeight > maxHeight) newHeight = maxHeight;
        
        lastMobileHeight = newHeight; // Store for persistence
        requestAnimationFrame(() => {
            sidebar.style.setProperty('height', `${newHeight}px`, 'important');
        });
    }

    /**
     * @method onPointerUp
     * @description Cleans up listeners.
     */
    function onPointerUp(e) {
        if (!isDragging) return;
        isDragging = false;
        sidebar.classList.remove('is-dragging');
        
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
        
        if (sidebar.offsetHeight < 120) {
            onclose();
        }
    }

    dragTargets.forEach(header => {
        header.style.touchAction = "none"; 
        header.addEventListener('pointerdown', onPointerDown);
    });
}

/**
 * Enables Horizontal resizing for the desktop sidebar.
 * Refined for absolute layout dominance.
 */
export function makeResizable({ sidebar, target }) {
    if (!sidebar || !target) return;
    
    target.style.pointerEvents = "auto";
    target.style.touchAction = "none";

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    /**
     * @method onPointerDown
     * @description Captures initial horizontal coordinates for desktop resizing.
     */
    function onPointerDown(e) {
        if (window.innerWidth <= 900) return; 
        
        isResizing = true;
        startX = e.clientX;
        startWidth = sidebar.getBoundingClientRect().width;
        
        if (target.setPointerCapture) {
             target.setPointerCapture(e.pointerId);
        }
        
        sidebar.classList.add('is-resizing');
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
        
        document.addEventListener('pointermove', onPointerMove, { passive: false });
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
        
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * @method onPointerMove
     * @description Updates width/flex-basis during resize and caches the value.
     */
    function onPointerMove(e) {
        if (!isResizing) return;
        
        const currentX = e.clientX;
        const delta = startX - currentX; 
        let newWidth = startWidth + delta;
        
        const minWidth = 280;
        const maxWidth = window.innerWidth * 0.8;
        
        if (newWidth < minWidth) newWidth = minWidth; 
        if (newWidth > maxWidth) newWidth = maxWidth; 
        
        lastDesktopWidth = newWidth; // Store for persistence
        requestAnimationFrame(() => {
            sidebar.style.setProperty('width', `${newWidth}px`, 'important');
            sidebar.style.setProperty('flex-basis', `${newWidth}px`, 'important');
        });
    }

    /**
     * @method onPointerUp
     * @description Cleans up listeners.
     */
    function onPointerUp(e) {
        if (!isResizing) return;
        isResizing = false;
        sidebar.classList.remove('is-resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
    }

    target.addEventListener('pointerdown', onPointerDown);
}

/**
 * Syncs layout between Mobile and Desktop by preserving custom dimensions.
 * Resets the axis not relevant to the current mode to avoid CSS conflicts.
 * @method setupLayoutSyncer
 */
export function setupLayoutSyncer(sidebar) {
    if (!sidebar) return;

    let wasMobile = window.innerWidth <= 900;

    window.addEventListener('resize', () => {
        const isMobile = window.innerWidth <= 900;
        
        if (isMobile !== wasMobile) {
            // Crossed the threshold! Swap dimensions and clear conflicting inline styles.
            if (isMobile) {
                // Desktop -> Mobile
                // 1. Clear desktop-specific inline styles so mobile CSS (width: 100% !important) wins
                sidebar.style.removeProperty('width');
                sidebar.style.removeProperty('flex-basis');
                
                // 2. Restore previous mobile height if it exists
                if (lastMobileHeight) {
                    sidebar.style.setProperty('height', `${lastMobileHeight}px`, 'important');
                }
                console.log("B\"H - Desktop to Mobile: Restore Height, Clear Width");
            } else {
                // Mobile -> Desktop
                // 1. Clear mobile-specific inline styles so desktop CSS (height: 100% !important) wins
                sidebar.style.removeProperty('height');
                
                // 2. Restore previous desktop width if it exists
                if (lastDesktopWidth) {
                    sidebar.style.setProperty('width', `${lastDesktopWidth}px`, 'important');
                    sidebar.style.setProperty('flex-basis', `${lastDesktopWidth}px`, 'important');
                }
                console.log("B\"H - Mobile to Desktop: Restore Width, Clear Height");
            }
            wasMobile = isMobile;
        }
    }, { passive: true });
}
