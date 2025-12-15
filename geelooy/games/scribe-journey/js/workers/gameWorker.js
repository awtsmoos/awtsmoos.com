
// B"H
// js/workers/gameWorker.js

import { createDefaultGameState, TILE_SIZE } from '../data/database.js';
import { maps as staticMaps } from '../data/maps.js'; 
import * as World from './world.js';
import * as Combat from './combat.js';
import * as BotSystem from './botSystem.js';
import * as TimeSystem from './systems/time.js';
import * as WeatherSystem from './systems/weather.js';
import * as FarmingSystem from './systems/farming.js';
import * as CalendarSystem from './systems/calendar.js';
import { createTriggers } from './systems/triggers.js';
import { handleUIAction, getPayloadForScreen } from './systems/ui_actions.js';
import { gates } from '../data/gates_features.js';
import { gates37 } from '../data/gates_37.js';
import { apply666Features } from '../data/features_666.js';

let GAME_STATE = {};
let activeMapCache = null; 
let lastMapId = null;
let lastTimestamp = 0;
let chaosTimer = 0;
let trigger = null;

let callbacks = {
    onStateUpdate: () => {},
    onUIUpdate: () => {},
    onTimeUpdate: () => {},
    onToast: () => {}
};

function getCurrentMap(state) {
    if (state.currentMapId === lastMapId && activeMapCache) {
        return activeMapCache;
    }
    const staticData = staticMaps[state.currentMapId] || staticMaps['malkuth_village'];
    const changes = state.player.mapChanges?.[state.currentMapId] || {};
    const liveInteractables = { ...staticData.interactables };
    for (const key in changes) {
        if (changes[key] === 'DELETED') {
            delete liveInteractables[key];
        } else {
            liveInteractables[key] = { ...liveInteractables[key], ...changes[key] };
        }
    }
    activeMapCache = {
        ...staticData,
        interactables: liveInteractables
    };
    lastMapId = state.currentMapId;
    return activeMapCache;
}

function updateStateContext(state) {
    state.maps = { [state.currentMapId]: getCurrentMap(state) }; 
}

function checkGates(state) {
    if(!state.activeGates) state.activeGates = {};
    if(!state.player.unlockedGates37) state.player.unlockedGates37 = [];

    const effects = {
        speedMult: 1.5,
        timeSpeed: 1,
        filters: [],
        overlay: null,
        combat: { damageMult: 1, defenseMult: 1, healMult: 1, xpMult: 1, dropMult: 1, immunities: [] },
        world: { encounterRate: 1 }
    };

    apply666Features(state);
    if(state.features666) {
        effects.speedMult *= state.features666.speedMult;
        if(state.features666.filters) effects.filters.push(...state.features666.filters);
        if(state.features666.chaos) effects.world.chaosMode = true;
    }

    gates.forEach(g => {
        if(state.activeGates[g.id]) {
            if(g.type === 'movement' && g.effect.speedMult) effects.speedMult *= g.effect.speedMult;
            if(g.type === 'visual' && g.effect.overlay) effects.overlay = g.effect.overlay;
            if(g.type === 'combat') {
                if(g.effect.damageMult) effects.combat.damageMult *= g.effect.damageMult;
                if(g.effect.autoWin) effects.combat.autoWin = true;
                if(g.effect.dropMult) effects.combat.dropMult *= g.effect.dropMult;
            }
            if(g.type === 'world') {
                if(g.effect.encounterRate !== undefined) effects.world.encounterRate *= g.effect.encounterRate;
            }
        }
    });

    state.player.unlockedGates37.forEach(gateId => {
        const gate = gates37.find(g => g.id === gateId);
        if(!gate) return;
        const e = gate.effect;
        if (e.type === 'immune_status') effects.combat.immunities.push(e.status);
        if (e.type === 'drop_rate') effects.combat.dropMult *= e.amount;
        if (e.type === 'damage_reduction') effects.combat.defenseMult /= e.amount; 
        if (e.type === 'heal_mult') effects.combat.healMult *= e.amount;
        if (e.type === 'encounter_rate') effects.world.encounterRate *= e.amount;
        if (e.type === 'stat_boost' && e.stat === 'attack') effects.combat.damageMult *= e.amount;
        if (e.type === 'money_mult') effects.combat.moneyMult = (effects.combat.moneyMult || 1) * e.amount;
        if (e.type === 'xp_mult') effects.combat.xpMult = (effects.combat.xpMult || 1) * e.amount;
        if (e.type === 'endure_fatal') effects.combat.endureFatal = true;
        if (e.type === 'ultimate_move') effects.combat.hasUltimate = true;
    });

    state.gateEffects = effects;
}

function resetGame() {
    GAME_STATE = createDefaultGameState();
    GAME_STATE.time = TimeSystem.initTime();
    GAME_STATE.lightLevel = 1000; 
    GAME_STATE.stats = { battlesWon: 0, itemsCrafted: 0, cropsHarvested: 0, soulsInspired: 0, shabbatsObserved: 0, roshChodeshWitnessed: 0, tzedakahCount: 0, booksRead: 0, foodEaten: 0 };
    GAME_STATE.activeGates = {}; 
    GAME_STATE.player.storage = []; 
    GAME_STATE.weather = 'clear'; 
    GAME_STATE.player.wisdomPoints = 0;
    GAME_STATE.player.unlockedGates37 = [];
    
    updateStateContext(GAME_STATE);
    BotSystem.initBots(GAME_STATE, staticMaps);
    trigger = createTriggers(GAME_STATE, callbacks);
    
    // Force immediate time update for renderer
    callbacks.onTimeUpdate({ 
        timeOfDay: GAME_STATE.time.totalMinutes,
        day: GAME_STATE.time.day,
        moonPhase: { icon: '🌑', illumination: 0 },
        isShabbat: false,
        lightLevel: 1000,
        maxLightLevel: 1000
    });
}

export function initGame(cbs) {
    callbacks = cbs;
    resetGame();
    GAME_STATE.mode = 'main-menu';
    callbacks.onUIUpdate({ screen: 'main-menu' });
}

export function gameLoop(now) {
    if (!lastTimestamp) lastTimestamp = now;
    const deltaTime = now - lastTimestamp;
    lastTimestamp = now;

    if (!GAME_STATE.player) return;

    updateStateContext(GAME_STATE);
    const currentMap = GAME_STATE.maps[GAME_STATE.currentMapId];

    checkGates(GAME_STATE); 
    
    chaosTimer += deltaTime;
    if (chaosTimer > 5000 && GAME_STATE.features666?.chaos) {
        chaosTimer = 0;
        if(Math.random() < 0.2) callbacks.onToast({message: "CHAOS REIGNS", type: 'error'});
    }

    if (GAME_STATE.mode === 'game') {
        const timeScale = GAME_STATE.gateEffects?.timeSpeed !== undefined ? GAME_STATE.gateEffects.timeSpeed : 1;
        
        World.update(GAME_STATE, now, deltaTime, trigger);
        BotSystem.updateBots(GAME_STATE, deltaTime, staticMaps); 
        
        TimeSystem.update(GAME_STATE, deltaTime * timeScale, {
            onNewDay: () => {
                trigger.sendToast(`New Day!`, "info");
                GAME_STATE.lightLevel = Math.min(1000, GAME_STATE.lightLevel + 200); 
            },
            onTick: (timePayload) => {
                const date = CalendarSystem.getHebrewDate(GAME_STATE.time.day);
                let decay = 0.5 * timeScale; 
                GAME_STATE.lightLevel = Math.max(0, GAME_STATE.lightLevel - decay);

                callbacks.onTimeUpdate({ 
                    ...timePayload, 
                    dateString: `${date.day} ${date.month}`, 
                    gateFilters: GAME_STATE.gateEffects?.filters || [],
                    lightLevel: GAME_STATE.lightLevel,
                    maxLightLevel: 1000 + (GAME_STATE.features666?.hpBonus || 0)
                });
                
                callbacks.onUIUpdate({ chat: GAME_STATE.chatLog });

                if(timePayload.timeOfDay % 60 === 0) {
                    FarmingSystem.update(GAME_STATE);
                    WeatherSystem.update(GAME_STATE, trigger.sendToast);
                }
            }
        });
    }
    
    const renderPayload = {
        mode: GAME_STATE.mode,
        player: GAME_STATE.player,
        currentMapId: GAME_STATE.currentMapId,
        map: {
            width: currentMap.width,
            baseLayer: currentMap.baseLayer,
            overlayLayer: currentMap.overlayLayer,
            interactables: currentMap.interactables,
            isInsane: currentMap.isInsane,
            isExtreme: currentMap.isExtreme
        },
        bots: GAME_STATE.bots.filter(b => b.mapId === GAME_STATE.currentMapId).map(b => ({
            pixelX: b.pixelX, pixelY: b.pixelY, emoji: b.emoji, name: b.name, state: b.state
        })),
        weather: GAME_STATE.weather,
        gateEffects: GAME_STATE.gateEffects,
        visualAnim: GAME_STATE.visualAnim
    };

    callbacks.onStateUpdate({ state: renderPayload });
}

export function dispatch(payload) {
    updateStateContext(GAME_STATE);
    
    if (payload.type === 'keyState') { if (GAME_STATE.mode === 'game') { World.handleKeyState(GAME_STATE, payload.keys); } }
    else if (payload.type === 'press' && payload.key === 'Confirm') {
        if (GAME_STATE.dialogue.active) { 
            if(GAME_STATE.dialogue.botInteraction) BotSystem.handleBotChoice(GAME_STATE, GAME_STATE.dialogue.choices[payload.index], callbacks.onUIUpdate, trigger);
            else World.advanceDialogue(GAME_STATE, callbacks.onUIUpdate, trigger);
        } 
        else if (GAME_STATE.mode === 'game') World.checkInteraction(GAME_STATE, trigger, callbacks.onUIUpdate);
        else if (GAME_STATE.mode === 'battle' && GAME_STATE.battle.awaitingConfirm) Combat.handleAction(GAME_STATE, { action: 'confirm' }, callbacks.onUIUpdate, trigger);
    } else if (payload.action) {
        if (payload.action === 'newGame') {
            resetGame();
            GAME_STATE.mode = 'game';
            callbacks.onUIUpdate({ screen: 'game' });
        } else if (payload.action === 'saveGame') {
            try {
                localStorage.setItem('scribe_save', JSON.stringify(GAME_STATE));
                callbacks.onToast({ message: "Chronicle Inscribed (Saved).", type: "success" });
            } catch(e) {
                callbacks.onToast({ message: "Save Failed.", type: "error" });
            }
        } else if (payload.action === 'loadGame') {
            try {
                const saved = localStorage.getItem('scribe_save');
                if(saved) {
                    GAME_STATE = JSON.parse(saved);
                    trigger = createTriggers(GAME_STATE, callbacks);
                    updateStateContext(GAME_STATE);
                    GAME_STATE.mode = 'game';
                    callbacks.onUIUpdate({ screen: 'game' });
                    callbacks.onToast({ message: "Chronicle Loaded.", type: "success" });
                } else {
                    callbacks.onToast({ message: "No Chronicle found.", type: "error" });
                }
            } catch(e) {
                console.error(e);
                callbacks.onToast({ message: "Load Failed (Corrupt Data).", type: "error" });
            }
        } else if (payload.action === 'dialogueChoice') {
            if(GAME_STATE.dialogue.botInteraction) BotSystem.handleBotChoice(GAME_STATE, GAME_STATE.dialogue.choices[payload.index], callbacks.onUIUpdate, trigger);
            else World.handleDialogueChoice(GAME_STATE, payload.index, callbacks.onUIUpdate, trigger); 
        } else if (payload.action === 'battleAction') {
            Combat.handleAction(GAME_STATE, payload, callbacks.onUIUpdate, trigger);
        } else {
            handleUIAction(GAME_STATE, payload, callbacks, trigger);
            if (payload.fetchPayload) {
                const data = getPayloadForScreen(GAME_STATE, payload.fetchPayload);
                callbacks.onUIUpdate({ ...data });
            }
        }
    }
}
