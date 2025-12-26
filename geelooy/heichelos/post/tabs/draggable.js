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
    let rafId = null;

    function onPointerDown(e) {
        if (window.innerWidth > 900) return;

        // Skip interactive elements
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
        
        // Prevent default touch actions (scrolling)
        e.preventDefault(); 
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            const currentY = e.clientY;
            const deltaY = currentY - startY;
            
            // Dragging UP (negative delta) -> Increase Height
            let newHeight = startHeight - deltaY;
            
            const minHeight = 80;
            const maxHeight = window.innerHeight * 0.95; // Little more space at top
            
            // Elasticity check (optional, here strict clamping)
            if (newHeight < minHeight) newHeight = minHeight;
            if (newHeight > maxHeight) newHeight = maxHeight;
            
            lastMobileHeight = newHeight;
            sidebar.style.setProperty('height', `${newHeight}px`, 'important');
        });
    }

    function onPointerUp(e) {
        if (!isDragging) return;
        isDragging = false;
        if(rafId) cancelAnimationFrame(rafId);
        
        sidebar.classList.remove('is-dragging');
        
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
        
        // Snap logic: if too small, close it.
        if (sidebar.offsetHeight < 150) {
            onclose();
        }
    }

    dragTargets.forEach(header => {
        header.style.touchAction = "none"; // Critical for mobile to prevent scroll interaction
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
    let rafId = null;

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

    function onPointerMove(e) {
        if (!isResizing) return;
        
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(() => {
            const currentX = e.clientX;
            const delta = startX - currentX; // Dragging left increases width if sidebar is on right
            // Sidebar is on right (border-left), but layout logic places sidebar last.
            // If sidebar is flex-basis, increasing width pushes content left.
            // Assuming sidebar is on the RIGHT side of the flex container:
            // Mouse moving LEFT (smaller X) should INCREASE width.
            
            // Wait, previous layout.js puts sidebar as second child in flex row.
            // Actually usually sidebars are on right.
            // Let's assume standard right sidebar:
            let newWidth = startWidth + delta;
            
            const minWidth = 280;
            const maxWidth = window.innerWidth * 0.7;
            
            if (newWidth < minWidth) newWidth = minWidth; 
            if (newWidth > maxWidth) newWidth = maxWidth; 
            
            lastDesktopWidth = newWidth; 
            sidebar.style.setProperty('width', `${newWidth}px`, 'important');
            sidebar.style.setProperty('flex-basis', `${newWidth}px`, 'important');
        });
    }

    function onPointerUp(e) {
        if (!isResizing) return;
        isResizing = false;
        if(rafId) cancelAnimationFrame(rafId);
        
        sidebar.classList.remove('is-resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
    }

    target.addEventListener('pointerdown', onPointerDown);
}

export function setupLayoutSyncer(sidebar) {
    if (!sidebar) return;

    let wasMobile = window.innerWidth <= 900;

    window.addEventListener('resize', () => {
        const isMobile = window.innerWidth <= 900;
        
        if (isMobile !== wasMobile) {
            if (isMobile) {
                // Desktop -> Mobile
                sidebar.style.removeProperty('width');
                sidebar.style.removeProperty('flex-basis');
                
                if (lastMobileHeight) {
                    sidebar.style.setProperty('height', `${lastMobileHeight}px`, 'important');
                }
            } else {
                // Mobile -> Desktop
                sidebar.style.removeProperty('height');
                
                if (lastDesktopWidth) {
                    sidebar.style.setProperty('width', `${lastDesktopWidth}px`, 'important');
                    sidebar.style.setProperty('flex-basis', `${lastDesktopWidth}px`, 'important');
                }
            }
            wasMobile = isMobile;
        }
    }, { passive: true });
}
