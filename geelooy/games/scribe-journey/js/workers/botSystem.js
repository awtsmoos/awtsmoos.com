
// B"H
// js/workers/botSystem.js

import { botNames, botDialogues, botAvatars, botTeams, botGuilds } from '../data/bots.js';
import { TILE_SIZE, PLAYER_SPEED } from '../data/database.js';
import * as Quests from './quests.js';
import * as PlayerQuestSystem from './player_quest_system.js';

export function initBots(state, staticMaps) {
    state.bots = [];
    state.chatLog = [];
    
    // MASSIVE BOT SPAWN
    const count = 50; 
    for(let i=0; i<count; i++) {
        spawnBot(state, staticMaps);
    }
}

function spawnBot(state, staticMaps) {
    const mapIds = Object.keys(staticMaps);
    // Weight popular areas
    const weightedMaps = [...mapIds, 'malkuth_village', 'malkuth_village', 'malkuth_village', '770_main_hall', '770_main_hall'];
    
    const mapId = weightedMaps[Math.floor(Math.random() * weightedMaps.length)];
    const map = staticMaps[mapId];
    
    if (!map || !map.baseLayer) return;

    let x = 5, y = 5;
    let valid = false;
    let attempts = 0;
    while(!valid && attempts < 20) {
        x = Math.floor(Math.random() * map.baseLayer[0].length);
        y = Math.floor(Math.random() * map.baseLayer.length);
        const tile = map.baseLayer[y][x];
        if(!['🌳','🪨','🌊','🌋','⬛','🧱'].includes(tile)) {
            valid = true;
        }
        attempts++;
    }

    const name = botNames[Math.floor(Math.random() * botNames.length)];
    const guild = Math.random() > 0.5 ? botGuilds[Math.floor(Math.random() * botGuilds.length)] : "";
    const avatar = botAvatars[Math.floor(Math.random() * botAvatars.length)];
    
    state.bots.push({
        id: `bot_${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        guild: guild,
        emoji: avatar,
        mapId: mapId,
        x: x, y: y,
        pixelX: x * TILE_SIZE, pixelY: y * TILE_SIZE,
        targetX: x, targetY: y,
        isMoving: false,
        moveTimer: Math.random() * 2000,
        team: botTeams[Math.floor(Math.random() * botTeams.length)],
        inventory: [{itemId: 'manna_dew', price: 25}, {itemId: 'kli_copper', price: 120}],
        direction: 'down',
        state: Math.random() > 0.8 ? 'AFK' : 'IDLE',
        questTimer: 0
    });
}

export function updateBots(state, deltaTime, staticMaps) {
    // 1. Simulate Global Chat
    if (Math.random() < 0.02) { 
        const bot = state.bots[Math.floor(Math.random() * state.bots.length)];
        const type = Math.random() > 0.78 ? 'trade' : (Math.random() > 0.84 ? 'lfg' : 'local');
        const list = botDialogues[type] || botDialogues.local || botDialogues.general;
        const msg = list[Math.floor(Math.random() * list.length)];
        const mapName = String(bot.mapId || 'nearby').replace(/_/g, ' ');
        const chatEntry = {
            id: Date.now() + Math.random(),
            sender: bot.name,
            guild: bot.guild,
            place: mapName,
            message: msg,
            type: type
        };
        
        if(!state.chatLog) state.chatLog = [];
        state.chatLog.push(chatEntry);
        if(state.chatLog.length > 20) state.chatLog.shift();
    }

    if(!state.bots) return;

    state.bots.forEach(bot => {
        // QUEST LOGIC
        if (bot.state === 'QUESTING') {
            bot.questTimer -= deltaTime;
            if (bot.questTimer <= 0) {
                bot.state = 'RETURNING';
                bot.mapId = state.currentMapId; // Teleport to player map to return quest
                bot.x = state.player.x;
                bot.y = state.player.y;
                bot.pixelX = bot.x * TILE_SIZE;
                bot.pixelY = bot.y * TILE_SIZE;
            }
            return;
        }

        // Only process movement if on current map (Optimization)
        if(bot.mapId !== state.currentMapId) return;

        // SEEKING LOGIC
        if (state.player.postedQuests && state.player.postedQuests.some(q => q.status === 'open') && bot.state === 'IDLE') {
            if (Math.random() < 0.005) { 
                bot.state = 'SEEKING_WORK';
                bot.targetX = state.player.x;
                bot.targetY = state.player.y;
                bot.isMoving = true;
            }
        }

        // Movement Logic
        if(bot.isMoving) {
            const velocity = (TILE_SIZE / (PLAYER_SPEED * 0.8)) * 1000; 
            const moveDistance = velocity * (deltaTime / 1000);
            
            if (bot.targetX > bot.x) bot.pixelX = Math.min(bot.pixelX + moveDistance, bot.targetX * TILE_SIZE);
            else if (bot.targetX < bot.x) bot.pixelX = Math.max(bot.pixelX - moveDistance, bot.targetX * TILE_SIZE);
            if (bot.targetY > bot.y) bot.pixelY = Math.min(bot.pixelY + moveDistance, bot.targetY * TILE_SIZE);
            else if (bot.targetY < bot.y) bot.pixelY = Math.max(bot.pixelY - moveDistance, bot.targetY * TILE_SIZE);

            if (bot.pixelX === bot.targetX * TILE_SIZE && bot.pixelY === bot.targetY * TILE_SIZE) {
                bot.isMoving = false;
                bot.x = bot.targetX;
                bot.y = bot.targetY;
                bot.moveTimer = Math.random() * 2000 + 1000;
                
                if (bot.state === 'SEEKING_WORK' && Math.abs(bot.x - state.player.x) <= 1 && Math.abs(bot.y - state.player.y) <= 1) {
                    bot.state = 'IDLE'; 
                }
            }
        } else {
            bot.moveTimer -= deltaTime;
            if(bot.moveTimer <= 0 && bot.state !== 'AFK' && bot.state !== 'RETURNING') {
                let moveChance = 0.5;
                if (Math.random() < moveChance) {
                    const dirs = [[0,1], [0,-1], [1,0], [-1,0]];
                    const dir = dirs[Math.floor(Math.random() * dirs.length)];
                    const tx = bot.x + dir[0];
                    const ty = bot.y + dir[1];
                    
                    // Use staticMaps to check collision for current map
                    const map = staticMaps[bot.mapId];
                    if(map && tx >= 0 && ty >= 0 && ty < map.baseLayer.length && tx < map.baseLayer[0].length) {
                        if(!['🌳','🪨','🌊','🌋','⬛','🧱'].includes(map.baseLayer[ty][tx])) {
                            bot.targetX = tx; bot.targetY = ty;
                            bot.isMoving = true;
                        }
                    }
                }
                bot.moveTimer = Math.random() * 2000 + 1000;
            }
        }
    });
}

export function interactWithBot(state, botId, sendUIUpdate, trigger) {
    const bot = state.bots.find(b => b.id === botId);
    if(!bot) return;

    let dialogue = {
        active: true,
        entity: { name: `${bot.name} ${bot.guild}`, shop: false },
        text: `${bot.name}: "LF1M Minyan! Need 10th!"`,
        choices: [
            { text: "Trade", action: 'trade_bot', botId: bot.id },
            { text: "Duel", action: 'duel_bot', botId: bot.id },
            { text: "Goodbye", next: 'end' }
        ]
    };

    if (bot.state === 'RETURNING' && bot.questId) {
        const completionDialog = PlayerQuestSystem.completePlayerQuest(state, bot, sendUIUpdate, trigger.sendToast);
        if (completionDialog) {
            dialogue.text = completionDialog.text;
            dialogue.choices = completionDialog.choices;
        }
    } 
    else if (state.player.postedQuests && state.player.postedQuests.some(q => q.status === 'open')) {
        dialogue.text = `${bot.name}: "I see you have work posted. Can I take it?"`;
        dialogue.choices = [
            { text: "Give Quest", action: 'give_player_quest', botId: bot.id },
            { text: "No", next: 'end' }
        ];
    }

    if (bot.state === 'AFK') {
        dialogue.text = `${bot.name} is Away From Keyboard.`;
        dialogue.choices = [{text: "Leave", next: 'end'}];
    }

    state.mode = 'dialogue';
    state.dialogue = dialogue;
    state.dialogue.botInteraction = true; 
    sendUIUpdate({ dialogue });
}

export function handleBotChoice(state, choice, sendUIUpdate, trigger) {
    const bot = state.bots.find(b => b.id === choice.botId);
    
    if(choice.action === 'give_player_quest') {
        const success = PlayerQuestSystem.assignQuestToBot(state, bot, sendUIUpdate, trigger.sendToast);
        state.dialogue.active = false;
        if(!success) {
            trigger.sendToast("Quest no longer available.", "error");
        }
        state.mode = 'game';
        sendUIUpdate({ dialogue: { active: false } });
    }
    else if(choice.action === 'duel_bot') {
        state.dialogue.active = false;
        trigger.startBattle(bot.team, { flagOnWin: null }); 
    } 
    else if (choice.action === 'trade_bot') {
        let text = `${bot.name}: "WTS items cheap!"`;
        let choices = bot.inventory.map(item => ({
            text: `Buy ${item.itemId} (${item.price}p)`, 
            action: 'buy_from_bot',
            itemId: item.itemId,
            price: item.price,
            botId: bot.id
        }));
        choices.push({ text: "Back", next: 'end' });
        state.dialogue.text = text;
        state.dialogue.choices = choices;
        sendUIUpdate({ dialogue: { active: true, text, choices } });
    }
    else if (choice.action === 'buy_from_bot') {
        if(state.player.money.perutah >= choice.price) {
            state.player.money.perutah -= choice.price;
            Quests.giveItem(state, choice.itemId);
            state.dialogue.text = `${bot.name}: "Ty ty!"`;
            state.dialogue.choices = [{text: "Leave", next: 'end'}];
            sendUIUpdate({ dialogue: state.dialogue });
        } else {
             state.dialogue.text = `${bot.name}: "No money no honey."`;
             sendUIUpdate({ dialogue: state.dialogue });
        }
    }
}
