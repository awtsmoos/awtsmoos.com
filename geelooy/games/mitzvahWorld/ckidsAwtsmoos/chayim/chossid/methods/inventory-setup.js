
/**
 * B"H
 * @file inventorySetup.js
 * Default inventory configuration for the Chossid.
 */

export default {
    setupDefaultInventory() {
        // --- TOOLS ---
        this.inventory.addItem({
            id: 'remover_tool',
            className: 'Tool',
            name: 'Remover',
            description: 'Removes equipped items.',
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZWQiIHN0cm9rZS13aWR0aD0iMTAiLz48bGluZSB4MT0iMjAiIHkxPSIyMCIgeDI9IjgwIiB5Mj0iODAiIHN0cm9rZT0icmVkIiBzdHJva2Utd2lkdGg9IjEwIi8+PC9zdmc+'
        }, 1);

        const hammerIcon = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI0NTEzO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNBMDUyMkQ7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjQ1MTM7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRDcwMDtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGQTUwMDtzdG9wLW9wYWNpdHk6MSIvPjwvbGluZWFyR3JhZGllbnQ+PGZpbHRlciBpZD0iYyIgeD0iLTIwJSIgeT0iLTIwJSIgd2lkdGg9IjE0MCUiIGhlaWdodD0iMTQwJSI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNSIgcmVzdWx0PSJibHVyIi8+PGZlQ29tcG9zaXRlIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImJsdXIiIG9wZXJhdG9yPSJvdmVyIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHg9IjIzNiIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iMzAwIiByeD0iNSIgZmlsbD0idXJsKCNhKSIgc3Ryb2tlPSIjNWUzMDBkIiBzdHJva2Utd2lkdGg9IjIiIHRyYW5zZm9ybT0icm90YXRlKC0xNSAyNTYgMjU2KSIvPjxnIHRyYW5zZm9ybT0icm90YXRlKC0xNSAyNTYgMjU2KSI+PHJlY3QgeD0iMTY2IiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4MCIgcng9IjUiIGZpbGw9IiM1NTUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMjI2IiB5PSI4MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0idXJsKCNiKSIgc3Ryb2tlPSIjQjg4NjBCIiBzdHJva2Utd2lkdGg9IjQiIGZpbHRlcj0idXJsKCNjKSIvPjxwYXRoIGQ9Ik0yODYgMTEwbDEwIDIwIDIwIDEwLTIwIDEwLTEwIDIwLTEwLTIwLTIwLTEwIDIwLTEwLTIwLTEweiIgZmlsbD0iI0ZGRiIgZmlsbC1vcGFjaXR5PSIuOCIvPjwvZz48cGF0aCBkPSJNMzYwIDgwbDIwLTIwTTM3MCAxMDBoMzBNMzYwIDEyMGwyMCAyMCIgc3Ryb2tlPSIjMDBGRkZGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==`;

        this.inventory.addItem({
            id: 'sparks_hammer',
            className: 'Tool', 
            name: 'Sparks Collector',
            description: 'Use this to retrieve sparks (blocks) from the world.',
            icon: hammerIcon
        }, 1);

        // --- B"H MITZVAH ITEMS & APPAREL ---
        this.inventory.addItem({
            id: 'teffilin_rashi_head',
            className: 'Apparel',
            name: 'Teffilin Shel Rosh',
            description: 'Head Teffilin (Rashi).',
            equipSlot: 'head',
            icon: 'mitzvahWorld/icons/items/teffilin.svg',
            customData: { color: "#000000" }
        }, 1);

        this.inventory.addItem({
            id: 'teffilin_rashi_arm',
            className: 'Apparel',
            name: 'Teffilin Shel Yad',
            description: 'Arm Teffilin (Rashi).',
            equipSlot: 'leftHand',
            icon: 'mitzvahWorld/icons/items/teffilin_arm.svg',
            customData: { color: "#000000" }
        }, 1);

        this.inventory.addItem({
            id: 'hat_fedora',
            className: 'Apparel',
            name: 'Fedora',
            description: 'A black hat.',
            equipSlot: 'head',
            icon: 'mitzvahWorld/icons/items/fedora.svg',
            customData: { color: "#111111" }
        }, 1);

        this.inventory.addItem({
            id: 'jacket_sirtuk',
            className: 'Apparel',
            name: 'Sirtuk',
            description: 'A long Chassidic coat.',
            equipSlot: 'jacket',
            icon: 'mitzvahWorld/icons/items/sirtuk.svg',
            customData: { color: "#111111" }
        }, 1);

        this.inventory.addItem({
            id: 'shirt_white',
            className: 'Apparel',
            name: 'White Shirt',
            description: 'A white button-down shirt.',
            equipSlot: 'shirt',
            icon: 'mitzvahWorld/icons/items/shirt.svg',
            customData: { color: "#FFFFFF" }
        }, 1);
        
        // --- B"H NATURE TOOLS ---
        // Trees
        const trees = [
            { name: 'Oak Large', preset: 'Oak Large' },
            { name: 'Oak Medium', preset: 'Oak Medium' },
            { name: 'Pine Large', preset: 'Pine Large' },
            { name: 'Birch/Aspen', preset: 'Aspen Medium' },
            { name: 'Willow', preset: 'Willow' },
            { name: 'Ash Large', preset: 'Ash Large' },
            { name: 'Bush', preset: 'Bush 1' }
        ];
        
        trees.forEach(t => {
            this.inventory.addItem({
                id: 'tree_' + t.preset.replace(/\s/g, '_').toLowerCase(),
                className: 'ProceduralTree',
                name: t.name + " Seed",
                description: 'Plants a ' + t.name,
                preset: t.preset,
                icon: 'mitzvahWorld/icons/items/tree_seed_oak.svg'
            }, 5);
        });

        // Nature Painters
        this.inventory.addItem({
            id: 'grass_painter',
            className: 'NatureTool',
            name: 'Grass Seeds',
            description: 'Hold click to paint grass.',
            natureType: 'grass',
            icon: 'mitzvahWorld/icons/items/grass_seeds.svg'
        }, 1);
        
        this.inventory.addItem({
            id: 'rock_painter',
            className: 'NatureTool',
            name: 'Rock Bag',
            description: 'Hold click to place various rocks.',
            natureType: 'rock',
            icon: 'mitzvahWorld/icons/items/rock_bag.svg'
        }, 1);

        this.inventory.addItem({
            id: 'flower_painter',
            className: 'NatureTool',
            name: 'Flower Bag',
            description: 'Hold click to plant flowers.',
            natureType: 'flower',
            icon: 'mitzvahWorld/icons/items/grass_seeds.svg' // Reusing grass icon for now
        }, 1);
        
        // Default Building Blocks
	    this.inventory.addItem({
	        id: 'brick_1x1x1',
	        className: 'Brick',
	        name: 'Standard Brick',
	        description: 'A classic 1x1x1 brick.'
	    }, 64);
    }
}
