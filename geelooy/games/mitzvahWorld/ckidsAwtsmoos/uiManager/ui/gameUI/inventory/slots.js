// B"H 
/**
 * @file slots.js
 * @description Renders the inventory grid. Enhanced for Worker compatibility and closure stability.
 */
import { resolveItemIcon } from "../../../../systems/inventory/ItemIconResolver.js";

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
                const resolvedIcon = resolveItemIcon(slotData);
                const isUrl = resolvedIcon && (resolvedIcon.includes('/') || resolvedIcon.includes('data:'));
                
                if (isUrl) {
                    if (slotData.isTintable && slotData.customData && slotData.customData.color) {
                        const color = slotData.customData.color;
                        iconStyle = {
                            backgroundColor: color,
                            maskImage: "url(" + resolvedIcon + ")",
                            WebkitMaskImage: "url(" + resolvedIcon + ")",
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
                            backgroundImage: "url(" + resolvedIcon + ")"
                        };
                    }
                } else if (resolvedIcon) {
                    textIcon = resolvedIcon;
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
                // B"H: Attaching metadata to the DOM element for retrieval on Main Thread.
                // Property names are quoted to survive potential optimization/minification.
                "awtsmoosSlotData": slotData, 
                "awtsmoosIndex": index,
                "awtsmoosSourceType": containerMode ? 'container' : 'inventory',
                ready(el, $, ui) {
                    // B"H: Using bracket notation to safely access decorated properties from the Main Thread.
                    if(typeof window !== 'undefined' && typeof window['attachSlotDragListeners'] === 'function') {
                        const sData = el['awtsmoosSlotData'];
                        const sType = el['awtsmoosSourceType'];
                        const sIdx = el['awtsmoosIndex'];
                        
                        const handleClick = (event) => {
                             const targetEl = event.currentTarget;
                             const slotObj = targetEl['awtsmoosSlotData']; 
                             const slotIdx = targetEl['awtsmoosIndex'];
                             const source = targetEl['awtsmoosSourceType'];
                             
                             if (!slotObj) return;

                             const isContainer = slotObj.isContainer || slotObj.className === 'Container' || (slotObj.customData && slotObj.customData.slots);
                             
                             if (isContainer) {
                                if (source !== 'container') {
                                    var ikar = document.getElementById("ikar");
                                    if(ikar) {
                                        ikar.dispatchEvent(new CustomEvent("olamPeula", {
                                            detail: {
                                                openContainer: { 
                                                    item: slotObj, 
                                                    index: slotIdx, 
                                                    sourceType: source 
                                                } 
                                            }
                                        }));
                                    }
                                    return;
                                }
                             }
                             
                             const rect = targetEl.getBoundingClientRect();
                             var ikarElement = document.getElementById("ikar");
                             if(ikarElement) {
                                 ikarElement.dispatchEvent(new CustomEvent("olamPeula", {
                                    detail: {
                                        sendUiEvent: {
                                            shaym: "inventoryScreen",
                                            ob: {
                                                showContextMenu: { 
                                                    item: slotObj, 
                                                    index: slotIdx, 
                                                    x: rect.right || event.clientX, 
                                                    y: rect.top || event.clientY, 
                                                    sourceType: source 
                                                }
                                            }
                                        }
                                    }
                                 }));
                             }
                        };
                        
                        window['attachSlotDragListeners'](el, { item: sData }, sType, sIdx, ui, handleClick);
                    }
                },
                children: [{
                    className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                    on: { 
                        mouseenter: function(e, $, ui, me) {
                            // B"H: Accessing slot data from parent element context.
                            const parent = me.parentElement;
                            const sData = parent ? parent['awtsmoosSlotData'] : null;
                            if (!sData) return;
                            
                            const tooltip = $("tooltip");
                            if (tooltip) {
                                tooltip.innerHTML = '<div class="header">' + (sData.name || 'Item') + '</div><div class="description">' + (sData.description || '') + '</div>';
                                tooltip.classList.remove('hidden');
                                const x = e.clientX || (e.touches && e.touches[0].clientX);
                                const y = e.clientY || (e.touches && e.touches[0].clientY);
                                if(x && y) { tooltip.style.left = (x + 15) + 'px'; tooltip.style.top = (y + 15) + 'px'; }
                            }
                        }, 
                        mouseleave: function() {
                             const tooltip = document.querySelector('[shaym="tooltip"]');
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
