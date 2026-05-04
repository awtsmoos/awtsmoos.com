
/**
 * @file dragSystem.js
 * @description
 * THE BALANCE OF MOTION (MISHKAL)
 * 
 * Chapter 15: The Translation of Intent.
 * When the user touches an item, the physical world must translate 
 * their intent into a spiritual change in the inventory.
 * We use bracket-notation access for decorated properties ("awtsmoosSlotData")
 * to ensure that even after the Tzimtzum of serialization, the data is found.
 */

export default function initDragSystem() {
    if (typeof window === 'undefined') return;
    

    if (!window.AwtsmoosDragSystem) {
        window.AwtsmoosDragSystem = {
            isDragging: false,
            activeSlot: null, 
            ghost: null,
            mousePos: { x: 0, y: 0 }, 
            hoveredSlot: null
        };
    }

    window.attachSlotDragListeners = function(el, slotData, source, index, ui, onClick) {
        if(!el) return;
        
        // B"H: Binding data directly to the vessel's physical body
        el["awtsmoosSlotData"] = slotData.item;
        el.dataset.source = source;
        el.dataset.index = index;

        const handleStart = (e) => {
            if (e.button === 2) return; // Ignore right-click
            
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
        };

        el.onmousedown = handleStart;
        el.ontouchstart = handleStart;
    };

    const handleMove = (e) => {
        const sys = window.AwtsmoosDragSystem;
        const touch = e.touches ? e.touches[0] : e;
        const x = touch.clientX;
        const y = touch.clientY;

        if (sys.isPotentialDrag) {
            const dx = x - sys.startPos.x;
            const dy = y - sys.startPos.y;
            if (Math.sqrt(dx*dx + dy*dy) > 10) {
                // B"H: silent

                sys.isPotentialDrag = false;
                sys.isDragging = true;
                sys.pendingClick = null;
                
                const ghost = document.getElementById('awtsmoos-drag-ghost');
                if (ghost && sys.activeSlot.item) {
                    const icon = sys.activeSlot.item.icon;
                    const isUrl = icon && (icon.includes('/') || icon.includes('data:'));
                    if (isUrl) {
                        ghost.style.backgroundImage = `url("${icon}")`;
                        ghost.textContent = "";
                    } else {
                        ghost.style.backgroundImage = "";
                        ghost.textContent = icon || "";
                        ghost.style.display = 'flex';
                        ghost.style.justifyContent = 'center';
                        ghost.style.alignItems = 'center';
                        ghost.style.fontSize = '32px';
                    }
                    ghost.classList.remove('hidden');
                }
            }
        }

        if (sys.isDragging) {
            const ghost = document.getElementById('awtsmoos-drag-ghost');
            if (ghost) {
                ghost.style.left = x + 'px';
                ghost.style.top = y + 'px';
            }
        }
    };

    const handleEnd = (e) => {
        const sys = window.AwtsmoosDragSystem;
        if (sys.isDragging) {
            executeDrop(e);
            sys.isDragging = false;
            const ghost = document.getElementById('awtsmoos-drag-ghost');
            if (ghost) ghost.classList.add('hidden');
        } else if (sys.isPotentialDrag) {
            if (sys.pendingClick) sys.pendingClick();
            sys.isPotentialDrag = false;
        }
    };

    function executeDrop(e) {
        const sys = window.AwtsmoosDragSystem;
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const ghost = document.getElementById('awtsmoos-drag-ghost');
        
        if (ghost) ghost.style.display = 'none';
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (ghost) ghost.style.display = 'block';

        const slot = target ? target.closest('.actionSlot') : null;
        if (slot && sys.activeSlot) {
            const ikar = document.getElementById('ikar');
            if (ikar) {
                ikar.dispatchEvent(new CustomEvent("olamPeula", {
                    detail: {
                        moveItem: { 
                            fromSource: sys.activeSlot.source, 
                            fromIndex: sys.activeSlot.index, 
                            toSource: slot.dataset.source, 
                            toIndex: parseInt(slot.dataset.index)
                        }
                    }
                }));
            }
        }
    }

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
}
