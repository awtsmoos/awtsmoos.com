
import { DivineSpeechGenerator } from '../malchus/DivineSpeechGenerator.js';
import { ConsoleBlueprint } from '../chochmah/Blueprints.js';
import { SederEngine } from '../atzmus/SederEngine.js';
import { ControllerOfWill } from '../keter/ControllerOfWill.js';

/**
 * B"H
 * InitialEmanation: The first spark of digital life.
 */
export class InitialEmanation {
    
    static manifestExistence() {
        const root = document.getElementById('atzmus-vessel-root');
        if (!root) return setTimeout(InitialEmanation.manifestExistence, 10);
        
        // Form the One Shell
        const shell = DivineSpeechGenerator.pronounceForm(ConsoleBlueprint);
        root.appendChild(shell);
        
        ControllerOfWill.bindPhysicalAnchors();
        
        // Responsive Scaling Logic
        const scaleToWindow = () => {
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            // Native Console dimensions from Blueprint
            const shellW = 500;
            const shellH = 850;
            
            const scale = Math.min(winW / shellW, winH / shellH) * 0.98;
            shell.style.transform = `scale(${scale})`;
        };
        
        window.addEventListener('resize', scaleToWindow);
        scaleToWindow();
        
        SederEngine.igniteEternalPulse();
    }
}
