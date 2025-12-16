
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
            const showTooltip = (event) => {
                if (!slotData) return;
                const tooltip = $("icon tooltip");
                if (tooltip) {
                    tooltip.innerHTML = `<div class="header">${slotData.name || 'Item'}</div><div class="description">${slotData.description || ''}</div>`;
                    tooltip.classList.remove('hidden');
                    const x = event.pageX || (event.touches && event.touches[0].pageX);
                    const y = event.pageY || (event.touches && event.touches[0].pageY);
                    if(x && y) { tooltip.style.left = (x + 15) + 'px'; tooltip.style.top = (y + 15) + 'px'; }
                }
            };
            const hideTooltip = () => $("icon tooltip")?.classList.add('hidden');

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

            const handleClick = (event) => {
                    if (!slotData) return;
                    
                    const currentSourceType = containerMode ? 'container' : 'inventory';
                    const isContainer = slotData.isContainer || slotData.className === 'Container' || (slotData.customData && slotData.customData.slots);

                    if (isContainer) {
                        if (!containerMode) {
                            ui.peula("ikar", { 
                            olamPeula: { 
                                openContainer: { 
                                    item: slotData, 
                                    index: index, 
                                    sourceType: currentSourceType 
                                } 
                            } 
                        });
                        return;
                        }
                    }
                    
                    const rect = event.target ? event.target.getBoundingClientRect() : { right: event.clientX, top: event.clientY };
                    ui.peula($("inventoryScreen"), {
                    showContextMenu: { 
                        item: slotData, 
                        index: index, 
                        x: rect.right || event.clientX, 
                        y: rect.top || event.clientY, 
                        sourceType: currentSourceType 
                    }
                });
            };

            ui.html({
                parent: slotsContainer,
                className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                ready(el) {
                        if(typeof window !== 'undefined' && typeof window.attachSlotDragListeners === 'function') {
                        const sourceType = containerMode ? 'container' : 'inventory';
                        window.attachSlotDragListeners(el, { item: slotData }, sourceType, index, ui, handleClick);
                        }
                },
                children: [{
                    className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                    on: { mouseenter: showTooltip, mouseleave: hideTooltip },
                    children: slotData ? [
                        { tag: 'div', className: className, style: iconStyle, textContent: textIcon }, 
                        { tag: 'div', className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }
                    ] : []
                }]
            });
        });
    }
}
