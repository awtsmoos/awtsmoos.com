
import { StateRegister } from '../binah/StateRegister.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';

/**
 * B"H
 * FoundationPhysics: The Binders of World and Will.
 * 
 * Poetic Novel: The Path of the Tzaddik.
 * The hero walks not on grass, but on a lattice of Divine Names.
 * Every pixel moved is a distance covered in the spiritual ascent.
 * This class ensures that physical collision is observed, 
 * for without boundaries (Gevurah), the world would dissipate.
 * We calculate the 64-pixel stride natively intelligently seamlessly.
 * 
 * @class FoundationPhysics
 */
export class FoundationPhysics {
    static Intents = { U:0, D:0, L:0, R:0, A:0, B:0 };
    static History = { U:0, D:0, L:0, R:0, A:0, B:0 };

    /** Binds the physical world buttons and keyboard to internal intentions. */
    static bindMortalInteraction() {
        const map = {
            'ArrowUp': 'U', 'w': 'U', 'W': 'U',
            'ArrowDown': 'D', 's': 'D', 'S': 'D',
            'ArrowLeft': 'L', 'a': 'L', 'A': 'L',
            'ArrowRight': 'R', 'd': 'R', 'D': 'R',
            'z': 'A', 'Enter': 'A', ' ': 'A', 'x': 'B'
        };

        window.addEventListener('keydown', e => {
            const sig = map[e.key];
            if (sig) { e.preventDefault(); this.Intents[sig] = 1; }
        }, {passive: false});

        window.addEventListener('keyup', e => {
            const sig = map[e.key];
            if (sig) { e.preventDefault(); this.Intents[sig] = 0; }
        }, {passive: false});

        // Binding to HTML nodes produced by Divine Speech physically
        document.querySelectorAll('.ctrl-sig').forEach(el => {
            const sig = el.getAttribute('data-sig');
            if (!sig) return;
            el.onpointerdown = e => { e.preventDefault(); this.Intents[sig] = 1; };
            el.onpointerup = el.onpointerleave = () => { this.Intents[sig] = 0; };
        });
    }

    /** Translates pure intentions into physical coordinate shifts in Asiyah. */
    static digestIntention() {
        // Prevent movement logic if we are deep in dialogue or menu contemplation
        if (StateRegister.ActiveRealm !== 'OVERWORLD') return;

        const HR = StateRegister.HeroPos;
        const RES = StateRegister.Resolution || 64; 
        const S = 4 * (StateRegister.GameSpeedMultiplier || 1); // Movement velocity

        if (HR.moving) {
            if (HR.dir === 'u') HR.dy -= S; 
            if (HR.dir === 'd') HR.dy += S;
            if (HR.dir === 'l') HR.dx -= S; 
            if (HR.dir === 'r') HR.dx += S;
            
            HR.stepTick += S;

            // Re-alignment perfection for the 64-pixel reality boundaries
            if (HR.dx % RES === 0 && HR.dy % RES === 0) {
                HR.moving = false; 
                HR.stepTick = 0;
                HR.cx = HR.dx / RES; 
                HR.cy = HR.dy / RES;
            }
            return;
        }

        let nX = 0, nY = 0, nD = HR.dir;
        if (this.Intents.U) { nY = -1; nD = 'u'; }
        else if (this.Intents.D) { nY = 1; nD = 'd'; }
        else if (this.Intents.L) { nX = -1; nD = 'l'; }
        else if (this.Intents.R) { nX = 1; nD = 'r'; }

        if (nX !== 0 || nY !== 0) {
            HR.dir = nD;
            const targetX = HR.cx + nX; 
            const targetY = HR.cy + nY;
            
            const tile = WorldMapAssembler.WorldRegistry.find(t => t.x === targetX && t.y === targetY);
            
            // If the tile exists and is not a solid boundary block, allow the soul to shift
            if (tile && !tile.solid) {
                HR.moving = true;
            }
        }
    }

    static sealHistory() {
        Object.keys(this.Intents).forEach(k => this.History[k] = this.Intents[k]);
    }
}
