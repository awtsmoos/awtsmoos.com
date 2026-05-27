
/**
 * B"H
 * @file inventorySetup.js
 */

export default {
    setupDefaultInventory() {
        const svgToBase64 = (svg) => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        
        const icons = {
            // ... (keep existing icons) ...
            staff: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="45" y="10" width="10" height="80" fill="#8B4513"/><circle cx="50" cy="10" r="10" fill="cyan"/><circle cx="50" cy="10" r="5" fill="white" opacity="0.5"/></svg>`)
        };

        // ... (keep existing items) ...
        
        this.inventory.addItem({
            id: 'elemental_staff',
            className: 'ElementalStaff',
            name: 'Staff of Elements',
            description: 'Control Fire, Water, Air, and Earth. (Right Click/Alt to switch)',
            icon: icons.staff,
            isTool: true
        }, 1);
        
        // ... (keep rest) ...
    }
}
