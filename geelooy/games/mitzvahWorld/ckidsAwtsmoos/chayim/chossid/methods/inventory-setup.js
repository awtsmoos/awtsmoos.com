

/**
 * B"H
 * @file inventorySetup.js
 * Default inventory configuration for the Chossid.
 */

export default {
    setupDefaultInventory() {
        // --- HELPERS ---
        const svgToBase64 = (svg) => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));

        // --- ICONS ---
        const icons = {
            remover: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="red" stroke-width="10"/><line x1="20" y1="20" x2="80" y2="80" stroke="red" stroke-width="10"/></svg>`),
            hammer: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI0NTEzO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNBMDUyMkQ7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjQ1MTM7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRDcwMDtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGQTUwMDtzdG9wLW9wYWNpdHk6MSIvPjwvbGluZWFyR3JhZGllbnQ+PGZpbHRlciBpZD0iYyIgeD0iLTIwJSIgeT0iLTIwJSIgd2lkdGg9IjE0MCUiIGhlaWdodD0iMTQwJSI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNSIgcmVzdWx0PSJibHVyIi8+PGZlQ29tcG9zaXRlIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImJsdXIiIG9wZXJhdG9yPSJvdmVyIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHg9IjIzNiIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iMzAwIiByeD0iNSIgZmlsbD0idXJsKCNhKSIgc3Ryb2tlPSIjNWUzMDBkIiBzdHJva2Utd2lkdGg9IjIiIHRyYW5zZm9ybT0icm90YXRlKC0xNSAyNTYgMjU2KSIvPjxnIHRyYW5zZm9ybT0icm90YXRlKC0xNSAyNTYgMjU2KSI+PHJlY3QgeD0iMTY2IiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4MCIgcng9IjUiIGZpbGw9IiM1NTUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMjI2IiB5PSI4MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0idXJsKCNiKSIgc3Ryb2tlPSIjQjg4NjBCIiBzdHJva2Utd2lkdGg9IjQiIGZpbHRlcj0idXJsKCNjKSIvPjxwYXRoIGQ9Ik0yODYgMTEwbDEwIDIwIDIwIDEwLTIwIDEwLTEwIDIwLTEwLTIwLTIwLTEwIDIwLTEweiIgZmlsbD0iI0ZGRiIgZmlsbC1vcGFjaXR5PSIuOCIvPjwvZz48cGF0aCBkPSJNMzYwIDgwbDIwLTIwTTM3MCAxMDBoMzBNMzYwIDEyMGwyMCAyMCIgc3Ryb2tlPSIjMDBGRkZGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==`,
            teffilinHead: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" rx="5" fill="#111" stroke="#333" stroke-width="2"/><rect x="35" y="35" width="30" height="30" fill="#000"/><path d="M40 60 L40 45 L50 60 L60 45 L60 60" stroke="#fff" stroke-width="2" fill="none" opacity="0.8"/><path d="M25 50 L10 50 M75 50 L90 50" stroke="#000" stroke-width="6"/></svg>`),
            teffilinArm: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="30" y="30" width="40" height="40" rx="4" fill="#111" stroke="#333" stroke-width="2"/><circle cx="50" cy="50" r="35" stroke="#000" stroke-width="4" fill="none" stroke-dasharray="10 5"/><line x1="70" y1="50" x2="95" y2="50" stroke="#000" stroke-width="6"/></svg>`),
            fedora: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="hatGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#333"/><stop offset="100%" stop-color="#000"/></linearGradient></defs><ellipse cx="50" cy="70" rx="45" ry="10" fill="#000"/><path d="M25 65 L30 20 Q50 10 70 20 L75 65 Z" fill="url(#hatGrad)"/><path d="M26 60 Q50 65 74 60 L75 65 Q50 70 25 65 Z" fill="#111"/></svg>`),
            sirtuk: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 20 Q50 10 80 20 L85 90 L15 90 Z" fill="#111" stroke="#333" stroke-width="2"/><path d="M50 20 L50 90" stroke="#000" stroke-width="2"/><path d="M50 20 L35 40 M50 20 L65 40" stroke="#333" stroke-width="1"/><circle cx="55" cy="50" r="2" fill="#333"/><circle cx="55" cy="60" r="2" fill="#333"/><circle cx="55" cy="70" r="2" fill="#333"/></svg>`),
            shirt: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 20 Q50 10 80 20 L80 90 L20 90 Z" fill="#fff" stroke="#ccc" stroke-width="2"/><path d="M35 20 L50 30 L65 20" fill="none" stroke="#ccc" stroke-width="2"/><path d="M50 20 L50 90" stroke="#eee" stroke-width="1"/><circle cx="50" cy="40" r="2" fill="#ccc"/><circle cx="50" cy="55" r="2" fill="#ccc"/><circle cx="50" cy="70" r="2" fill="#ccc"/></svg>`),
            seedOak: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#8B4513" stroke="#4A2511" stroke-width="3"/><path d="M50 20 L50 80 M50 50 L80 40 M50 60 L20 40" stroke="#4A2511" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="10" fill="#228B22"/><circle cx="80" cy="40" r="10" fill="#228B22"/><circle cx="20" cy="40" r="10" fill="#228B22"/></svg>`),
            seedPine: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#5D4037" stroke="#3E2723" stroke-width="3"/><polygon points="50,15 70,70 30,70" fill="#2E7D32"/><rect x="45" y="70" width="10" height="15" fill="#4A2511"/></svg>`),
            grass: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 90 Q30 90 30 50 M30 90 Q50 90 50 30 M50 90 Q70 90 70 50 M70 90 Q90 90 90 60" stroke="#32CD32" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="20" cy="80" r="3" fill="#8B4513"/><circle cx="40" cy="85" r="3" fill="#8B4513"/><circle cx="60" cy="80" r="3" fill="#8B4513"/><circle cx="80" cy="85" r="3" fill="#8B4513"/></svg>`),
            rocks: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 30 Q50 10 80 30 L90 80 Q50 100 10 80 Z" fill="#A1887F" stroke="#5D4037" stroke-width="3"/><circle cx="40" cy="50" r="10" fill="#757575"/><circle cx="65" cy="60" r="8" fill="#616161"/><path d="M35 30 Q50 20 65 30" stroke="#5D4037" stroke-width="2" fill="none"/></svg>`),
            flowers: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 50 L50 90" stroke="green" stroke-width="3"/><circle cx="50" cy="50" r="10" fill="yellow"/><circle cx="50" cy="30" r="10" fill="pink"/><circle cx="70" cy="50" r="10" fill="pink"/><circle cx="30" cy="50" r="10" fill="pink"/><circle cx="50" cy="70" r="10" fill="pink"/></svg>`)
        };

        // --- TOOLS ---
        this.inventory.addItem({
            id: 'remover_tool',
            className: 'Tool',
            name: 'Remover',
            description: 'Removes equipped items.',
            icon: icons.remover
        }, 1);

        this.inventory.addItem({
            id: 'sparks_hammer',
            className: 'Tool', 
            name: 'Sparks Collector',
            description: 'Use this to retrieve sparks (blocks) from the world.',
            icon: icons.hammer
        }, 1);
        
        // B"H: Character Designer
        this.inventory.addItem({
            id: 'character_maker',
            className: 'CharacterMaker',
            name: 'Neshama Maker',
            description: 'Design custom NPCs.',
            quantity: 1
        }, 1);

        // --- B"H MITZVAH ITEMS & APPAREL ---
        this.inventory.addItem({
            id: 'teffilin_rashi_head',
            className: 'Apparel',
            name: 'Teffilin Shel Rosh',
            description: 'Head Teffilin (Rashi).',
            equipSlot: 'head',
            icon: icons.teffilinHead,
            customData: { color: "#000000" }
        }, 1);

        this.inventory.addItem({
            id: 'teffilin_rashi_arm',
            className: 'Apparel',
            name: 'Teffilin Shel Yad',
            description: 'Arm Teffilin (Rashi).',
            equipSlot: 'leftHand',
            icon: icons.teffilinArm,
            customData: { color: "#000000" }
        }, 1);

        this.inventory.addItem({
            id: 'hat_fedora',
            className: 'Apparel',
            name: 'Fedora',
            description: 'A black hat.',
            equipSlot: 'head',
            icon: icons.fedora,
            customData: { color: "#111111" }
        }, 1);

        this.inventory.addItem({
            id: 'jacket_sirtuk',
            className: 'Apparel',
            name: 'Sirtuk',
            description: 'A long Chassidic coat.',
            equipSlot: 'jacket',
            icon: icons.sirtuk,
            customData: { color: "#111111" }
        }, 1);

        this.inventory.addItem({
            id: 'shirt_white',
            className: 'Apparel',
            name: 'White Shirt',
            description: 'A white button-down shirt.',
            equipSlot: 'shirt',
            icon: icons.shirt,
            customData: { color: "#FFFFFF" }
        }, 1);
        
        // --- B"H NATURE TOOLS ---
        const trees = [
            { name: 'Oak Large', preset: 'Oak Large', icon: icons.seedOak },
            { name: 'Oak Medium', preset: 'Oak Medium', icon: icons.seedOak },
            { name: 'Pine Large', preset: 'Pine Large', icon: icons.seedPine },
            { name: 'Birch/Aspen', preset: 'Aspen Medium', icon: icons.seedOak },
            { name: 'Willow', preset: 'Willow', icon: icons.seedOak },
            { name: 'Ash Large', preset: 'Ash Large', icon: icons.seedOak },
            { name: 'Bush', preset: 'Bush 1', icon: icons.seedOak }
        ];
        
        trees.forEach(t => {
            this.inventory.addItem({
                id: 'tree_' + t.preset.replace(/\s/g, '_').toLowerCase(),
                className: 'ProceduralTree',
                name: t.name + " Seed",
                description: 'Plants a ' + t.name,
                preset: t.preset,
                icon: t.icon
            }, 5);
        });

        this.inventory.addItem({
            id: 'grass_painter',
            className: 'NatureTool',
            name: 'Grass Seeds',
            description: 'Hold click to paint grass.',
            natureType: 'grass',
            icon: icons.grass
        }, 1);
        
        this.inventory.addItem({
            id: 'rock_painter',
            className: 'NatureTool',
            name: 'Rock Bag',
            description: 'Hold click to place various rocks.',
            natureType: 'rock',
            icon: icons.rocks
        }, 1);

        this.inventory.addItem({
            id: 'flower_painter',
            className: 'NatureTool',
            name: 'Flower Bag',
            description: 'Hold click to plant flowers.',
            natureType: 'flower',
            icon: icons.flowers
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
