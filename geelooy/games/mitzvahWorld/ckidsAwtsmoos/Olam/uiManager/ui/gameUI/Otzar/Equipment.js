
/**
 * B"H
 * @module Equipment
 * @description
 * THE GARMENTS OF THE SOUL (LEVUSHIM)
 * 
 * "And he made him a coat of many colors..." 
 * The Equipment slots represent the soul's interface with the world 
 * through its garments.
 */
export default function updateEquipment(e, $, ui) {
    const equipment = e.detail || e;
    const inventoryElement = $("inventoryScreen") || document.getElementById("inventoryScreen");
    if (!inventoryElement) return;

    const equipContainer = inventoryElement.querySelector(".equipment-slots");
    if (!equipContainer) return;

    console.log('B"H - 👕 [LEVUSHIM]: Harmonizing the garments of the soul.');
    equipContainer.innerHTML = '';

    const slotIcons = {
        head: '🧢',
        shirt: '👕',
        jacket: '🧥',
        legs: '👖',
        feet: '👟',
        rightHand: '👋',
        leftHand: '🛡️',
        eyes: '👓'
    };

    Object.entries(equipment).forEach(([slotId, itemData]) => {
        let iconStyle = {};
        let textIcon = slotIcons[slotId] || '✨';
        let className = 'slotBtn locked-icon';

        if (itemData) {
            const isUrl = itemData.icon && (itemData.icon.includes('/') || itemData.icon.includes('data:'));
            if (isUrl) {
                iconStyle = { 
                    backgroundImage: `url("${itemData.icon}")`,
                    backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'
                };
            } else {
                textIcon = itemData.icon;
            }
            className = 'slotBtn';
        }

        ui.html({
            parent: equipContainer,
            className: "inventory-slot " + (itemData ? 'occupied' : 'empty'),
            "awtsmoosSlotData": itemData,
            "awtsmoosSlotId": slotId,
            onclick(e, $local, uiInstance, el) {
                const sData = el['awtsmoosSlotData'];
                if (sData) {
                    // Unequip logic
                    console.log(`B"H - 🔓 [LEVUSHIM]: Removing the garment from ${slotId}`);
                    uiInstance.peula("ikar", { olamPeula: { unequipItem: slotId } });
                }
            },
            children: [{
                className: "innerSlot",
                children: [{ className: className, style: iconStyle, textContent: textIcon }]
            }]
        });
    });
}
