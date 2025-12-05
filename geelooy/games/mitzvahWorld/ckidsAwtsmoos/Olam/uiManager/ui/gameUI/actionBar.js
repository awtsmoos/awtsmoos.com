
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
        const slotConfig = el.startSlotsConfig;
        if (!slotConfig || !slotConfig.slots || !slotConfig.slots[0]) return;
        
        const bagSlotInfo = slotConfig.slots[0];
        const slotsContainer = $f("action slots");
        if(!slotsContainer) return;

        // Helper functions for tooltip
        const tooltip = $f("icon tooltip");
        function showTooltip(e) {
            if (!tooltip) return;
            tooltip.innerHTML = `<div class="header">${bagSlotInfo.name}</div><div class="description">${bagSlotInfo.description}</div>`;
            tooltip.classList.remove("hidden");
            const x = e.pageX || (e.touches && e.touches[0].pageX);
            const y = e.pageY || (e.touches && e.touches[0].pageY);
            if(x && y) {
                tooltip.style.left = (x - tooltip.clientWidth) + "px";
                tooltip.style.top = y + "px";
            }
        }
        
        function moveTooltip(e) {
            if (!tooltip) return;
            const x = e.pageX || (e.touches && e.touches[0].pageX);
            const y = e.pageY || (e.touches && e.touches[0].pageY);
            if(x && y) {
                tooltip.style.left = (x - tooltip.clientWidth) + "px";
                tooltip.style.top = y + "px";
            }
        }
        
        function hideTooltip() { if (tooltip) tooltip.classList.add("hidden"); }

        // Render the Default Bag Slot - THIS IS THE MISSING BAG
        ui.html({
            parent: slotsContainer,
            className: "actionSlot occupied",
            children: [{
                className: "innerSlot",
                on: { mouseenter: showTooltip, mousemove: moveTooltip, mouseleave: hideTooltip, touchstart: showTooltip },
                onclick(e) {
                    const inventoryScreen = $f(bagSlotInfo.show);
                    if (inventoryScreen) inventoryScreen.classList.remove("hidden");
                },
                children: [{ className: "slotBtn", style: { backgroundImage: `url(${bagSlotInfo.icon})` } }]
            }]
        });
    },
    on: {
        updateActionSlots(e, $, ui) {
            const actionSlotsData = e.detail;
            const slotsContainer = $("action slots");
            if (!slotsContainer) return;

            // B"H FIX: Do NOT wipe innerHTML. Keep the first child (the Bag slot).
            // Remove all children *after* the first one to rebuild dynamic slots.
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
                        const x = event.pageX || (event.touches && event.touches[0].pageX);
                        const y = event.pageY || (event.touches && event.touches[0].pageY);
                        if (x && y) { tooltip.style.left = (x + 15) + 'px'; tooltip.style.top = (y + 15) + 'px'; }
                    }
                };
                const hideTooltip = () => $("icon tooltip")?.classList.add('hidden');

                ui.html({
                    parent: slotsContainer,
                    className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                    ready(el) { 
                         // B"H FIX: Strict check for window and function existence to prevent ReferenceError
                         if(typeof window !== 'undefined' && typeof window.attachSlotDragListeners === 'function') {
                            window.attachSlotDragListeners(el, { item: slotData }, 'action', index, ui);
                         }
                    },
                    children: [{
                        className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                        on: { mouseenter: showTooltip, mouseleave: hideTooltip },
                        // Onclick for Right Click / Context Menu is handled by attachSlotDragListeners filtering buttons,
                        // But we add explicit onclick here for standard context menu triggering just in case
                         onclick: (event) => { 
                            if (slotData) {
                                const rect = event.currentTarget.getBoundingClientRect();
                                ui.peula($("inventoryScreen"), {
                                    showContextMenu: { item: slotData, index: index, x: rect.right, y: rect.top, sourceType: 'action' }
                                });
                            }
                        },
                        children: slotData ? [
                            { className: 'slotBtn', style: { backgroundImage: `url(${slotData.icon})` }},
                            { className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }
                        ] : []
                    }]
                });
            });
        }
    }
};
