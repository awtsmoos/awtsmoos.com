
import { HtmlGenerator } from './HtmlGenerator.js';
import { InventoryBlueprint } from '../data/ui/InventoryBlueprint.js';
import { DialogueBlueprint } from '../data/ui/DialogueBlueprint.js';
import { BattleBlueprint } from '../data/ui/BattleBlueprint.js';
import { OverworldUIBlueprint } from '../data/ui/OverworldUIBlueprint.js';
import { CosmicStyleSheet } from '../data/ui/CosmicStyleSheet.js';
import { StateRegister } from '../binah/StateRegister.js';
import { ActionMenuManifest } from './battle/ActionMenuManifest.js';
import { StatusPanelManifest } from './battle/StatusPanelManifest.js';
import { ArenaManifest } from './battle/ArenaManifest.js';
import { VesselRenderer } from './ui/VesselRenderer.js';
import { InventoryManifest } from './InventoryManifest.js';
import { DialogueTrees } from '../data/DialogueTrees.js';

/**
 * B"H
 * @class UIManifestor
 */
export class UIManifestor {
    static nodes = {};

    static initialize() {
        const styleNode = HtmlGenerator.utter(CosmicStyleSheet);
        document.head.appendChild(styleNode);

        // Utter the blueprints into the DOM
        this.nodes.ovw  = HtmlGenerator.utter(OverworldUIBlueprint);
        this.nodes.inv  = HtmlGenerator.utter(InventoryBlueprint);
        this.nodes.diag = HtmlGenerator.utter(DialogueBlueprint);
        this.nodes.bat  = HtmlGenerator.utter(BattleBlueprint);

        Object.values(this.nodes).forEach(node => document.body.appendChild(node));
        this.setupHooks();
        this.setupButtonBonds();
    }

    static setupButtonBonds() {
        // Overworld Bag Button
        const openBagBtn = document.getElementById('btn-open-bag');
        if (openBagBtn) {
            openBagBtn.addEventListener('pointerdown', (e) => {
                e.preventDefault(); e.stopPropagation();
                if (StateRegister.ActiveRealm === 'OVERWORLD') {
                    StateRegister.ActiveRealm = 'INVENTORY';
                    window.dispatchEvent(new Event('awtsmoos-inventory-open'));
                }
            });
        }

        // Close Bag Button
        const closeBagBtn = document.getElementById('btn-close-bag');
        if (closeBagBtn) {
            closeBagBtn.addEventListener('pointerdown', (e) => {
                e.preventDefault(); e.stopPropagation();
                if (StateRegister.ActiveRealm === 'INVENTORY') {
                    StateRegister.ActiveRealm = 'OVERWORLD';
                    window.dispatchEvent(new Event('awtsmoos-inventory-close'));
                }
            });
        }
    }

    static setupHooks() {
        const listen = (evt, fn) => window.addEventListener(evt, fn);

        listen('awtsmoos-battle-open', () => { 
            this.nodes.bat.style.display = 'flex'; 
            this.nodes.ovw.style.display = 'none'; // Hide overworld UI
            
            const enemy = document.getElementById('sprite-klipah');
            const hero = document.getElementById('sprite-tzaddik');
            if (enemy) enemy.classList.remove('anim-vanquish');
            if (hero) hero.classList.remove('anim-ascension');

            ArenaManifest.refresh(); 
            this.refreshBattle(); 
        });

        listen('awtsmoos-battle-close', () => { 
            this.nodes.bat.style.display = 'none'; 
            this.nodes.ovw.style.display = 'flex';
        });
        
        listen('awtsmoos-battle-update', () => this.refreshBattle());
        listen('awtsmoos-battle-cursor', () => this.refreshBattle());
        
        listen('awtsmoos-battle-log', (e) => {
            const log = document.getElementById('battle-log-text');
            if (log) log.innerText = e.detail;
        });
        
        listen('awtsmoos-battle-vfx', (e) => this.triggerVisualMiracle(e.detail));
        listen('awtsmoos-battle-anim', (e) => this._handleAnimations(e.detail));

        listen('awtsmoos-battle-enemy-vanquished', () => {
            const enemy = document.getElementById('sprite-klipah');
            if(enemy) enemy.classList.add('anim-vanquish');
        });
        listen('awtsmoos-battle-level-up', () => {
            const hero = document.getElementById('sprite-tzaddik');
            if(hero) hero.classList.add('anim-ascension');
        });

        listen('awtsmoos-inventory-open', () => { 
            this.nodes.inv.style.display = 'flex'; 
            this.nodes.ovw.style.display = 'none';
            InventoryManifest.refresh(); 
        });
        listen('awtsmoos-inventory-close', () => { 
            this.nodes.inv.style.display = 'none'; 
            this.nodes.ovw.style.display = 'flex';
        });
        
        listen('awtsmoos-dialogue-open', () => { 
            this.nodes.diag.style.display = 'flex'; 
            this.nodes.ovw.style.display = 'none';
            this.refreshDialogue(); 
        });
        listen('awtsmoos-dialogue-close', () => { 
            this.nodes.diag.style.display = 'none'; 
            this.nodes.ovw.style.display = 'flex';
        });
        listen('awtsmoos-dialogue-update', () => this.refreshDialogue());
    }

    static _handleAnimations(detail) {
        const hero = document.getElementById('sprite-tzaddik');
        const enemy = document.getElementById('sprite-klipah');
        const shell = document.getElementById('awtsmoos-battle-ui');
        const flash = document.getElementById('awtsmoos-battle-flash');
        const slash = document.getElementById('awtsmoos-battle-slash');

        const trigger = (el, cl) => {
            if (!el) return; el.classList.remove(cl);
            void el.offsetWidth; el.classList.add(cl);
            setTimeout(() => el.classList.remove(cl), 600);
        };

        if (detail === 'HERO_ATTACK') trigger(hero, 'anim-hero-attack');
        else if (detail === 'ENEMY_ATTACK') trigger(enemy, 'anim-enemy-attack');
        else if (detail === 'SLASH_FLASH') {
            trigger(slash, 'anim-slash'); trigger(flash, 'anim-flash'); trigger(shell, 'anim-screen-shake');
        }
    }

    static triggerVisualMiracle(type) {
        const arena = document.getElementById('awtsmoos-battle-ui');
        const spark = document.createElement('div');
        spark.id = 'awtsmoos-vfx-layer';
        const TypeMap = { 'VFX_STONE': 'vfx-stone anim-stone-strike', 'VFX_FIRE': 'vfx-fire anim-fire-burn', 'VFX_LIGHT': 'vfx-light anim-holy-blast' };
        spark.className = TypeMap[type] || 'vfx-light anim-holy-blast';
        spark.style.top = '15%'; spark.style.right = '10%'; spark.style.width = '180px'; spark.style.height = '180px';
        arena.appendChild(spark);
        setTimeout(() => spark.remove(), 1000);
        window.dispatchEvent(new CustomEvent('awtsmoos-battle-anim', { detail: 'SLASH_FLASH' }));
    }

    static refreshDialogue() {
        const textNode = document.getElementById('awtsmoos-dialogue-text');
        if (textNode) textNode.innerText = StateRegister.VisibleDialogText;

        const optContainer = VesselRenderer.purge('awtsmoos-dialogue-options');
        const promptNode = document.getElementById('awtsmoos-dialogue-prompt');
        
        let tree = DialogueTrees[StateRegister.DialogBankId] || DialogueTrees['DEFAULT'];
        const currentNode = tree[StateRegister.DialogNodeId];
        if (!currentNode || !optContainer) return;

        const lines = currentNode.lines || ["..."];
        const currentStr = lines[StateRegister.DialogLineIdx] || "";
        const finishedTyping = StateRegister.VisibleDialogText.length === currentStr.length;
        const lastLine = StateRegister.DialogLineIdx >= lines.length - 1;

        if (lastLine && finishedTyping && currentNode.options) {
            optContainer.style.display = 'flex';
            if (promptNode) promptNode.style.display = 'none';
            currentNode.options.forEach((opt, idx) => {
                const isSelected = (idx === StateRegister.DialogOptionCursor);
                const div = VesselRenderer.imbue(optContainer, 'div', isSelected ? 'dialogue-option active' : 'dialogue-option', (isSelected ? '▶ ' : '  ') + opt.label);
                
                const triggerOpt = (e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (window._awtsmoosDiagLocked) return;
                    window._awtsmoosDiagLocked = true;
                    setTimeout(() => { window._awtsmoosDiagLocked = false; }, 300);

                    StateRegister.DialogOptionCursor = idx;
                    window.dispatchEvent(new CustomEvent('awtsmoos-dialogue-option-click', { detail: idx }));
                };
                
                div.addEventListener('pointerdown', triggerOpt);
                div.onmouseenter = () => { StateRegister.DialogOptionCursor = idx; this.refreshDialogue(); };
            });
        } else {
            optContainer.style.display = 'none';
            if (promptNode) promptNode.style.display = finishedTyping ? 'block' : 'none';
        }
    }

    static refreshBattle() {
        StatusPanelManifest.refresh();
        ActionMenuManifest.refresh(document.getElementById('battle-action-menu'));
    }
}
