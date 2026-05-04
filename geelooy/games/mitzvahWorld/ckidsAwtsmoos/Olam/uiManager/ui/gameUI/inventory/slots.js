
/**
 * B"H
 * @file slots.js
 * @description
 * * Chapter 16: The Treasury Grid
 * Each slot is a dwelling place for a spark. We weave the HTML vessels 
 * to be porous to the touch—allowing clicks and drags to transcend the 
 * purely visual layer and affect the deep inventory state.
 * * This handler assembles the main inventory grid and internal bag views, 
 * identifying each cell by its holy index and source.
 */

export default function updateSlots(e, $, ui) {
    const data = e.detail || e;
    const slotsData = data.slots || (Array.isArray(data) ? data : []); 
    const containerMode = !!data.containerMode;
    const containerName = data.containerName;

    const inventoryElement = $("inventoryScreen");
    if (!inventoryElement) return;
    
    const titleEl = inventoryElement.querySelector(".header .text");
    const backBtn = inventoryElement.querySelector(".back-inv-btn");

    // Harmonizing the identity of the window
    if(titleEl) {
        titleEl.textContent = containerMode ? (containerName || "Container") : "Inventory";
    }
    
    // The path back to the parent vessel (for bags)
    if(backBtn) {
        backBtn.style.display = containerMode ? "block" : "none";
        if(containerMode) backBtn.classList.remove("hidden");
        else backBtn.classList.add("hidden");
    }

    const slotsContainer = inventoryElement.querySelector(".slots");
    if (!slotsContainer) return;
    slotsContainer.innerHTML = '';

    // Birth each slot one by one into the grid
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
                            maskImage: `url("${slotData.icon}")`,
                            WebkitMaskImage: `url("${slotData.icon}")`,
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
                            backgroundImage: `url("${slotData.icon}")`,
                            width: "100%", height: "100%",
                            backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center"
                        };
                    }
                } else if (slotData.icon) {
                    textIcon = slotData.icon;
                    iconStyle = { 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', 
                        fontSize: '40px', width: '100%', height: '100%' 
                    };
                }
            }

            ui.html({
                parent: slotsContainer,
                className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                style: { pointerEvents: "auto" }, // B"H: ABSOLUTE POINTER AUTHORITY!
                "awtsmoosSlotData": slotData, 
                "awtsmoosIndex": index,
                "awtsmoosSourceType": containerMode ? 'container' : 'inventory',
                ready(el, $local, uiInstance) {
                    if(typeof window !== 'undefined' && typeof window['attachSlotDragListeners'] === 'function') {
                        
                        /**
                         * @function handleClick
                         * @description 
                         * The spark of realization! When the player clicks an item, 
                         * we decide if it's a journey into a sub-vessel (bag) 
                         * or an opportunity for action (context menu).
                         */
                        const handleClick = (event) => {
                             const targetEl = event.currentTarget || el;
                             const slotObj = targetEl['awtsmoosSlotData']; 
                             const slotIdx = targetEl['awtsmoosIndex'];
                             const source = targetEl['awtsmoosSourceType'];
                             
                             if (!slotObj) return;

                             const isContainer = slotObj.isContainer || slotObj.className === 'Container' || (slotObj.customData && slotObj.customData.slots);
                             
                             // If it's a bag and we are in the main inventory, delve inside!
                             if (isContainer && source !== 'container') {
                                uiInstance.peula("ikar", {
                                    olamPeula: { 
                                        openContainer: { item: slotObj, index: slotIdx, sourceType: source } 
                                    }
                                });
                                return;
                             }
                             
                             // Summon the Context Menu to ask the soul its choice!
                             const rect = targetEl.getBoundingClientRect();
                             const invScreen = uiInstance.getHtml("inventoryScreen");
                             if(invScreen) {
                                 uiInstance.peula(invScreen, {
                                    showContextMenu: { 
                                        item: slotObj, 
                                        index: slotIdx, 
                                        x: event.clientX || rect.right, 
                                        y: event.clientY || rect.top, 
                                        sourceType: source 
                                    }
                                 });
                             }
                        };
                        
                        // B"H: Binding the movement and interaction laws to this physical slot
                        window['attachSlotDragListeners'](el, { item: slotData }, containerMode ? 'container' : 'inventory', index, uiInstance, handleClick);
                    }
                },
                children: [{
                    className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                    on: { 
                        mouseenter: function(e, $local, uiInst, me) {
                            const parent = me.parentElement;
                            const sData = parent ? parent['awtsmoosSlotData'] : null;
                            if (!sData) return;
                            
                            const x = e.clientX || (e.touches && e.touches[0].clientX);
                            const y = e.clientY || (e.touches && e.touches[0].clientY);
                            uiInst.peula("gameHUD", { tooltip: { show: true, text: sData.name || 'Item', x, y } });
                        }, 
                        mouseleave: function(e, $local, uiInst) {
                             uiInst.peula("gameHUD", { tooltip: { show: false } });
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
