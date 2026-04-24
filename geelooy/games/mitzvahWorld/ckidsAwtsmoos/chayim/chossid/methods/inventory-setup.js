
/**
 * B"H
 * @file inventory-setup.js
 * Injects the starting manifestations of form into the player's inventory.
 */

export default {
    setupDefaultInventory() {
        const svgToBase64 = (svg) => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        
        const icons = {
            staff: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="45" y="10" width="10" height="80" fill="#8B4513"/><circle cx="50" cy="10" r="10" fill="cyan"/><circle cx="50" cy="10" r="5" fill="white" opacity="0.5"/></svg>`)
        };

        this.inventory.addItem({
            id: 'elemental_staff',
            className: 'ElementalStaff',
            name: 'Staff of Elements',
            description: 'Control Fire, Water, Air, and Earth. (Right Click/Alt to switch)',
            icon: icons.staff,
            isTool: true
        }, 1);
        
        // Default Hat
        this.inventory.addItem({
            id: 'default_hat',
            className: 'Apparel',
            name: 'Holy Fedora',
            description: 'A crown of awe.',
            icon: '🎩',
            equipSlot: 'head',
            customData: { color: '#111111' }
        }, 1);

        // Default Jacket
        this.inventory.addItem({
            id: 'default_jacket',
            className: 'Apparel',
            name: 'Sabbath Jacket',
            description: 'Garments of splendor.',
            icon: '🧥',
            equipSlot: 'jacket',
            customData: { color: '#222222' }
        }, 1);

        // Equip them automatically if not already equipped by a save
        setTimeout(() => {
            if (!this.inventory.equipment.head) {
                const hatIdx = this.inventory.slots.findIndex(s => s && s.id === 'default_hat');
                if (hatIdx > -1) this.inventory.equipItem({ sourceType: 'inventory', index: hatIdx, target: 'head' });
            }
            if (!this.inventory.equipment.jacket) {
                const jacketIdx = this.inventory.slots.findIndex(s => s && s.id === 'default_jacket');
                if (jacketIdx > -1) this.inventory.equipItem({ sourceType: 'inventory', index: jacketIdx, target: 'jacket' });
            }
        }, 500);
    }
}
