// B"H
export default function initDragSystem() {
    if (typeof window === 'undefined') return;
    
    console.log("B\"H: Initializing Drag System Logic with Vivid Effects");

    // Initialize State Container if missing
    if (!window.AwtsmoosDragSystem) {
        window.AwtsmoosDragSystem = {
            isDragging: false,
            isPotentialDrag: false,
            isManualDragging: false, // New state for click-move-click interaction
            startPos: { x: 0, y: 0 },
            activeSlot: null, 
            ghost: null,
            manualData: null, // Holds data for manual drag { amount, ... }
            pendingSplitCallback: null, // Callback for modal
            mousePos: { x: 0, y: 0 }, // Track globally for manual start
            hoveredSlot: null // TRACK THE GLOWING SLOT
        };
    }

    // Define/Redefine Global Functions (Allows Hot Reloading of Logic)
    
    window.getGhost = function() {
        if (!window.AwtsmoosDragSystem.ghost) {
            window.AwtsmoosDragSystem.ghost = document.getElementById('awtsmoos-drag-ghost');
            // Ensure ghost doesn't block mouse events for hover detection
            if(window.AwtsmoosDragSystem.ghost) {
                window.AwtsmoosDragSystem.ghost.style.pointerEvents = 'none';
            }
        }
        return window.AwtsmoosDragSystem.ghost;
    };

    window.attachSlotDragListeners = function(el, slotData, source, index, ui) {
        if(!el) return;
        // Store raw data on element for retrieval
        el.awtsmoosSlotData = { ...slotData, source, index };
        el.dataset.source = source;
        el.dataset.index = index;

        const handleStart = (e) => {
            // Allow Right Click (button 2) to pass through to onclick/context menu logic
            if (e.button === 2 || window.AwtsmoosDragSystem.isDragging || window.AwtsmoosDragSystem.isPotentialDrag || window.AwtsmoosDragSystem.isManualDragging) return;
            
            const touch = e.touches ? e.touches[0] : e;
            window.AwtsmoosDragSystem.isPotentialDrag = true;
            window.AwtsmoosDragSystem.startPos = { x: touch.clientX, y: touch.clientY };
            
            // Deep copy essential data to avoid reference issues
            window.AwtsmoosDragSystem.activeSlot = {
                item: slotData.item,
                source: source,
                index: index
            };
        };

        el.onmousedown = handleStart;
        el.ontouchstart = handleStart;
    };

    // New Function to start a manual drag (e.g. from Context Menu)
    window.startManualDrag = function(slotData, source, index, amount = null) {
        const sys = window.AwtsmoosDragSystem;
        sys.isManualDragging = true;
        
        // B"H: Ensure activeSlot matches automatic drag structure (item object, not wrapped)
        // slotData here IS the item object (passed from inventory context menu)
        sys.activeSlot = { item: slotData, source, index };
        sys.manualData = { amount };
        
        const ghost = window.getGhost();
        if (ghost) {
            const icon = slotData ? slotData.icon : '';
            ghost.style.backgroundImage = `url(${icon})`;
            ghost.classList.remove('hidden');
            // Use last known mouse pos
            ghost.style.left = sys.mousePos.x + 'px';
            ghost.style.top = sys.mousePos.y + 'px';
        }
        
        // Add body class to indicate dragging cursor
        document.body.style.cursor = 'grabbing';
    };

    function clearHoverEffects() {
        const sys = window.AwtsmoosDragSystem;
        if (sys.hoveredSlot) {
            sys.hoveredSlot.classList.remove('drag-hover-active');
            sys.hoveredSlot = null;
        }
        // Fallback cleanup
        document.querySelectorAll('.actionSlot.drag-hover-active').forEach(el => {
            el.classList.remove('drag-hover-active');
        });
    }

    // Internal Handlers
    function handleGlobalMove(e) {
        const touch = e.touches ? e.touches[0] : e;
        const x = touch.clientX;
        const y = touch.clientY;
        
        window.AwtsmoosDragSystem.mousePos = { x, y };

        const sys = window.AwtsmoosDragSystem;

        // 1. Potential Drag -> Actual Drag
        if (sys.isPotentialDrag) {
            const dx = x - sys.startPos.x;
            const dy = y - sys.startPos.y;
            
            // Threshold of 5px to differentiate click from drag
            if (Math.sqrt(dx*dx + dy*dy) > 5) {
                if (!sys.activeSlot || !sys.activeSlot.item) {
                        sys.isPotentialDrag = false;
                        return;
                }
                sys.isPotentialDrag = false;
                sys.isDragging = true;
                
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

        // 2. Active Drag Updates (Automatic or Manual)
        if (sys.isDragging || sys.isManualDragging) {
            if (e.preventDefault && !e.touches) e.preventDefault(); 
            
            const ghost = window.getGhost();
            if (ghost) {
                ghost.style.left = x + 'px';
                ghost.style.top = y + 'px';
            }

            // --- VIVID HOVER EFFECT LOGIC ---
            // Because ghost has pointer-events: none, we can hit the element below directly.
            const targetEl = document.elementFromPoint(x, y);
            const slotEl = targetEl ? targetEl.closest('.actionSlot') : null;

            // If we found a NEW slot, update effects
            if (slotEl !== sys.hoveredSlot) {
                clearHoverEffects(); // Remove highlight from old one
                
                if (slotEl && slotEl.dataset.source) {
                     // Only highlight if it's a valid slot
                     slotEl.classList.add('drag-hover-active');
                     sys.hoveredSlot = slotEl; // TRACK IT
                }
            }
        }
    }

    function handleGlobalEnd(e) {
        const sys = window.AwtsmoosDragSystem;
        const wasDragging = sys.isDragging;
        const wasManual = sys.isManualDragging;
        
        // Update mouse pos just in case
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const x = touch.clientX;
        const y = touch.clientY;

        if (wasDragging) {
            // End standard drag on mouse up
            executeDrop(x, y);
            sys.isDragging = false;
            sys.isPotentialDrag = false;
            cleanupDrag();
        } else if (wasManual) {
            // End manual drag on CLICK (mouseup)
            // Check if we have a hovered slot (trust the visual!)
             if (sys.hoveredSlot) {
                 executeDrop(x, y);
                 sys.isManualDragging = false;
                 cleanupDrag();
             } else {
                 // If clicked outside a valid slot, cancel.
                 // Check element from point just in case hover logic missed (rare)
                 const targetEl = document.elementFromPoint(x, y);
                 if (!targetEl || !targetEl.closest('.actionSlot')) {
                     sys.isManualDragging = false;
                     cleanupDrag();
                 }
             }
        } else {
            sys.isPotentialDrag = false;
        }
    }
    
    function cleanupDrag() {
        const ghost = window.getGhost();
        if (ghost) ghost.classList.add('hidden');
        clearHoverEffects();
        document.body.style.cursor = '';
        window.AwtsmoosDragSystem.activeSlot = null;
        window.AwtsmoosDragSystem.manualData = null;
    }

    function executeDrop(x, y) {
        console.log("B\"H: executeDrop called", x, y);
        const sys = window.AwtsmoosDragSystem;
        
        // STRATEGY: Trust the Hovered Slot first.
        // If visuals were showing a valid target, that IS the target.
        let slotEl = sys.hoveredSlot;

        // B"H FIX: Ensure we are interacting with the live DOM
        // If the inventory re-rendered during dragging, the hovered element might be detached.
        if (slotEl && !slotEl.isConnected) {
            console.log("B\"H: Hovered slot is detached from DOM. Recalculating.");
            slotEl = null; // Force re-acquisition via elementFromPoint
        }

        // Fallback: If no hovered slot recorded (e.g. fast movement or stale reference), try elementFromPoint
        if (!slotEl) {
             // Hide ghost temporarily to pick element underneath
             const ghost = window.getGhost();
             const ghostDisplay = ghost ? ghost.style.display : '';
             if(ghost) ghost.style.display = 'none';
             
             const targetEl = document.elementFromPoint(x, y);
             
             if(ghost) ghost.style.display = ghostDisplay;

             slotEl = targetEl ? targetEl.closest('.actionSlot') : null;
             console.log("B\"H: Fallback elementFromPoint result:", slotEl);
        }
        
        if (slotEl && slotEl.dataset.source && sys.activeSlot) {
            const toSource = slotEl.dataset.source;
            const toIndex = parseInt(slotEl.dataset.index);
            
            // Params
            const fromSource = sys.activeSlot.source;
            const fromIndex = sys.activeSlot.index;
            const amount = sys.manualData ? sys.manualData.amount : null;

            console.log("B\"H: Drop Targets:", { toSource, toIndex });
            console.log("B\"H: Drop Source:", { fromSource, fromIndex });

            // B"H FIX: Robust finding of 'ikar' element.
            // 1. Try by ID
            let ikar = document.getElementById('ikar');
            
            // 2. Try via UI library map if ID failed (since shaym doesn't always set ID)
            if (!ikar && window.ui && typeof window.ui.getHtml === 'function') {
                console.log("B\"H: 'ikar' not found by ID, attempting window.ui.getHtml('ikar')");
                ikar = window.ui.getHtml('ikar');
            }

            if (ikar) {
                console.log("B\"H: Dispatching Move Item Event to Ikar");
                
                ikar.dispatchEvent(new CustomEvent("olamPeula", {
                    detail: {
                        moveItem: {
                            fromSource,
                            fromIndex,
                            toSource,
                            toIndex,
                            amount
                        }
                    }
                }));
            } else {
                console.error("B\"H: 'ikar' element not found via DOM ID or UI Map! Cannot dispatch event. Check if UI is initialized or shaym is correct.");
                console.log("Window UI:", window.ui);
            }
        } else {
            console.log("B\"H: Drop failed. Invalid target or no active slot.", {
                hasSlotEl: !!slotEl,
                hasSource: slotEl ? slotEl.dataset.source : 'N/A',
                hasActiveSlot: !!sys.activeSlot
            });
        }
    }

    // Cleanup old listeners if re-initializing
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