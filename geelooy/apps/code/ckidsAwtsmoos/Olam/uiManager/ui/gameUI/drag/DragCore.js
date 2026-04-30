
// B"H
import DragState from "./DragState.js";
import DragGhostManager from "./DragGhostManager.js";
import DragLogger from "./DragLogger.js";

/**
 * @class DragCore
 * @description
 * ⚖️ CHAPTER 4: THE UNIFICATION OF INTENT AND MOTION (YESOD) ⚖️
 * 
 * "He forms the light and creates the darkness." 
 * The DragCore is the foundation. It listens to the physical mouse and touch events,
 * routes them into the spiritual DragState, updates the DragGhostManager, and finally,
 * upon the release of the finger, it dispatches the ultimate decree (moveItem) into 
 * the Olam via the central Ikar bus.
 */
export default class DragCore {
    /**
     * @method init
     * @description Binds the global listeners and instantiates the shared state.
     */
    static init() {
        if (typeof window === 'undefined') return;
        DragLogger.log('ACTION', 'INTENSE MOVEMENT SCALES BALANCED. Core systems online.');
        
        window.AwtsmoosDragSystem = new DragState();

        window.attachSlotDragListeners = this.attachSlotDragListeners.bind(this);
        
        window.addEventListener('mousemove', this.handleMove.bind(this));
        window.addEventListener('mouseup', this.handleEnd.bind(this));
        window.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        window.addEventListener('touchend', this.handleEnd.bind(this));
    }

    /**
     * @method attachSlotDragListeners
     * @description Anoints a physical HTML slot with the capacity to be dragged.
     * @param {HTMLElement} el 
     * @param {Object} slotData 
     * @param {string} source 
     * @param {number} index 
     * @param {Object} ui 
     * @param {Function} onClick 
     */
    static attachSlotDragListeners(el, slotData, source, index, ui, onClick) {
        if (!el) {
            DragLogger.log('CRITICAL', 'Attempted to bind drag to the void (null element).');
            return;
        }
        
        // Storing the divine spark data directly on the HTML node
        el["awtsmoosSlotData"] = slotData.item;
        el.dataset.source = source;
        el.dataset.index = index;

        const handleStart = (e) => {
            if (e.button === 2) return; // Right-click brings up context menu, not drag
            
            const sys = window.AwtsmoosDragSystem;
            if (sys.isDragging) return;
            
            const touch = e.touches ? e.touches[0] : e;
            sys.startPos = { x: touch.clientX, y: touch.clientY };
            sys.isPotentialDrag = true;
            
            sys.activeSlot = {
                item: el["awtsmoosSlotData"],
                source: source,
                index: index,
                element: el
            };
            
            sys.pendingClick = () => { if(typeof onClick === 'function') onClick(e); };
            DragLogger.log('INFO', 'Potential grab on [' + (slotData.item ? slotData.item.name : 'Empty Slot') + ']');
        };

        el.onmousedown = handleStart;
        el.ontouchstart = handleStart;
    }

    /**
     * @method handleMove
     * @description Tracks the motion of the pointer.
     */
    static handleMove(e) {
        const sys = window.AwtsmoosDragSystem;
        if (!sys) return;

        const touch = e.touches ? e.touches[0] : e;
        const x = touch.clientX;
        const y = touch.clientY;

        if (sys.isPotentialDrag) {
            const dx = x - sys.startPos.x;
            const dy = y - sys.startPos.y;
            // If moved more than 10 pixels, it is a drag, not a click
            if (Math.sqrt(dx*dx + dy*dy) > 10) {
                DragLogger.log('ACTION', '💥 Item Ripped from Slot! Entering Drag state.');
                sys.isPotentialDrag = false;
                sys.isDragging = true;
                sys.pendingClick = null;
                
                if (sys.activeSlot.item) {
                    DragGhostManager.show(x, y, sys.activeSlot.item.icon);
                }
            }
        }

        if (sys.isDragging) {
            DragGhostManager.update(x, y);
        }
    }

    /**
     * @method handleEnd
     * @description The release of the will. Either click or drop.
     */
    static handleEnd(e) {
        const sys = window.AwtsmoosDragSystem;
        if (!sys) return;

        if (sys.isDragging) {
            this.executeDrop(e);
            DragGhostManager.hide();
            sys.reset();
        } else if (sys.isPotentialDrag) {
            // It was just a click
            if (sys.pendingClick) sys.pendingClick();
            sys.reset();
        }
    }

    /**
     * @method executeDrop
     * @description Determines what vessel the ghost was dropped into and dispatches the decree.
     */
    static executeDrop(e) {
        const sys = window.AwtsmoosDragSystem;
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        
        DragGhostManager.hide();
        
        // Find what is underneath the cursor
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const slot = target ? target.closest('.actionSlot') : null;
        
        if (slot && sys.activeSlot) {
            const ikar = document.getElementById('ikar');
            if (ikar) {
                const toSource = slot.dataset.source;
                const toIndex = parseInt(slot.dataset.index);
                
                DragLogger.log('ACTION', '☄️ Slamming Item into new Vessel! ' + sys.activeSlot.source + '[' + sys.activeSlot.index + '] -> ' + toSource + '[' + toIndex + ']');
                
                // Dispatching the event back to the Olam via the central nervous system
                ikar.dispatchEvent(new CustomEvent("olamPeula", {
                    detail: {
                        moveItem: { 
                            fromSource: sys.activeSlot.source, 
                            fromIndex: sys.activeSlot.index, 
                            toSource: toSource, 
                            toIndex: toIndex
                        }
                    }
                }));
            }
        } else {
            DragLogger.log('INFO', 'Item dropped into the void. Returning to original vessel.');
        }
    }
}
