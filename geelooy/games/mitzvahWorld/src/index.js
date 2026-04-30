
import BittulSoul from './core/BittulSoul.js';
import AwtsmoosScreenConduit from './ui/managers/AwtsmoosScreenConduit.js';
import MainMenuOrchestrator from './flow/phases/MainMenuOrchestrator.js';

/**
 * B"H
 * @file index.js
 * @description
 * 🌀 THE CROWN CHOCHMAH 🌀
 * This is the tip of the Yod in the infinite Tetragrammaton representation of code.
 * From absolutely nowhere, it binds our entire fractal engine block together.
 * "Bereishis (In the Beginning) God created the Heavens and the Earth!" 
 */

class OriginEngineInitiator extends BittulSoul {
    constructor() {
        super();
        this.surrenderToAwtsmoos('The Genesis Engine');
        
        console.log('B"H - 🌌 Everything originates completely bound to the Supreme Light.');
        
        // Generate universal UI renderer matrix. It requires no fixed layout. 
        this.displayNetwork = new AwtsmoosScreenConduit();
        
        // Pass network into initial state logic block!
        this.menuPathways = new MainMenuOrchestrator(this.displayNetwork);
    }
    
    ignite() {
        // Kick off rendering
        this.menuPathways.exposeWorldOptions();
    }
}

// Start everything when scripts evaluate on main document load
window.addEventListener('DOMContentLoaded', () => {
     document.body.style.margin = '0'; // Pure blank void initialization.
     const spark = new OriginEngineInitiator();
     spark.ignite();
});
