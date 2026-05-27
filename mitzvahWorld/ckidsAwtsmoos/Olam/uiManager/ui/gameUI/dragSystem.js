
// B"H
export default function initDragSystem() {
    if (typeof window === 'undefined') return;
    
    console.log("B\"H: Initializing Drag System Logic with Vivid Effects");

    // Initialize State Container if missing
    if (!window.AwtsmoosDragSystem) {
        window.AwtsmoosDragSystem = {
            isDragging: false,
            isPotentialDrag: false,
            isManualDragging: false, 
            startPos: { x: 0, y: 0 },
            activeSlot: null, 
            ghost: null,
            manualData: null, 
            pendingSplitCallback: null,
            mousePos: { x: 0, y: 0 }, 
            hoveredSlot: null,
            pendingClickCallback: null // B"H: Store click handler here
        };
    }

    window.getGhost = function() {
        if (!window.AwtsmoosDragSystem.ghost) {
            window.AwtsmoosDragSystem.ghost = document.getElementById('awtsmoos-drag-ghost');
            if(window.AwtsmoosDragSystem.ghost) {
                window.AwtsmoosDragSystem.ghost.style.pointerEvents = 'none';
            }
        }
        return window.AwtsmoosDragSystem.ghost;
    };

    // B"H: Updated to accept onClick callback
    window.attachSlotDragListeners = function(el, slotData, source, index, ui, onClick) {
        if(!el) return;
        
        el.awtsmoosSlotData = { ...slotData, source, index };
        el.dataset.source = source;
        el.dataset.index = index;

        const handleStart = (e) => {
            // Allow Right Click to pass through
            if (e.button === 2) return;
            
            // If dragging active, ignore
            if (window.AwtsmoosDragSystem.isDragging || window.AwtsmoosDragSystem.isPotentialDrag || window.AwtsmoosDragSystem.isManualDragging) return;
            
            const touch = e.touches ? e.touches[0] : e;
            window.AwtsmoosDragSystem.isPotentialDrag = true;
            window.AwtsmoosDragSystem.startPos = { x: touch.clientX, y: touch.clientY };
            
            window.AwtsmoosDragSystem.activeSlot = {
                item: slotData.item,
                source: source,
                index: index
            };
            
            // B"H: Store the specific click handler for this slot
            window.AwtsmoosDragSystem.pendingClickCallback = (evt) => {
                 // console.log("B\"H DragSystem: Executing pending click callback for slot", index, source);
                 if (typeof onClick === 'function') onClick(evt);
            };
        };

        el.onmousedown = handleStart;
        el.ontouchstart = handleStart;
    };

    window.startManualDrag = function(slotData, source, index, amount = null) {
        const sys = window.AwtsmoosDragSystem;
        sys.isManualDragging = true;
        
        sys.activeSlot = { item: slotData, source, index };
        sys.manualData = { amount };
        
        const ghost = window.getGhost();
        if (ghost) {
            const icon = slotData ? slotData.icon : '';
            ghost.style.backgroundImage = `url(${icon})`;
            ghost.classList.remove('hidden');
            ghost.style.left = sys.mousePos.x + 'px';
            ghost.style.top = sys.mousePos.y + 'px';
        }
        document.body.style.cursor = 'grabbing';
    };

    function clearHoverEffects() {
        const sys = window.AwtsmoosDragSystem;
        if (sys.hoveredSlot) {
            sys.hoveredSlot.classList.remove('drag-hover-active');
            sys.hoveredSlot = null;
        }
        document.querySelectorAll('.actionSlot.drag-hover-active').forEach(el => {
            el.classList.remove('drag-hover-active');
        });
    }

    function handleGlobalMove(e) {
        const touch = e.touches ? e.touches[0] : e;
        const x = touch.clientX;
        const y = touch.clientY;
        
        window.AwtsmoosDragSystem.mousePos = { x, y };
        const sys = window.AwtsmoosDragSystem;

        if (sys.isPotentialDrag) {
            const dx = x - sys.startPos.x;
            const dy = y - sys.startPos.y;
            
            // 5px threshold
            if (Math.sqrt(dx*dx + dy*dy) > 5) {
                if (!sys.activeSlot || !sys.activeSlot.item) {
                        sys.isPotentialDrag = false;
                        return;
                }
                sys.isPotentialDrag = false;
                sys.isDragging = true;
                sys.pendingClickCallback = null; // Cancel click if drag starts
                
                const ghost = window.getGhost();
                if (ghost) {
                    ghost.style.backgroundImage = `url(${sys.activeSlot.item.icon})`;
                    ghost.classList.remove('hidden');
                    ghost.style.left = x + 'px';
                    ghost.style.top = y + 'px';
                }
                document.body.style.cursor = 'grabbing';
            }
        }

        if (sys.isDragging || sys.isManualDragging) {
            if (e.preventDefault && !e.touches) e.preventDefault(); 
            
            const ghost = window.getGhost();
            if (ghost) {
                ghost.style.left = x + 'px';
                ghost.style.top = y + 'px';
            }

            const targetEl = document.elementFromPoint(x, y);
            const slotEl = targetEl ? targetEl.closest('.actionSlot') : null;

            if (slotEl !== sys.hoveredSlot) {
                clearHoverEffects();
                if (slotEl && slotEl.dataset.source) {
                     slotEl.classList.add('drag-hover-active');
                     sys.hoveredSlot = slotEl; 
                }
            }
        }
    }

    function handleGlobalEnd(e) {
        const sys = window.AwtsmoosDragSystem;
        const wasDragging = sys.isDragging;
        const wasManual = sys.isManualDragging;
        const wasPotential = sys.isPotentialDrag;
        
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const x = touch.clientX;
        const y = touch.clientY;

        if (wasDragging) {
            executeDrop(x, y);
            sys.isDragging = false;
            cleanupDrag();
        } else if (wasManual) {
             if (sys.hoveredSlot) {
                 executeDrop(x, y);
                 sys.isManualDragging = false;
                 cleanupDrag();
             } else {
                 const targetEl = document.elementFromPoint(x, y);
                 if (!targetEl || !targetEl.closest('.actionSlot')) {
                     sys.isManualDragging = false;
                     cleanupDrag();
                 }
             }
        } else if (wasPotential) {
            // B"H: If we were potentially dragging but didn't move far enough, it's a CLICK.
            // Execute the stored callback.
            // console.log("B\"H DragSystem: Potential drag ended without movement - firing CLICK callback");
            if (sys.pendingClickCallback) {
                // Ensure target is valid (might need to find the specific slot again if mouse moved slightly)
                // For simplicity, pass the event we have.
                try {
                    sys.pendingClickCallback(e);
                } catch(err) {
                    console.error("B\"H Error in click callback:", err);
                }
            } else {
                // console.warn("B\"H DragSystem: No pending click callback found despite potential state");
            }
            sys.isPotentialDrag = false;
            sys.pendingClickCallback = null;
        }
    }
    
    function cleanupDrag() {
        const ghost = window.getGhost();
        if (ghost) ghost.classList.add('hidden');
        clearHoverEffects();
        document.body.style.cursor = '';
        window.AwtsmoosDragSystem.activeSlot = null;
        window.AwtsmoosDragSystem.manualData = null;
        window.AwtsmoosDragSystem.pendingClickCallback = null;
    }

    function executeDrop(x, y) {
        const sys = window.AwtsmoosDragSystem;
        let slotEl = sys.hoveredSlot;

        if (slotEl && !slotEl.isConnected) slotEl = null;

        if (!slotEl) {
             const ghost = window.getGhost();
             const ghostDisplay = ghost ? ghost.style.display : '';
             if(ghost) ghost.style.display = 'none';
             
             const targetEl = document.elementFromPoint(x, y);
             if(ghost) ghost.style.display = ghostDisplay;

             slotEl = targetEl ? targetEl.closest('.actionSlot') : null;
        }
        
        if (slotEl && slotEl.dataset.source && sys.activeSlot) {
            const toSource = slotEl.dataset.source;
            const toIndex = parseInt(slotEl.dataset.index);
            const fromSource = sys.activeSlot.source;
            const fromIndex = sys.activeSlot.index;
            const amount = sys.manualData ? sys.manualData.amount : null;

            let ikar = document.getElementById('ikar');
            if (!ikar && window.ui && typeof window.ui.getHtml === 'function') {
                ikar = window.ui.getHtml('ikar');
            }

            if (ikar) {
                ikar.dispatchEvent(new CustomEvent("olamPeula", {
                    detail: {
                        moveItem: { fromSource, fromIndex, toSource, toIndex, amount }
                    }
                }));
            }
        }
    }

    if (window._awtsmoosDragCleanup) window._awtsmoosDragCleanup();
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);

    window._awtsmoosDragCleanup = () => {
        window.removeEventListener('mousemove', handleGlobalMove);
        window.removeEventListener('touchmove', handleGlobalMove);
        window.removeEventListener('mouseup', handleGlobalEnd);
        window.removeEventListener('touchend', handleGlobalEnd);
    };
}
