
import { HtmlGenerator } from './HtmlGenerator.js';
import { InventoryBlueprint } from '../data/ui/InventoryBlueprint.js';
import { DialogueBlueprint } from '../data/ui/DialogueBlueprint.js';
import { BattleBlueprint } from '../data/ui/BattleBlueprint.js';
import { OverworldUIBlueprint } from '../data/ui/OverworldUIBlueprint.js';
import { ShlichusBlueprint } from '../data/ui/ShlichusBlueprint.js';
import { EtzChaimBlueprint } from '../data/ui/EtzChaimBlueprint.js';
import { CosmicStyleSheet } from '../data/ui/CosmicStyleSheet.js';
import { StateRegister } from '../binah/StateRegister.js';
import { ActionMenuManifest } from './battle/ActionMenuManifest.js';
import { StatusPanelManifest } from './battle/StatusPanelManifest.js';
import { ArenaManifest } from './battle/ArenaManifest.js';
import { VesselRenderer } from './ui/VesselRenderer.js';
import { InventoryManifest } from './InventoryManifest.js';
import { ShlichusManifest } from './ShlichusManifest.js';
import { EtzChaimManifest } from './EtzChaimManifest.js';
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

        this.nodes.ovw  = HtmlGenerator.utter(OverworldUIBlueprint);
        this.nodes.inv  = HtmlGenerator.utter(InventoryBlueprint);
        this.nodes.shl  = HtmlGenerator.utter(ShlichusBlueprint);
        this.nodes.etz  = HtmlGenerator.utter(EtzChaimBlueprint);
        this.nodes.diag = HtmlGenerator.utter(DialogueBlueprint);
        this.nodes.bat  = HtmlGenerator.utter(BattleBlueprint);

        Object.values(this.nodes).forEach(node => document.body.appendChild(node));
        this.setupHooks();
        this.setupButtonBonds();
    }

    static setupButtonBonds() {
        const bind = (id, targetRealm, openEvent, closeEvent) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault(); e.stopPropagation();
                if (StateRegister.ActiveRealm === 'OVERWORLD' && openEvent) {
                    StateRegister.ActiveRealm = targetRealm;
                    window.dispatchEvent(new Event(openEvent));
                } else if (StateRegister.ActiveRealm === targetRealm && closeEvent) {
                    StateRegister.ActiveRealm = 'OVERWORLD';
                    window.dispatchEvent(new Event(closeEvent));
                }
            });
        };

        bind('btn-open-bag', 'INVENTORY', 'awtsmoos-inventory-open', null);
        bind('btn-close-bag', 'INVENTORY', null, 'awtsmoos-inventory-close');
        
        bind('btn-open-shlichus', 'SHLICHUS', 'awtsmoos-shlichus-open', null);
        bind('btn-close-shlichus', 'SHLICHUS', null, 'awtsmoos-shlichus-close');

        bind('btn-open-etz', 'ETZ_CHAIM', 'awtsmoos-etz-open', null);
        bind('btn-close-etz', 'ETZ_CHAIM', null, 'awtsmoos-etz-close');
    }

    static setupHooks() {
        const listen = (evt, fn) => window.addEventListener(evt, fn);

        listen('awtsmoos-battle-open', () => { 
            this.nodes.bat.style.display = 'flex'; 
            this.nodes.ovw.style.display = 'none'; 
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

        listen('awtsmoos-inventory-open', () => { 
            this.nodes.inv.style.display = 'flex'; this.nodes.ovw.style.display = 'none';
            InventoryManifest.refresh(); 
        });
        listen('awtsmoos-inventory-close', () => { 
            this.nodes.inv.style.display = 'none'; this.nodes.ovw.style.display = 'flex';
        });

        listen('awtsmoos-shlichus-open', () => { 
            this.nodes.shl.style.display = 'flex'; this.nodes.ovw.style.display = 'none';
            ShlichusManifest.refresh(); 
        });
        listen('awtsmoos-shlichus-close', () => { 
            this.nodes.shl.style.display = 'none'; this.nodes.ovw.style.display = 'flex';
        });

        listen('awtsmoos-etz-open', () => { 
            this.nodes.etz.style.display = 'flex'; this.nodes.ovw.style.display = 'none';
            EtzChaimManifest.refresh(); 
        });
        listen('awtsmoos-etz-close', () => { 
            this.nodes.etz.style.display = 'none'; this.nodes.ovw.style.display = 'flex';
        });
        
        listen('awtsmoos-dialogue-open', () => { 
            this.nodes.diag.style.display = 'flex'; this.nodes.ovw.style.display = 'none';
            this.refreshDialogue(); 
        });
        listen('awtsmoos-dialogue-close', () => { 
            this.nodes.diag.style.display = 'none'; this.nodes.ovw.style.display = 'flex';
        });
        listen('awtsmoos-dialogue-update', () => this.refreshDialogue());
    }

    static _handleAnimations(detail) { /* Internal CSS injection */ }
    static triggerVisualMiracle(type) { /* Internal CSS VFX */ }
    static refreshDialogue() { /* Update DOM */ }
    static refreshBattle() {
        StatusPanelManifest.refresh();
        ActionMenuManifest.refresh(document.getElementById('battle-action-menu'));
    }
}
