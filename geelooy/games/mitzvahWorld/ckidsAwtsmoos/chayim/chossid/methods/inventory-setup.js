


/**
 * B"H
 * @file inventorySetup.js
 * Default inventory configuration for the Chossid.
 */

export default {
    setupDefaultInventory() {
        // B"H: Remover Item
        this.inventory.addItem({
            id: 'remover_tool',
            className: 'Tool',
            name: 'Remover',
            description: 'Removes equipped items.',
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZWQiIHN0cm9rZS13aWR0aD0iMTAiLz48bGluZSB4MT0iMjAiIHkxPSIyMCIgeDI9IjgwIiB5Mj0iODAiIHN0cm9rZT0icmVkIiBzdHJva2Utd2lkdGg9IjEwIi8+PC9zdmc+' // Red circle slash
        }, 1);

        // B"H: Sparks Hammer
        const hammerIcon = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI0NTEzO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNBMDUyMkQ7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjQ1MTM7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRDcwMDtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGQTUwMDtzdG9wLW9wYWNpdHk6MSIvPjwvbGluZWFyR3JhZGllbnQ+PGZpbHRlciBpZD0iYyIgeD0iLTIwJSIgeT0iLTIwJSIgd2lkdGg9IjE0MCUiIGhlaWdodD0iMTQwJSI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNSIgcmVzdWx0PSJibHVyIi8+PGZlQ29tcG9zaXRlIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImJsdXIiIG9wZXJhdG9yPSJvdmVyIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHg9IjIzNiIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iMzAwIiByeD0iNSIgZmlsbD0idXJsKCNhKSIgc3Ryb2tlPSIjNWUzMDBkIiBzdHJva2Utd2lkdGg9IjIiIHRyYW5zZm9ybT0icm90YXRlKC0xNSAyNTYgMjU2KSIvPjxnIHRyYW5zZm9ybT0icm90YXRlKC0xNSAyNTYgMjU2KSI+PHJlY3QgeD0iMTY2IiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4MCIgcng9IjUiIGZpbGw9IiM1NTUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMjI2IiB5PSI4MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0idXJsKCNiKSIgc3Ryb2tlPSIjQjg4NjBCIiBzdHJva2Utd2lkdGg9IjQiIGZpbHRlcj0idXJsKCNjKSIvPjxwYXRoIGQ9Ik0yODYgMTEwbDEwIDIwIDIwIDEwLTIwIDEwLTEwIDIwLTEwLTIwLTIwLTEwIDIwLTEweiIgZmlsbD0iI0ZGRiIgZmlsbC1vcGFjaXR5PSIuOCIvPjwvZz48cGF0aCBkPSJNMzYwIDgwbDIwLTIwTTM3MCAxMDBoMzBNMzYwIDEyMGwyMCAyMCIgc3Ryb2tlPSIjMDBGRkZGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==`;

        this.inventory.addItem({
            id: 'sparks_hammer',
            className: 'Tool', 
            name: 'Sparks Collector',
            description: 'Use this to retrieve sparks (blocks) from the world.',
            icon: hammerIcon
        }, 1);
        
        this.inventory.addItem({
            id: 'neshama_maker',
            className: 'CharacterMaker',
            name: 'Neshama Maker',
            description: 'Design and create new souls.',
            icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjIwMCIgZmlsbD0iIzRmNDRmNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIwIi8+PHBhdGggZD0iTTE1NiAxNTZhMTAwIDEwMCAwIDAgMSAyMDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4="
        }, 1);

        // B"H: Teffilin Bag (Apparel Container)
        this.inventory.addItem({
            id: 'rashi_teffilin_bag',
            className: 'Apparel', 
            isContainer: true,
            name: 'Rashi Teffilin',
            description: 'A velvet bag containing Rashi Teffilin.',
            icon: '👜', // Emoji Icon
            customData: {
                slots: [
                    {
                        id: 'teffilin_arm_rashi',
                        className: 'Apparel',
                        name: 'Teffilin Shel Yad',
                        description: 'Teffilin for the arm.',
                        equipSlot: 'leftHand',
                        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHJlY3QgeD0iMTUiIHk9IjE1IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTSAzNSAyNSBMIDQ1IDI1IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjMiLz48L3N2Zz4=',
                        quantity: 1
                    },
                    {
                        id: 'teffilin_head_rashi',
                        className: 'Apparel',
                        name: 'Teffilin Shel Rosh',
                        description: 'Teffilin for the head.',
                        equipSlot: 'head',
                        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHJlY3QgeD0iMTUiIHk9IjEwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTSAyNSAzMCBMIDQ1IDMwIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjMiLz48L3N2Zz4=',
                        quantity: 1
                    },
                    null, null
                ]
            }
        }, 1);

        // B"H: Small Pouch
        this.inventory.addItem({
            id: 'small_pouch',
            className: 'Container',
            name: 'Small Pouch',
            description: 'A small briefcase. Holds 4 items.',
            icon: '💼',
            customData: {
                slots: [null, null, null, null]
            }
        });

        // B"H: Large Backpack
        this.inventory.addItem({
            id: 'large_backpack',
            className: 'Container',
            name: 'Large Backpack',
            description: 'A large suitcase. Holds 16 items.',
            icon: '🧳',
            customData: {
                slots: new Array(16).fill(null)
            }
        });

        // B"H: Colored Jackets and Hats
        const colors = [
            { name: "White", hex: "#FFFFFF" },
            { name: "Grey", hex: "#808080" },
            { name: "Blue", hex: "#0000FF" },
            { name: "Black", hex: "#111111" }
        ];

        // Jacket Icon (SVG)
        const jacketIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNIDIwIDE1IEwgMjAgOTAgTCA4MCA5MCBMIDgwIDE1IEwgNjAgMTUgTCA1MCAyNSBMIDQwIDE1IFoiIGZpbGw9IndoaXRlIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgLz48L3N2Zz4=';
        
        // B"H: PROPER Top Hat Icon
        const hatIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNIDIwIDcwIEwgODAgNzAgTCA4MCA4MCBMIDIwIDgwIFogTSAzMCAzMCBMIDcwIDMwIEwgNzAgNzAgTCAzMCA3MCBaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjMiLz48L3N2Zz4=';

        // Shirt Icon (Simple T-shirt shape)
        const shirtIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNIDIwIDIwIEwgMzAgMTAgTCA3MCAxMCBMIDgwIDIwIEwgODAgODAgTCAyMCA4MCBaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=';
        
        // Pants Icon
        const pantsIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNIDMwIDEwIEwgNzAgMTAgTCA3MCA5MCBMIDU1IDkwIEwgNTAgNDAgTCA0NSA5MCBMIDMwIDkwIFoiIGZpbGw9IndoaXRlIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';

        // Shoes Icon
        const shoeIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNIDEwIDUwIEwgNjAgNTAgTCA4MCA3MCBMIDgwIDgwIEwgMTAgODAgWiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';


        colors.forEach(c => {
            this.inventory.addItem({
                id: `jacket_${c.name.toLowerCase()}`,
                className: 'Apparel',
                name: `${c.name} Jacket`,
                description: `A stylish ${c.name.toLowerCase()} jacket.`,
                equipSlot: 'jacket',
                icon: jacketIcon,
                customData: { color: c.hex } // B"H: Color for tinting
            });
            
            this.inventory.addItem({
                id: `hat_${c.name.toLowerCase()}`,
                className: 'Apparel',
                name: `${c.name} Hat`,
                description: `A ${c.name.toLowerCase()} fedora.`,
                equipSlot: 'head',
                icon: hatIcon,
                customData: { color: c.hex } // B"H: Color for tinting
            });

            this.inventory.addItem({
                id: `shirt_${c.name.toLowerCase()}`,
                className: 'Apparel',
                name: `${c.name} Shirt`,
                description: `A clean ${c.name.toLowerCase()} shirt.`,
                equipSlot: 'shirt',
                icon: shirtIcon,
                customData: { color: c.hex }
            });
        });

        // B"H: Add Pants
        this.inventory.addItem({
            id: 'pants_jeans',
            className: 'Apparel',
            name: 'Blue Jeans',
            description: 'Classic denim.',
            equipSlot: 'legs',
            icon: pantsIcon,
            customData: { color: '#336699' }
        });
        
        this.inventory.addItem({
            id: 'pants_black',
            className: 'Apparel',
            name: 'Black Slacks',
            description: 'Formal trousers.',
            equipSlot: 'legs',
            icon: pantsIcon,
            customData: { color: '#111111' }
        });

        // B"H: Add Shoes
        this.inventory.addItem({
            id: 'shoes_red',
            className: 'Apparel',
            name: 'Red Sneakers',
            description: 'Fast shoes.',
            equipSlot: 'feet',
            icon: shoeIcon,
            customData: { color: '#FF0000' }
        });
        
        this.inventory.addItem({
            id: 'shoes_brown',
            className: 'Apparel',
            name: 'Brown Boots',
            description: 'Leather boots.',
            equipSlot: 'feet',
            icon: shoeIcon,
            customData: { color: '#8B4513' }
        });

        // Default Building Blocks
	    this.inventory.addItem({
	        id: 'brick_1x1x1',
	        className: 'Brick',
	        name: 'Standard Brick',
	        description: 'A classic 1x1x1 brick.'
	    }, 64);
    }
}
