// B"H
function awtsmoosNotice(message) {
  const text = String(message ?? "");
  console.warn('B"H | NOTICE_NO_BLOCKING_DIALOG', text);
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ ||= [];
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.push({ at: Date.now(), text, source: import.meta?.url || "unknown" });
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ = globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.slice(-80);
}

import BittulSoul from '../../core/BittulSoul.js';
import GenesisOrchestrator from './GenesisOrchestrator.js';

/**
 * B"H
 * @class MainMenuOrchestrator
 * @description
 * 🏰 MASTER OF THE PALACE GATES 🏰
 * We divide logical scopes totally. This class merely orchestrates the opening
 * menu selection sequence. Providing the "Choice" to enter creation, which is a core
 * prerequisite to true Mitzvos! It supplies pure call-forward methods (events)
 * into our rendering layer.
 */
export default class MainMenuOrchestrator extends BittulSoul {
    constructor(displayMatrix) {
        super();
        this.surrenderToAwtsmoos('MainMenuOrchestrator');
        
        this.displayMatrix = displayMatrix;
        
        // Note: The physical connection DOM Element wrapper 
        this.cosmosAnchorElement = document.createElement('div');
        this.cosmosAnchorElement.id = 'divineAnchorContainer';
        document.body.appendChild(this.cosmosAnchorElement);
    }

    /**
     * @method exposeWorldOptions
     * @description Feeds the HTML/CSS JSON processors everything needed 
     * while giving mapped lexical functions down the wire. 
     */
    exposeWorldOptions() {
        const structuralCommandMaps = {
            invokeGenesis: () => {
                console.log('B"H - Initiating True Descent Seder.');
                // Instantiate the specific process class. 
                const processChain = new GenesisOrchestrator(this.displayMatrix);
                
                // Sample dummy parameter block simulating actual system loads.
                const systemLightPack = { rootUserHash: 'Chaya18', levelBounds: 'Infinite' };
                processChain.beginUnfoldingReality(systemLightPack);
            },
            invokeFindWorld: () => {
                console.log('B"H - Unimplemented Path: Alias seeking requires new vessels!');
                awtsmoosNotice("The hidden scroll alias system is still coalescing.");
            },
            invokeLoadFile: () => {
                console.log('B"H - Unimplemented Path: Extracting reshimu from raw stone binary block.');
                awtsmoosNotice("Loading distinct physical universes disabled while Tzimtzum upgrades occur.");
            }
        };

        this.displayMatrix.mountMenuScreen(this.cosmosAnchorElement, structuralCommandMaps);
    }
}
