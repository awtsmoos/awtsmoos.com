
import { Understanding } from '../binah/Understanding.js';
import { DialogueEngine } from '../graphics/DialogueEngine.js';
import { MenuEngine } from '../graphics/MenuEngine.js';

/**
 * B"H
 * Wisdom: The Universal Logic of Interaction.
 * 
 * Chapter: The Harmony of Will and Word.
 * "Wisdom is the beginning." This class listens to the user's intent 
 * and translates it into state changes, whether navigating menus,
 * walking through the orchard, or speeding up the revelation of light.
 */
export class Wisdom {
    static keys = {};
    static bufferedInput = null;

    /**
     * Initialize the listeners for the user's soul.
     */
    static initialize() {
        window.addEventListener('keydown', (e) => {
            // 1. Menu Toggle (Sacred Portal to Inventory)
            if (e.key === 'm' || e.key === 'Escape') {
                MenuEngine.toggle();
                return;
            }

            // 2. Menu Navigation (Selecting the right Sefarim)
            if (Understanding.state.menu.open) {
                if (e.key === 'ArrowDown' || e.key === 's') MenuEngine.moveSelection(1);
                if (e.key === 'ArrowUp' || e.key === 'w') MenuEngine.moveSelection(-1);
                if (['z', 'Enter', ' '].includes(e.key)) {
                   if (Understanding.state.menu.selection === 3) MenuEngine.toggle();
                }
                return;
            }

            // 3. Dialogue Interaction (Speeding up or advancing)
            if (DialogueEngine.isVisible) {
                if (['z', 'Enter', ' '].includes(e.key)) {
                    DialogueEngine.advance();
                }
                // We don't return here so we can still track 'held' state in keys map
            }

            // 4. Movement & Exploration
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                this.bufferedInput = e.key;
            }

            // Interaction Trigger
            if (!DialogueEngine.isVisible && ['z', 'Enter', ' '].includes(e.key)) {
                this.interact();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            if (this.bufferedInput === e.key) this.bufferedInput = null;
        });
    }

    /**
     * Process the logic pulse based on current mode of existence.
     * @param {number} dt Time elapsed since last pulse.
     */
    static process(dt) {
        if (Understanding.state.menu.open) return;

        if (DialogueEngine.isVisible) {
            // If the user holds the key, it still acts as a 'fast-forward'
            const fast = this.keys[' '] || this.keys['z'] || this.keys['Enter'];
            DialogueEngine.update(performance.now(), fast);
            return;
        }

        const state = Understanding.getState();
        const p = state.player;

        if (p.isMoving) {
            this.continueMovement(p, state, dt);
        } else {
            this.checkNewMovement(p, state);
        }

        // Smoothly lerp the camera focus
        state.camera.x += (p.x - window.innerWidth / 2 + p.width / 2 - state.camera.x) * state.camera.lerp;
        state.camera.y += (p.y - window.innerHeight / 2 + p.height / 2 - state.camera.y) * state.camera.lerp;
    }

    static checkNewMovement(p, state) {
        let dx = 0, dy = 0, dir = p.dir;
        const input = this.bufferedInput || Object.keys(this.keys).find(k => this.keys[k]);

        if (input === 'ArrowUp' || input === 'w') { dy = -1; dir = 'u'; }
        else if (input === 'ArrowDown' || input === 's') { dy = 1; dir = 'd'; }
        else if (input === 'ArrowLeft' || input === 'a') { dx = -1; dir = 'l'; }
        else if (input === 'ArrowRight' || input === 'd') { dx = 1; dir = 'r'; }

        if (dx !== 0 || dy !== 0) {
            p.dir = dir;
            const tx = p.tx + dx; const ty = p.ty + dy;
            if (!this.isSolid(tx, ty, state)) {
                p.tx = tx; p.ty = ty;
                p.isMoving = true; p.moveProgress = 0;
            }
        }
    }

    static continueMovement(p, state, dt) {
        p.moveProgress += 0.006 * dt * p.speed;
        if (p.moveProgress >= 1) {
            p.moveProgress = 0; p.isMoving = false;
            p.x = p.tx * state.tileSize; p.y = p.ty * state.tileSize;
            this.checkEncounters(p, state);
            this.checkPortals(p, state);
        } else {
            const ox = (p.tx - (p.dir === 'r' ? 1 : p.dir === 'l' ? -1 : 0)) * state.tileSize;
            const oy = (p.ty - (p.dir === 'd' ? 1 : p.dir === 'u' ? -1 : 0)) * state.tileSize;
            p.x = ox + (p.tx * state.tileSize - ox) * p.moveProgress;
            p.y = oy + (p.ty * state.tileSize - oy) * p.moveProgress;
        }
    }

    static isSolid(tx, ty, state) {
        const tile = state.map[ty]?.[tx];
        if (!tile || tile === 'T' || tile === 'W') return true;
        return state.entities.some(e => Math.floor(e.x / state.tileSize) === tx && Math.floor(e.y / state.tileSize) === ty);
    }

    static checkPortals(p, state) {
        const tile = state.map[p.ty]?.[p.tx];
        if (tile === 'H') Understanding.transition('HOUSE', 4, 5);
        else if (tile === 'D') Understanding.transition('OVERWORLD', 2, 2);
    }

    static checkEncounters(p, state) {
        const tile = state.map[p.ty]?.[p.tx];
        if (tile === 'K') {
            if (Math.random() < 0.15) {
                console.log("B\"H - Encountering the Klippah of Forgetfulness!");
                // Future: BattleEngine.initiate();
            }
        }
    }

    static interact() {
        const state = Understanding.state;
        const p = state.player;
        let ix = p.tx, iy = p.ty;
        if (p.dir === 'u') iy--; else if (p.dir === 'd') iy++; else if (p.dir === 'l') ix--; else if (p.dir === 'r') ix++;
        const current = state.realm === 'OVERWORLD' ? state.overworld : state.house;
        const npc = current.entities.find(e => Math.floor(e.x / state.tileSize) === ix && Math.floor(e.y / state.tileSize) === iy);
        
        if (npc) {
            state.activeInteractingEntity = npc;
            npc.originalDir = npc.dir;
            if (p.dir === 'u') npc.dir = 'd'; else if (p.dir === 'd') npc.dir = 'u'; else if (p.dir === 'l') npc.dir = 'r'; else if (p.dir === 'r') npc.dir = 'l';
            DialogueEngine.speak([
                "B\"H - Blessed is the one who studies.",
                "In your bag, you have Sefarim.",
                "Use them to transform the darkness of the Klippot into Light."
            ]);
        }
    }
}
