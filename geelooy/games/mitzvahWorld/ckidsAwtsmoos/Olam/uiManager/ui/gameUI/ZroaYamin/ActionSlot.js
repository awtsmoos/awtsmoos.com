
/**
 * B"H
 * @module ActionSlot
 * @description
 * THE RADIATING SPARK (NITZOTZ)
 * 
 * Each slot is a dwelling for a tool or a block. 
 * This module defines the logic of how a spark is manifested 
 * into the physical world from the potential of the array.
 */
export default function createActionSlot(slotData, index, ui) {
    let iconStyle = {};
    let textIcon = null;
    let className = 'slotBtn';
    
    if (slotData) {
        const isUrl = slotData.icon && (slotData.icon.includes('/') || slotData.icon.includes('data:'));
        if (isUrl) {
            const safeUrl = slotData.icon.replace(/[\r\n]+/g, "");
            if (slotData.isTintable && slotData.customData && slotData.customData.color) {
                iconStyle = {
                    backgroundColor: slotData.customData.color,
                    maskImage: `url("${safeUrl}")`, WebkitMaskImage: `url("${safeUrl}")`,
                    maskSize: "contain", WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center", width: "100%", height: "100%"
                };
                className = 'slotBtn tinted-icon';
            } else {
                iconStyle = { backgroundImage: `url("${safeUrl}")` };
            }
        } else if (slotData.icon) {
            textIcon = slotData.icon;
            iconStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px', width: '100%', height: '100%' };
        }
    }

    return {
        parent: "actionSlots",
        className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
        style: { pointerEvents: "auto" },
        "awtsmoosSlotData": slotData,
        "awtsmoosIndex": index,
        "awtsmoosSourceType": "action",
        onmouseenter(e, $, uiInstance, el) {
            const menu = $("itemContextMenu");
            if (slotData && (!menu || menu.classList.contains('hidden'))) {
                uiInstance.peula("ikar", { olamPeula: { showTooltip: { item: slotData, x: e.clientX, y: e.clientY } } });
            }
        },
        onmouseleave(e, $, uiInstance) {
            uiInstance.peula("ikar", { olamPeula: { hideTooltip: true } });
        },
        ready(el, $local, uiInstance) { 
             // B"H: silent

             if(typeof window !== 'undefined' && typeof window.attachSlotDragListeners === 'function') {
                const handleClick = (event) => {
                    if (!slotData) return;
                    const isContainer = slotData.isContainer || slotData.className === 'Container' || (slotData.customData && slotData.customData.slots);
                    if (isContainer) {
                        uiInstance.peula("ikar", { 
                            olamPeula: { openContainer: { item: slotData, index: index, sourceType: 'action' } } 
                        });
                        uiInstance.htmlAction({ shaym: "inventoryScreen", methods: { classList: { remove: "hidden" } } });
                    } else {
                        const explicitTarget = slotData.equipSlot || 'rightHand';
                        uiInstance.peula("ikar", { 
                            olamPeula: { equipItem: { sourceType: 'action', index: index, target: explicitTarget } } 
                        });
                    }
                };
                window.attachSlotDragListeners(el, { item: slotData }, 'action', index, uiInstance, handleClick);
             }
        },
        children:[{
            className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
            children: slotData ?[
                 { className: className, style: iconStyle, textContent: textIcon },
                 { className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }
            ] : []
        }]
    };
}
