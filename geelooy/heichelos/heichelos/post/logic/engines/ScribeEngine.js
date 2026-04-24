
import { LexiconInterpreter } from "./lexicon/LexiconInterpreter.js";
import { createSectionVessel } from "./scribe/VesselFactory.js";

/**
 * B"H
 * @class ScribeEngine
 * @description 
 * The Scribe is the one who puts the ink to the parchment. 
 * It takes the normalized truth and manifests it for the observer.
 */
export class ScribeEngine {
    /**
     * @constructor
     * @param {Object} rawPost - The multifaceted data from the void.
     */
    constructor(rawPost) {
        this.sections = LexiconInterpreter.translate(rawPost);
        // B"H - Share the light with the rest of the application's consciousness.
        window.sectionDayuh = this.sections.map(s => s.paragraphs);
    }

    /**
     * @method manifest
     * @description Orchestrates the physical creation of the scroll.
     * @param {HTMLElement} container - The parchment to write upon.
     */
    async manifest(container) {
        if (!container) return;
        
        console.log(`B"H - Scribe: Commencing manifestation of ${this.sections.length} sections.`);
        container.innerHTML = "";

        const frag = document.createDocumentFragment();

        for (const sec of this.sections) {
            const vesselDom = createSectionVessel(sec);
            frag.appendChild(vesselDom);
            
            // B"H - Register the vessel with the Hunter (Observer)
            if (window.registerObservable) {
                window.registerObservable(vesselDom);
            }
        }

        container.appendChild(frag);
        
        // B"H - Post-manifestation rituals (animations, focus)
        requestAnimationFrame(() => {
            container.classList.add("revelation-manifest");
        });
    }
}
