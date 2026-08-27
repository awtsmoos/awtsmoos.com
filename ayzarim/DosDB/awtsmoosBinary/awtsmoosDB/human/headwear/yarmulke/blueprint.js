
/**
 * @file blueprint.js
 * @description
 * The Yarmulke (Kippah) represents the constant awareness that there is something
 * above the human intellect—the Awtsmoos Himself.
 *
 * This file contains the 'Letters' of the Yarmulke's appearance. 
 * By separating the Data from the Manifestation, we maintain the purity 
 * of the Seder Hishtalshelus.
 */

export const YARMULKE_DATA = {
    colors: {
        velvet: '#0a0a0a',
        satin: '#f5f5f5',
        knitted: '#4a90e2'
    },
    shapes: {
        rounded: '50%',
        flat: '10%'
    },
    defaults: {
        color: 'velvet',
        size: '40px',
        type: 'rounded'
    }
};

/**
 * @function generateYarmulkeStyle
 * @description Calculates the 'Garments' of the Yarmulke based on user input.
 * @param {Object} options - Customizations.
 * @returns {Object} CSS style object.
 */
export const getYarmulkeStyle = (options = {}) => {
    const colorKey = options.color || YARMULKE_DATA.defaults.color;
    const shapeKey = options.type || YARMULKE_DATA.defaults.type;
    
    return {
        width: options.size || YARMULKE_DATA.defaults.size,
        height: options.size || YARMULKE_DATA.defaults.size,
        backgroundColor: YARMULKE_DATA.colors[colorKey] || colorKey,
        borderRadius: YARMULKE_DATA.shapes[shapeKey] || shapeKey,
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)'
    };
};
