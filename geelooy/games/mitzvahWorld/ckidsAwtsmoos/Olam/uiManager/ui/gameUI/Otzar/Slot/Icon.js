
/**
 * B"H
 * @module SlotIcon
 * @description
 * THE IMAGE OF THE SPARK (TZELEM)
 * 
 * "In the image of Elokim He created him..." 
 * The icon is the visual representative of the hidden spark 
 * within the vessel of the inventory slot.
 */
export default (slot, slotId = null) => {
    let iconStyle = {};
    let textIcon = null;
    let className = 'slot-icon';

    const slotIcons = {
        head: '🧢', shirt: '👕', jacket: '🧥', legs: '👖', 
        feet: '👟', rightHand: '👋', leftHand: '🛡️', eyes: '👓'
    };

    if (slot) {
        const isUrl = slot.icon && (slot.icon.includes('/') || slot.icon.includes('data:'));
        if (isUrl) {
            iconStyle = { backgroundImage: `url("${slot.icon}")` };
        } else {
            textIcon = slot.icon || "✨";
        }
    } else if (slotId && slotIcons[slotId]) {
        textIcon = slotIcons[slotId];
        className += ' locked-icon';
    }

    return {
        className: className,
        style: { ...iconStyle, pointerEvents: "none" },
        textContent: textIcon
    };
};

