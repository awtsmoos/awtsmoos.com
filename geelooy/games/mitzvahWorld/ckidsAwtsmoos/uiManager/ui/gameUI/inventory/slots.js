
// B"H 
export default function updateSlots(e, $, ui) {
    const data = e.detail || e;
    const slotsData = data.slots || (Array.isArray(data) ? data : []); 
    const containerMode = !!data.containerMode;
    const containerName = data.containerName;

    const inventoryElement = $("inventoryScreen");
    if (!inventoryElement) return;
    
    const titleEl = inventoryElement.querySelector(".header .text");
    const header = inventoryElement.querySelector(".header");
    const body = inventoryElement.querySelector(".main-slots-holder");
    const backBtn = inventoryElement.querySelector(".back-inv-btn");

    if(titleEl) {
        if(containerMode) {
            titleEl.textContent = containerName || "Container";
            if(header) header.style.backgroundColor = "rgba(50, 20, 0, 0.8)"; 
            if(body) body.style.backgroundColor = "rgba(30, 15, 5, 0.6)";
        } else {
            titleEl.textContent = "Inventory";
            if(header) header.style.backgroundColor = ""; 
            if(body) body.style.backgroundColor = "";
        }
    }
    
    if(backBtn) {
        if(containerMode) {
                backBtn.classList.remove("hidden");
                backBtn.style.display = "block";
        } else {
                backBtn.classList.add("hidden");
                backBtn.style.display = "none";
        }
    }

    const slotsContainer = inventoryElement.querySelector(".slots");
    if (!slotsContainer) return;
    slotsContainer.innerHTML = '';

    if(Array.isArray(slotsData)) {
        slotsData.forEach((slotData, index) => {
            
            let iconStyle = {};
            let className = 'slotBtn';
            let textIcon = null;

            if (slotData) {
                const isUrl = slotData.icon && (slotData.icon.includes('/') || slotData.icon.includes('data:'));
                
                if (isUrl) {
                    if (slotData.isTintable && slotData.customData && slotData.customData.color) {
                        const color = slotData.customData.color;
                        iconStyle = {
                            backgroundColor: color,
                            maskImage: `url(${slotData.icon})`,
                            WebkitMaskImage: `url(${slotData.icon})`,
                            maskSize: "contain",
                            WebkitMaskSize: "contain",
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                            width: "100%", height: "100%"
                        };
                        className = 'slotBtn tinted-icon';
                    } else {
                        iconStyle = { 
                            backgroundImage: `url(${slotData.icon})` 
                        };
                    }
                } else if (slotData.icon) {
                    textIcon = slotData.icon;
                    iconStyle = {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '40px',
                        width: '100%',
                        height: '100%'
                    };
                }
            }

            ui.html({
                parent: slotsContainer,
                className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                // B"H: Attach data to the element so it survives serialization to Main Thread
                awtsmoosSlotData: slotData, 
                awtsmoosIndex: index,
                awtsmoosSourceType: containerMode ? 'container' : 'inventory',
                ready(el) {
                    // B"H: Read data from element, not closure
                    if(typeof window !== 'undefined' && typeof window.attachSlotDragListeners === 'function') {
                        const sData = el.awtsmoosSlotData;
                        const sType = el.awtsmoosSourceType;
                        const sIdx = el.awtsmoosIndex;
                        
                        // Handler for Click (also recreated on Main Thread)
                        const handleClick = (event) => {
                             const data = event.currentTarget.awtsmoosSlotData; 
                             const idx = event.currentTarget.awtsmoosIndex;
                             const src = event.currentTarget.awtsmoosSourceType;
                             
                             if (!data) return;

                             const isContainer = data.isContainer || data.className === 'Container' || (data.customData && data.customData.slots);
                             
                             if (isContainer) {
                                if (src !== 'container') {
                                    // Send message back to Worker
                                    var ikar = document.getElementById("ikar");
                                    if(ikar) {
                                        ikar.dispatchEvent(new CustomEvent("olamPeula", {
                                            detail: {
                                                openContainer: { 
                                                    item: data, 
                                                    index: idx, 
                                                    sourceType: src 
                                                } 
                                            }
                                        }));
                                    }
                                    return;
                                }
                             }
                             
                             const rect = event.target.getBoundingClientRect();
                             var ikar = document.getElementById("ikar");
                             if(ikar) {
                                 // Trigger context menu via UI event
                                 // Note: We use a UI event to show the menu, which lives on Main Thread
                                 // But context menu logic usually needs to send commands back to worker.
                                 
                                 // Since `showContextMenu` is defined in `inventory/index.js` which runs on Main Thread in response to Worker,
                                 // we can manually trigger the local UI logic or ask Worker to trigger it.
                                 // Asking Worker is safer for consistency.
                                 
                                 ikar.dispatchEvent(new CustomEvent("olamPeula", {
                                    detail: {
                                        uiEvent: {
                                            shaym: "inventoryScreen",
                                            ob: {
                                                showContextMenu: { 
                                                    item: data, 
                                                    index: idx, 
                                                    x: rect.right || event.clientX, 
                                                    y: rect.top || event.clientY, 
                                                    sourceType: src 
                                                }
                                            }
                                        }
                                    }
                                 }));
                             }
                        };
                        
                        window.attachSlotDragListeners(el, { item: sData }, sType, sIdx, ui, handleClick);
                    }
                },
                children: [{
                    className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                    on: { 
                        mouseenter: function(e, $, ui, me) {
                            // B"H: Read from parent's data
                            const parent = me.parentElement;
                            const sData = parent ? parent.awtsmoosSlotData : null;
                            if (!sData) return;
                            
                            const tooltip = $("icon tooltip");
                            if (tooltip) {
                                tooltip.innerHTML = `<div class="header">${sData.name || 'Item'}</div><div class="description">${sData.description || ''}</div>`;
                                tooltip.classList.remove('hidden');
                                const x = e.clientX || (e.touches && e.touches[0].clientX);
                                const y = e.clientY || (e.touches && e.touches[0].clientY);
                                if(x && y) { tooltip.style.left = (x + 15) + 'px'; tooltip.style.top = (y + 15) + 'px'; }
                            }
                        }, 
                        mouseleave: function() {
                             const tooltip = document.querySelector('[shaym="icon tooltip"]');
                             if(tooltip) tooltip.classList.add('hidden');
                        }
                    },
                    children: slotData ? [
                        { tag: 'div', className: className, style: iconStyle, textContent: textIcon }, 
                        { tag: 'div', className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }
                    ] : []
                }]
            });
        });
    }
}
