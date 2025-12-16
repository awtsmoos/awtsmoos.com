









// B"H
import startSlotsConfig from "../startSlotsConfig.js";

export default {
    shaym: "action bar",
    className: "awtsmoosAction",
    awtsmoosClick: true,
    startSlotsConfig,
    children: [{
        className: "minimize opened",
        onclick(e, $, ui, el) {
            var slots = $("action bar");
            if (!slots) return;
            slots.classList.toggle("minimized");
            el.classList.toggle("opened");
            el.classList.toggle("closed");
        }
    }, { className: "slots", shaym: "action slots" }],
    ready(el, $f, ui) {
        // Initial setup handled by updateActionSlots mostly now to prevent race conditions
    },
    on: {
        updateActionSlots(e, $, ui) {
            const actionSlotsData = e.detail;
            const slotsContainer = $("action slots");
            if (!slotsContainer) return;
            
            // B"H FIX: Ensure Bag Slot (Index 0/First Child) exists
            // If the container is empty (first load or wiped), recreate the bag slot.
            const slotConfig = $("action bar").startSlotsConfig;
            const bagSlotInfo = slotConfig && slotConfig.slots ? slotConfig.slots[0] : null;

            if (slotsContainer.children.length === 0 && bagSlotInfo) {
                 const tooltip = $("icon tooltip");
                 const showTooltip = (e) => {
                    if (!tooltip) return;
                    tooltip.innerHTML = `<div class="header">${bagSlotInfo.name}</div><div class="description">${bagSlotInfo.description}</div>`;
                    tooltip.classList.remove("hidden");
                    const x = e.clientX || (e.touches && e.touches[0].clientX);
                    const y = e.clientY || (e.touches && e.touches[0].clientY);
                    if(x && y) {
                        tooltip.style.left = (x - tooltip.clientWidth) + "px";
                        tooltip.style.top = y + "px";
                    }
                };
                const hideTooltip = () => { if(tooltip) tooltip.classList.add("hidden"); };
                
                ui.html({
                    parent: slotsContainer,
                    className: "actionSlot occupied",
                    children: [{
                        className: "innerSlot",
                        on: { mouseenter: showTooltip, mouseleave: hideTooltip, touchstart: showTooltip },
                        onclick(e) {
                            const inventoryScreen = $(bagSlotInfo.show);
                            if (inventoryScreen) inventoryScreen.classList.remove("hidden");
                        },
                        children: [{ className: "slotBtn", style: { backgroundImage: `url(${bagSlotInfo.icon})` } }]
                    }]
                });
            }

            // Remove all children *after* the bag slot (index 0) to refresh dynamic slots
            while (slotsContainer.children.length > 1) {
                slotsContainer.removeChild(slotsContainer.lastChild);
            }

            actionSlotsData.forEach((slotData, index) => {
                const showTooltip = (event) => {
                    if (!slotData) return;
                    const tooltip = $("icon tooltip");
                    if (tooltip) {
                        tooltip.innerHTML = `<div class="header">${slotData.name}</div><div class="description">${slotData.description}</div>`;
                        tooltip.classList.remove("hidden");
                        const x = event.clientX || (event.touches && event.touches[0].clientX);
                        const y = event.clientY || (event.touches && event.touches[0].clientY);
                        if (x && y) { tooltip.style.left = (x + 15) + 'px'; tooltip.style.top = (y + 15) + 'px'; }
                    }
                };
                const hideTooltip = () => $("icon tooltip")?.classList.add('hidden');
                
                let iconStyle = {};
                let textIcon = null;
                let className = 'slotBtn';
                
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
                        } else {
                            iconStyle = { backgroundImage: `url(${slotData.icon})` };
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

                // B"H: Define Click Logic to be passed to Drag Listener
                const handleClick = (event) => {
                    if (!slotData) return;
                    
                    const isContainer = slotData.isContainer || slotData.className === 'Container' || (slotData.customData && slotData.customData.slots);

                    if (isContainer) {
                        // Open Inventory Screen in container mode
                        ui.peula("ikar", { 
                            olamPeula: { 
                                openContainer: { 
                                    item: slotData, 
                                    index: index, 
                                    sourceType: 'action' 
                                } 
                            } 
                        });
                        
                        // Also show inventory if hidden
                        const inv = $("inventoryScreen");
                        if(inv) inv.classList.remove("hidden");
                        return;
                    }

                    const rect = event.target ? event.target.getBoundingClientRect() : { right: event.clientX, top: event.clientY };
                    ui.peula($("inventoryScreen"), {
                        showContextMenu: { 
                            item: slotData, 
                            index: index, 
                            x: rect.right || event.clientX, 
                            y: rect.top || event.clientY, 
                            sourceType: 'action' 
                        }
                    });
                };

                ui.html({
                    parent: slotsContainer,
                    className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                    ready(el) { 
                         // B"H FIX: Strict check for window and function existence to prevent ReferenceError
                         if(typeof window !== 'undefined' && typeof window.attachSlotDragListeners === 'function') {
                            window.attachSlotDragListeners(el, { item: slotData }, 'action', index, ui, handleClick);
                         }
                    },
                    children: [{
                        className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                        on: { mouseenter: showTooltip, mouseleave: hideTooltip },
                        children: slotData ? [
                             { className: className, style: iconStyle, textContent: textIcon },
                             { className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }
                        ] : []
                    }]
                });
            });
        }
    }
};
