
/**
 * B"H
 * @file inventory-setup.js
 * Chapter 5: The Clothe of the Soul
 * "He wraps Himself in light as with a garment..."
 * When the soul enters the Olam, it is naked, a pure essence without form. 
 * But to interact with the world, it must don the Levushim (Garments) of thought, speech, and action.
 * This module injects the physical garments into the inventory of the Chossid, ensuring they have 
 * the tools necessary to navigate the physical plane.
 */

export default {
    setupDefaultInventory() {
        const svgToBase64 = (svg) => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        
        const icons = {
            staff: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="45" y="10" width="10" height="80" fill="#8B4513"/><circle cx="50" cy="10" r="10" fill="cyan"/><circle cx="50" cy="10" r="5" fill="white" opacity="0.5"/></svg>`),
            shirt: "👕",
            kippah: "🧢",
            glasses: "👓",
            jacket: "🧥",
            hat: "🎩"
        };

        this.inventory.addItem({
            id: 'elemental_staff', className: 'ElementalStaff', name: 'Staff of Elements', description: 'Control the foundational elements of creation. Alt-click to switch modes.', icon: icons.staff, isTool: true
        }, 1);

        this.inventory.addItem({
            id: 'book_tehillim', className: 'Sefer', name: 'Sefer Tehillim (Weapon)', description: 'A holy book. Fire Hebrew letters to battle the darkness.', icon: '📖', isTool: true
        }, 1);

        this.inventory.addItem({
            id: 'book_chumash_bereishis',
            className: 'Chumash',
            name: 'Chumash: Opening Light',
            description: 'Readable Chumash passages for Torah debate: pshat, remez, derush, and sod.',
            icon: '📘',
            isTool: true,
            readable: true,
            actionBarReady: true,
            passageIds: ['bereishis_1_1', 'shemos_20_2']
        }, 1);

        this.inventory.addItem({
            id: 'passage_bereishis_1_1',
            className: 'TorahPassage',
            name: 'Bereishis 1:1 Passage',
            description: 'A debate passage carrying pshat earth, remez water, derush fire, and sod air.',
            icon: '📜',
            isDebateCard: true,
            passageId: 'bereishis_1_1'
        }, 1);

        this.inventory.addItem({
            id: 'book_chumash_bereishis',
            className: 'Chumash',
            name: 'Chumash: Opening Light',
            description: 'Readable Chumash passages for Torah debate: pshat, remez, derush, and sod.',
            icon: '📘',
            isTool: true,
            readable: true,
            actionBarReady: true,
            passageIds: ['bereishis_1_1', 'shemos_20_2']
        }, 1);

        this.inventory.addItem({
            id: 'passage_bereishis_1_1',
            className: 'TorahPassage',
            name: 'Bereishis 1:1 Passage',
            description: 'A debate passage carrying pshat earth, remez water, derush fire, and sod air.',
            icon: '📜',
            isDebateCard: true,
            passageId: 'bereishis_1_1'
        }, 1);
        
        // The Garments of the Soul
        this.inventory.addItem({
            id: 'garment_shirt', className: 'Apparel', name: 'White Shirt', description: 'A pristine garment reflecting pure intent.', icon: icons.shirt, equipSlot: 'shirt', customData: { meshName: 'outer-shirt' }
        }, 1);
        
        this.inventory.addItem({
            id: 'garment_yamulka', className: 'Apparel', name: 'Yamulka', description: 'A constant reminder of the Infinite above.', icon: icons.kippah, equipSlot: 'head', customData: { meshName: 'yamulka' }
        }, 1);
        
        this.inventory.addItem({
            id: 'garment_glasses', className: 'Apparel', name: 'Spectacles of Insight', description: 'Lenses to see the inner truth of reality.', icon: icons.glasses, equipSlot: 'eyes', customData: { meshName: 'glasses' }
        }, 1);
        
        this.inventory.addItem({
            id: 'garment_jacket', className: 'Apparel', name: 'Sabbath Jacket', description: 'A coat of honor for the holy days.', icon: icons.jacket, equipSlot: 'jacket', customData: { meshName: 'jacket' }
        }, 1);
        
        this.inventory.addItem({
            id: 'garment_tophat', className: 'Apparel', name: 'Crown of Splendor', description: 'A majestic hat representing the intellect.', icon: icons.hat, equipSlot: 'head', customData: { meshName: 'top-hat' }
        }, 1);

        this.inventory.addItem({
            id: 'garment_arm_teffilin', className: 'Apparel', name: 'Teffilin Shel Yad', description: 'Binding the arm to the Creator.', icon: '🔲', equipSlot: 'jacket', customData: { meshName: ['teffilin-arm-straps', 'teffiln-arm-box'] }
        }, 1);

        this.inventory.addItem({
            id: 'garment_head_teffilin', className: 'Apparel', name: 'Teffilin Shel Rosh', description: 'Binding the mind to the Creator.', icon: '🔳', equipSlot: 'head', customData: { meshName: ['head-teffilin-straps', 'teffilin-head-box'] }
        }, 1);

        // B"H: The Foundational Bricks of the World
        this.inventory.addItem({
            id: 'building_brick', className: 'Brick', name: 'Building Brick', description: 'A sturdy block for construction.', icon: '🧱', isBuildable: true
        }, 100);

        this.inventory.addItem({
            id: 'building_stairs', className: 'Stairs', name: 'Stairway to Heaven', description: 'Elevate the vessel to higher planes.', icon: '🪜', isBuildable: true
        }, 64);

        this.inventory.addItem({
            id: 'building_mill', className: 'Mill', name: 'Grain Mill', description: 'Grind the sparks of sustenance.', icon: '🏘️', isBuildable: true
        }, 5);

        // B"H: The Blessings of Wealth
        this.inventory.addItem({
            id: 'perutah', className: 'Coin', name: 'Perutah', description: 'The fundamental currency of Mitzvah World.', icon: '🪙'
        }, 1000);

        // B"H: Additional Clothing Colors
        const colors = [
            { name: "Blue", hex: "#0000ff" },
            { name: "Red", hex: "#ff0000" },
            { name: "Green", hex: "#00ff00" },
            { name: "Gold", hex: "#ffd700" },
            { name: "Purple", hex: "#800080" },
            { name: "Black", hex: "#000000" }
        ];

        colors.forEach(c => {
            this.inventory.addItem({
                id: `garment_shirt_${c.name.toLowerCase()}`, className: 'Apparel', name: `${c.name} Shirt`, description: `A ${c.name.toLowerCase()} garment reflecting specific traits.`, icon: icons.shirt, equipSlot: 'shirt', customData: { meshName: 'outer-shirt', color: c.hex }
            }, 1);
            this.inventory.addItem({
                id: `garment_yamulka_${c.name.toLowerCase()}`, className: 'Apparel', name: `${c.name} Yamulka`, description: `A ${c.name.toLowerCase()} reminder of the Infinite.`, icon: icons.kippah, equipSlot: 'head', customData: { meshName: 'yamulka', color: c.hex }
            }, 1);
            this.inventory.addItem({
                id: `garment_jacket_${c.name.toLowerCase()}`, className: 'Apparel', name: `${c.name} Jacket`, description: `A ${c.name.toLowerCase()} coat of honor.`, icon: icons.jacket, equipSlot: 'jacket', customData: { meshName: 'jacket', color: c.hex }
            }, 1);
        });

        // Equip the essential Levushim immediately to clothe the vessel
        setTimeout(() => {
            const equip = (id, target) => {
                const idx = this.inventory.slots.findIndex(s => s && s.id === id);
                if (idx > -1 && !this.inventory.equipment[target]) {
                    this.inventory.equipItem({ sourceType: 'inventory', index: idx, target });
                }
            };
            equip('garment_yamulka', 'head');
            equip('garment_shirt', 'shirt');
            equip('garment_glasses', 'eyes');

            const chumashIndex = this.inventory.slots.findIndex(s => s && s.id === 'book_chumash_bereishis');
            const passageIndex = this.inventory.slots.findIndex(s => s && s.id === 'passage_bereishis_1_1');
            if (chumashIndex > -1 && !this.inventory.actionSlots[0]) this.inventory.actionSlots[0] = this.inventory.slots[chumashIndex];
            if (passageIndex > -1 && !this.inventory.actionSlots[1]) this.inventory.actionSlots[1] = this.inventory.slots[passageIndex];
            this.inventory.updateUI();

            const chumashIndex = this.inventory.slots.findIndex(s => s && s.id === 'book_chumash_bereishis');
            const passageIndex = this.inventory.slots.findIndex(s => s && s.id === 'passage_bereishis_1_1');
            if (chumashIndex > -1 && !this.inventory.actionSlots[0]) this.inventory.actionSlots[0] = this.inventory.slots[chumashIndex];
            if (passageIndex > -1 && !this.inventory.actionSlots[1]) this.inventory.actionSlots[1] = this.inventory.slots[passageIndex];
            this.inventory.updateUI();
        }, 500);

    }
}
