
import { StateRegister } from '../binah/StateRegister.js';
import { Pathfinder } from '../binah/Pathfinder.js';
import { InteractionValidator } from '../asiyah/InteractionValidator.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';
import { AbyssTargetValidator } from './logic/AbyssTargetValidator.js';

/**
 * B"H
 * @class PointerProvidence
 * @chapter The Finger of God (Etzba Elokim)
 */
export class PointerProvidence {
    static bind() {
        window.addEventListener('pointerdown', e => {
            if (StateRegister.ActiveRealm === 'DIALOGUE') {
                if (!e.target.closest('.dialogue-option')) {
                    window.dispatchEvent(new Event('awtsmoos-dialogue-skip'));
                }
                return; 
            }

            if (StateRegister.ActiveRealm !== 'OVERWORLD') return;
            
            if (e.target.closest('#awtsmoos-inventory') || 
                e.target.closest('#awtsmoos-battle-ui') || 
                e.target.closest('.ctrl-sig')) {
                return;
            }

            const canvas = document.getElementById('layer-obj');
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                return;
            }

            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;

            const RES = StateRegister.Resolution || 64;
            const midX = canvas.width / 2;
            const midY = canvas.height / 2;
            const camX = StateRegister.HeroPos.dx - midX + (RES / 2);
            const camY = StateRegister.HeroPos.dy - midY + (RES / 2);

            const worldX = clickX + camX;
            const worldY = clickY + camY;
            
            let targetGridX = Math.floor(worldX / RES);
            let targetGridY = Math.floor(worldY / RES);

            // ABYSS REDIRECTION
            const abyssSnap = AbyssTargetValidator.resolve(targetGridX, targetGridY);
            if (abyssSnap) {
                targetGridX = abyssSnap.x;
                targetGridY = abyssSnap.y;
            }

            this._processIntent(targetGridX, targetGridY);
        });
    }

    static _processIntent(targetGridX, targetGridY) {
        const HR = StateRegister.HeroPos;
        const targetNode = WorldMapAssembler.WorldRegistry.find(n => n.x === targetGridX && n.y === targetGridY);

        if (targetNode && targetNode.isSoul) {
            const dx = Math.abs(HR.cx - targetGridX);
            const dy = Math.abs(HR.cy - targetGridY);
            if (dx + dy <= 1) { 
                if (targetGridX > HR.cx) HR.dir = 'r';
                else if (targetGridX < HR.cx) HR.dir = 'l';
                else if (targetGridY > HR.cy) HR.dir = 'd';
                else if (targetGridY < HR.cy) HR.dir = 'u';
                
                InteractionValidator.directInteract(targetNode);
                return;
            }
        }

        const path = Pathfinder.findPath(HR.cx, HR.cy, targetGridX, targetGridY);
        
        if (path) {
            StateRegister.HeroPath = path;
            StateRegister.PathTarget = { x: targetGridX, y: targetGridY, valid: true };
        } else {
            StateRegister.HeroPath = [];
            StateRegister.PathTarget = { x: targetGridX, y: targetGridY, valid: false };
            setTimeout(() => {
                if (StateRegister.PathTarget && !StateRegister.PathTarget.valid) {
                    StateRegister.PathTarget = null;
                }
            }, 800);
        }
    }
}
