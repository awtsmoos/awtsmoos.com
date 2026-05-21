
// B"H
// js/workers/world/movement.js
import { TILE_SIZE, PLAYER_SPEED } from '../../data/database.js';
import { generateChunk } from '../../procedural/world_generator.js';
import { blocksMovement, getEntityAt } from './entity/occupancy.js';

export function updatePosition(state, deltaTime, trigger) {
    const p = state.player;
    
    // SPRINT LOGIC
    // Assuming 'Shift' key state is passed through input.js -> gameWorker.js -> here
    let speed = PLAYER_SPEED;
    if (state.keys && state.keys['Shift']) {
        speed = PLAYER_SPEED * 1.5; // 50% faster
    }

    const velocity = (TILE_SIZE / speed) * 1000;
    const moveDistance = velocity * (deltaTime / 1000);

    if (p.targetX > p.x) p.pixelX = Math.min(p.pixelX + moveDistance, p.targetX * TILE_SIZE);
    else if (p.targetX < p.x) p.pixelX = Math.max(p.pixelX - moveDistance, p.targetX * TILE_SIZE);
    if (p.targetY > p.y) p.pixelY = Math.min(p.pixelY + moveDistance, p.targetY * TILE_SIZE);
    else if (p.targetY < p.y) p.pixelY = Math.max(p.pixelY - moveDistance, p.targetY * TILE_SIZE);

    if (p.pixelX === p.targetX * TILE_SIZE && p.pixelY === p.targetY * TILE_SIZE) {
        p.isMoving = false;
        p.x = p.targetX;
        p.y = p.targetY;
        
        // --- INFINITE WORLD LOGIC ---
        checkMapTransition(state);
        
        checkTileLandedOn(state, trigger);
    }
}

function checkMapTransition(state) {
    const map = state.maps[state.currentMapId];
    const p = state.player;
    let newWorldX = map.worldX !== undefined ? map.worldX : 0;
    let newWorldY = map.worldY !== undefined ? map.worldY : 0;
    let changed = false;
    let newPlayerX = p.x;
    let newPlayerY = p.y;

    // Check Bounds
    if (p.x <= 0) { newWorldX--; newPlayerX = map.width - 2; changed = true; }
    else if (p.x >= map.width - 1) { newWorldX++; newPlayerX = 1; changed = true; }
    else if (p.y <= 0) { newWorldY--; newPlayerY = map.height - 2; changed = true; }
    else if (p.y >= map.height - 1) { newWorldY++; newPlayerY = 1; changed = true; }

    if (changed) {
        // If we are in a static map (like the village), transitioning out puts us at (0,0) or (0,1) etc.
        // If we are already in a procedural chunk, we calculate neighbors.
        
        const newMapId = `world_${newWorldX}_${newWorldY}`;
        
        // If map doesn't exist, generate it
        if (!state.maps[newMapId]) {
            state.maps[newMapId] = generateChunk(newWorldX, newWorldY);
        }
        
        state.currentMapId = newMapId;
        p.x = p.targetX = p.startX = newPlayerX;
        p.y = p.targetY = p.startY = newPlayerY;
        p.pixelX = p.x * TILE_SIZE;
        p.pixelY = p.y * TILE_SIZE;
    }
}

export function attemptMove(state, direction) {
    const p = state.player;
    
    // --- CONFUSION OF TONGUES LOGIC ---
    // If in Babel, controls are reversed
    let processedDirection = direction;
    if (state.currentMapId.startsWith('babel_') || state.currentMapId === 'babel_ruins') {
        if (direction === 'up') processedDirection = 'down';
        else if (direction === 'down') processedDirection = 'up';
        else if (direction === 'left') processedDirection = 'right';
        else if (direction === 'right') processedDirection = 'left';
    }

    p.direction = processedDirection;
    
    let dx = 0, dy = 0;
    if (processedDirection === 'up') dy = -1;
    if (processedDirection === 'down') dy = 1;
    if (processedDirection === 'left') dx = -1;
    if (processedDirection === 'right') dx = 1;
    
    const tx = p.x + dx;
    const ty = p.y + dy;
    const map = state.maps[state.currentMapId];
    
    // Allow moving "Off" the map to trigger transition
    if (tx < 0 || ty < 0 || ty >= map.baseLayer.length || tx >= map.baseLayer[0].length) {
         p.isMoving = true; p.startX = p.x; p.startY = p.y; p.targetX = tx; p.targetY = ty;
         return;
    }
    
    // Check Solid
    const tile = map.baseLayer[ty][tx];
    // Expanded solid tiles list
    const solidTiles = ['🌳', '🏠', '🪨', '🔥', '🌊', '💎', '📜', '📚', '🕳️', '👨‍🏫', '👨', '👨‍🌾', '🐂', '🛒', '🚪', '☁️', '⬛', '🧱', '🛡️', '⚠️', '🌲', '🪵', '🍄', '🌵', '🐪', '⛰️', '🧗', '🦅', '🚤', '🦈', '🏝️', '🕸️', '🕷️', '💀', '🏛️', '🗼'];
    if (solidTiles.includes(tile)) return;
    
    // Check entity occupancy. The entity registry decides blocking, not tile art.
    const entity = getEntityAt(map, tx, ty);
    if (blocksMovement(entity)) return;
    
    // Check Bots
    const bot = state.bots && state.bots.find(b => b.mapId === state.currentMapId && b.targetX === tx && b.targetY === ty);
    if (bot) return;

    p.isMoving = true; p.startX = p.x; p.startY = p.y; p.targetX = tx; p.targetY = ty;
}

function checkTileLandedOn(state, trigger) {
    const p = state.player;
    const map = state.maps[state.currentMapId];
    // In procedural maps, map.baseLayer might be just strings
    const tileChar = map.baseLayer[p.y]?.[p.x];

    if (map.encounters && map.encounters[tileChar] && Math.random() < 0.25) {
        let list = map.encounters[tileChar];
        
        // --- NIGHT SPAWNS ---
        const isNight = state.time.totalMinutes >= 1080 || state.time.totalMinutes < 360;
        if (isNight) {
            // Add Night specific mobs to potential pool
            list = [...list, { id: 'thief_in_night', levelRange: [20, 30], chance: 0.1 }];
            if (Math.random() < 0.2) {
                // Higher chance for Qliphoth at night
                list.push({ id: 'darkness_creeper', levelRange: [25, 35], chance: 0.2 });
            }
        }

        const r = Math.random();
        let acc = 0;
        for (const e of list) {
            acc += e.chance;
            if (r < acc) {
                const lvl = Math.floor(Math.random() * (e.levelRange[1] - e.levelRange[0] + 1)) + e.levelRange[0];
                trigger.startBattle([{ id: e.id, level: lvl }]);
                return;
            }
        }
    }
}
