
/**
 * B"H
 * @module SlotBadge
 * @description
 * THE QUANTITY OF THE MULTITUDE
 * 
 * "And they shall be a multitude in the midst of the earth..."
 * The badge represents the number of identical sparks 
 * contained within a single boundary.
 */
export default (quantity) => {
    if (!quantity || quantity <= 1) return null;
    return {
        className: "qty-badge",
        textContent: quantity
    };
};
