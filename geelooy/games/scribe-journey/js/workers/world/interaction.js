
// B"H
// js/workers/world/interaction.js
import { TILE_SIZE } from '../../data/database.js';
import * as Shop from '../shop.js';
import * as BotSystem from '../botSystem.js';
import * as Quests from '../quests.js';
import { generateTractateMap } from '../../procedural/map_generator.js';
import { startDialogue, advanceDialogue, handleDialogueChoice } from './dialogue.js';
import { clearEntityTile, getEntityAt } from './entity/occupancy.js';

export function checkInteraction(state, trigger, sendUIUpdate) {
    if (state.player.isMoving || state.dialogue.active) return;
    const p = state.player;
    let tx = p.x, ty = p.y;
    if (p.direction === 'up') ty--; else if (p.direction === 'down') ty++;
    else if (p.direction === 'left') tx--; else if (p.direction === 'right') tx++;

    // 1. Bots
    const bot = state.bots && state.bots.find(b => b.mapId === state.currentMapId && b.x === tx && b.y === ty);
    if(bot) { BotSystem.interactWithBot(state, bot.id, sendUIUpdate, trigger); return; }

    // 2. Map Entities
    const map = state.maps[state.currentMapId];
    const entity = getEntityAt(map, tx, ty);
    
    // Check for bookshelf interactions (Generic)
    if (!entity && map.baseLayer[ty] && (map.baseLayer[ty][tx] === '📚' || map.baseLayer[ty][tx] === '📖')) {
        trigger.study_daily();
        return;
    }
    
    if (entity) {
        // --- PICKUP ITEM LOGIC ---
        if (entity.pickup) {
            Quests.giveItem(state, entity.pickup, 1, (msg) => trigger.sendToast(msg, 'success')); 
            clearEntityTile(map, entity);
            return;
        }

        // --- FARMING LOGIC ---
        if (entity.type === 'farm_soil') {
            handleFarming(state, entity, sendUIUpdate);
            return;
        }

        if (entity.type === 'door') {
             // Handle Procedural Generation Trigger (Tractate)
            if (entity.targetMap === 'procedural_tractate') {
                 const seed = Date.now();
                 const newMapId = `tractate_${seed}`;
                 const newMap = generateTractateMap(seed, state.player.level || 5, 'tractate');
                 state.maps[newMapId] = newMap;
                 state.currentMapId = newMapId;
                 p.x = p.targetX = Math.floor(newMap.width/2);
                 p.y = p.targetY = Math.floor(newMap.baseLayer.length/2);
                 p.pixelX = p.x * TILE_SIZE; p.pixelY = p.y * TILE_SIZE;
                 return;
            }
            
            // --- TOWER OF 1234 GENERATION ---
            if (entity.targetMap.startsWith('tower_floor_')) {
                const floorNum = parseInt(entity.targetMap.split('_')[2]);
                if (!state.maps[entity.targetMap]) {
                    // Generate it if it doesn't exist
                    const seed = Date.now() + floorNum;
                    const newMap = generateTractateMap(seed, floorNum, 'tower');
                    state.maps[entity.targetMap] = newMap;
                }
                // Transition will happen below normally now that map exists
            }

            // Check conditions (Key Items etc)
            if (entity.condition) {
                if (entity.condition.type === 'hasItem') {
                    const has = state.player.inventory.some(i => i.id === entity.condition.itemId);
                    if (!has) {
                        sendUIUpdate({ dialogue: { active: true, text: entity.dialogue && entity.dialogue.start ? entity.dialogue.start[0] : "Locked." } });
                        return;
                    }
                }
                if (entity.condition.type === 'stat') {
                    if ((state.player.stats && state.player.stats[entity.condition.stat] || 0) < entity.condition.value) {
                         sendUIUpdate({ dialogue: { active: true, text: entity.dialogue.start[0] } });
                         return;
                    }
                }
            }

            state.currentMapId = entity.targetMap;
            p.x = p.startX = p.targetX = entity.targetX;
            p.y = p.startY = p.targetY = entity.targetY;
            p.pixelX = entity.targetX * TILE_SIZE; p.pixelY = entity.targetY * TILE_SIZE;
            p.isMoving = false;
        } else if (entity.shop) {
            state.dialogue.entity = entity;
            Shop.startShop(state, sendUIUpdate);
        } else if (entity.dialogue) {
            startDialogue(state, entity, 'start', sendUIUpdate);
        }
    } else {
        state.mode = 'gameMenu';
        sendUIUpdate({ screen: 'gameMenu' });
    }
}

function handleFarming(state, soil, sendUIUpdate) {
    if (soil.state === 'empty') {
        const seedIndex = state.player.inventory.findIndex(i => i.id === 'wheat_seeds');
        if (seedIndex > -1) {
            state.player.inventory.splice(seedIndex, 1);
            soil.state = 'planted';
            soil.growth = 0;
            soil.emoji = '🌱';
            sendUIUpdate({ dialogue: { active: true, text: "You planted the Wheat Seeds. Rain and Time will help them grow." } });
            setTimeout(() => { state.dialogue.active = false; sendUIUpdate({ dialogue: { active: false } }); }, 1500);
        } else {
            sendUIUpdate({ dialogue: { active: true, text: "This soil is fertile, but you have no seeds." } });
            setTimeout(() => { state.dialogue.active = false; sendUIUpdate({ dialogue: { active: false } }); }, 1500);
        }
    } else if (soil.state === 'planted') {
        sendUIUpdate({ dialogue: { active: true, text: "The crops are growing... have patience." } });
        setTimeout(() => { state.dialogue.active = false; sendUIUpdate({ dialogue: { active: false } }); }, 1500);
    } else if (soil.state === 'ready') {
        soil.state = 'empty';
        soil.growth = 0;
        soil.emoji = '🟫'; // Reset
        Quests.giveItem(state, 'wheat_bundle');
        sendUIUpdate({ dialogue: { active: true, text: "You harvested the Wheat!" } });
        setTimeout(() => { state.dialogue.active = false; sendUIUpdate({ dialogue: { active: false } }); }, 1500);
    }
}
