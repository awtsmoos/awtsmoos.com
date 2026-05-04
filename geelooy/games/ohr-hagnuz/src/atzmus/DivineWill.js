
import { UnderstandingGenerator } from '../binah/UnderstandingGenerator.js';
import { ConsoleBlueprint } from '../chochmah/WisdomBlueprint.js';
import { StateRegister } from '../binah/StateRegister.js';

/**
 * B"H
 * DivineWill: The absolute commander of existence.
 * 
 * Chapter: The Command to Appear.
 * Out of the Infinite Silence (Ein Sof), the Will calls forth a Console.
 * It is not made of plastic, but of logic and light, 
 * synthesized through the heart that understands (Binah) 
 * into the physical realm (Malkhut).
 */
export class DivineWill {
    /** 
     * Materializes the Blueprint into the physical DOM.
     * All components must nullify themselves to the root vessel.
     */
    static ignite() {
        const root = document.getElementById('atzmus-vessel-root');
        if (!root) {
            // Re-attempt if the Malchut anchor is not yet visible
            return setTimeout(() => DivineWill.ignite(), 10);
        }

        const shell = UnderstandingGenerator.realize(ConsoleBlueprint);
        root.appendChild(shell);

        this.fitToMortalEye();
        window.addEventListener('resize', () => this.fitToMortalEye());
    }

    /** 
     * Contracts and expands the world to fit the window capacity.
     * "Light for the eyes, according to the strength of the sight."
     */
    static fitToMortalEye() {
        const console = document.getElementById('holy-console');
        if (!console) return;

        const winW = window.innerWidth;
        const winH = window.innerHeight;
        // The Console's native Sefirotic dimensions
        const shellW = 500;
        const shellH = 900;

        const ratio = Math.min(winW / shellW, winH / shellH) * 0.95;
        console.style.transform = `scale(${ratio})`;
    }
}
