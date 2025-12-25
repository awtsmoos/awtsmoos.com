
/**
 * B"H
 * @file inventorySetup.js
 */

export default {
    setupDefaultInventory() {
        const svgToBase64 = (svg) => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        
        const icons = {
            pickaxe: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 20 L20 50 L30 60 L50 40 Z" fill="#888" stroke="#333" stroke-width="2"/><rect x="45" y="40" width="10" height="50" fill="#8B4513"/></svg>`),
            road: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#333"/><line x1="50" y1="10" x2="50" y2="90" stroke="#fff" stroke-dasharray="10 5" stroke-width="2"/></svg>`),
            car: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="40" width="80" height="30" fill="red"/><circle cx="25" cy="70" r="10" fill="black"/><circle cx="75" cy="70" r="10" fill="black"/></svg>`),
            chariot: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 50 Q50 80 90 50" fill="#FFD700" stroke="#B8860B" stroke-width="3"/><circle cx="50" cy="50" r="40" fill="none" stroke="#FFD700" stroke-width="2"/><path d="M20 50 L80 50" stroke="#fff" stroke-width="2"/></svg>`),
            hoverboard: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="60" width="60" height="10" rx="5" fill="#00ffff" stroke="#fff"/><path d="M20 75 Q50 90 80 75" fill="none" stroke="#00ffff" stroke-width="2" opacity="0.5"/></svg>`),
            hook: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 20 L50 50 L80 20" stroke="#00ff00" stroke-width="5" fill="none"/><circle cx="50" cy="80" r="10" fill="#555"/></svg>`),
            shovel: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNMTk2LjUgMzI1LjUgTCAxNDYuNSAzNzUuNSBMIDM2LjUgMjY1LjUgTCA4Ni41IDIxNS41IEwgMTk2LjUgMzI1LjUgWiIgZmlsbD0iIzhCNDUxMyIgc3Ryb2tlPSIjNTQzIiBzdHJva2Utd2lkdGg9IjUiLz48cGF0aCBkPSJNMTk2LjUgMzI1LjUgTCAzMTYuNSA0NDUuNSBMIDQ0Ni41MxI1LjUgTCAzMjYuNSAxOTUuNSBaIiBmaWxsPSIjQzBDMEMwIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iNSIvPjwvc3ZnPg==",
            boat: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 60 Q50 90 90 60 L80 40 H20 Z" fill="#8B4513"/><rect x="45" y="10" width="10" height="50" fill="#654321"/><path d="M55 15 L85 35 L55 50 Z" fill="white"/></svg>`),
            balloon: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="40" r="30" fill="red"/><rect x="40" y="80" width="20" height="15" fill="#8B4513"/><line x1="30" y1="55" x2="40" y2="80" stroke="black"/><line x1="70" y1="55" x2="60" y2="80" stroke="black"/></svg>`),
            rod: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 80 L80 20" stroke="#8B4513" stroke-width="3"/><path d="M80 20 Q90 50 80 80" stroke="#ccc" stroke-width="1" fill="none"/><circle cx="80" cy="80" r="3" fill="red"/></svg>`),
            lava: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M25 30 L30 90 L70 90 L75 30 Z" fill="#888" stroke="#444" stroke-width="2"/><path d="M30 35 Q50 45 70 35" fill="#ff4500"/><circle cx="40" cy="50" r="2" fill="#fff" opacity="0.5"/><circle cx="60" cy="60" r="3" fill="#fff" opacity="0.5"/></svg>`)
        };

        // --- TOOLS ---
        this.inventory.addItem({
            id: 'pickaxe_tool', className: 'Pickaxe', name: 'Iron Pickaxe',
            description: 'Mines stone from the earth.', icon: icons.pickaxe
        }, 1);

        this.inventory.addItem({
            id: 'road_tool', className: 'RoadTool', name: 'Road Paver',
            description: 'Consumes stone to build roads.', icon: icons.road
        }, 1);
        
        this.inventory.addItem({
            id: 'shovel_tool', className: 'Shovel', name: 'Excavator',
            description: 'Dig holes.', icon: icons.shovel
        }, 1);
        
        this.inventory.addItem({
            id: 'grappling_hook', className: 'GrapplingHook', name: 'Elisha Hook',
            description: 'Pull yourself to holiness.', icon: icons.hook,
            isTool: true
        }, 1);
        
        this.inventory.addItem({
            id: 'fishing_rod', className: 'FishingRod', name: 'Fishing Rod',
            description: 'Catch fish.', icon: icons.rod,
            isTool: true
        }, 1);
        
        this.inventory.addItem({
            id: 'telescope', className: 'Telescope', name: 'Telescope',
            description: 'See far.', 
            isTool: true
        }, 1);

        // --- VEHICLES ---
        this.inventory.addItem({
            id: 'car_spawner', className: 'ProceduralCar', name: 'Merkavah',
            description: 'A procedural car.', icon: icons.car,
            isBuildable: true
        }, 1);
        
        this.inventory.addItem({
            id: 'chariot_spawner', className: 'MagicalChariot', name: 'Sky Chariot',
            description: 'A magical flying carriage.', icon: icons.chariot,
            isBuildable: true
        }, 1);
        
        this.inventory.addItem({
            id: 'hoverboard_spawner', className: 'Hoverboard', name: 'Hoverboard',
            description: 'Levitate with speed.', icon: icons.hoverboard,
            isBuildable: true
        }, 1);
        
        this.inventory.addItem({
            id: 'boat_spawner', className: 'ProceduralBoat', name: 'Teiva',
            description: 'A boat.', icon: icons.boat,
            isBuildable: true
        }, 1);
        
        this.inventory.addItem({
            id: 'balloon_spawner', className: 'HotAirBalloon', name: 'Balloon',
            description: 'Hot air balloon.', icon: icons.balloon,
            isBuildable: true
        }, 1);

        // --- NATURE / FARMING ---
        this.inventory.addItem({
            id: 'nature_bag_grass', className: 'NatureTool', name: 'Grass Seeds',
            natureType: 'grass',
            description: 'Plant grass.', isPainter: true
        }, 1);
        
        this.inventory.addItem({
            id: 'wheat_seeds', className: 'Wheat', name: 'Wheat Seeds',
            description: 'Plant wheat.', isBuildable: true
        }, 10);
        
        this.inventory.addItem({
            id: 'tree_seed_oak', className: 'ProceduralTree', name: 'Oak Seed',
            preset: 'Oak Medium', isBuildable: true
        }, 5);
        
        // --- STRUCTURES ---
        this.inventory.addItem({
             id: 'blueprint_house', className: 'Blueprint', name: 'House Plan',
             description: 'Procedural house.',
             isBuildable: true
        }, 1);
        
        this.inventory.addItem({
            id: 'pool_kit', className: 'ProceduralPool', name: 'Mikvah Kit',
            description: 'Build a pool.', isBuildable: true
        }, 1);

        this.inventory.addItem({
            id: 'lava_bucket', className: 'Lava', name: 'Magma Bucket',
            description: 'Place flowing lava.', isBuildable: true,
            icon: icons.lava
        }, 1);
        
        this.inventory.addItem({
            id: 'mill_kit', className: 'Mill', name: 'Mill Kit',
            isBuildable: true
        }, 1);
        
        this.inventory.addItem({
            id: 'oven_kit', className: 'Oven', name: 'Oven Kit',
            isBuildable: true
        }, 1);
        
        this.inventory.addItem({
            id: 'fire_kit', className: 'Fire', name: 'Eternal Flame',
            isBuildable: true
        }, 1);
        
        // --- RESOURCES ---
        this.inventory.addItem({
            id: 'stone_chunk', className: 'CollectableItem', name: 'Stone Chunk',
            quantity: 50
        }, 50);
        
        this.inventory.addItem({
            id: 'bucket_water', className: 'Tool', name: 'Water Bucket',
            quantity: 5
        }, 5);
    }
}
        