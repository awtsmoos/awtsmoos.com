
/**
 * @file index.js (Olam Methods Assembler)
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 10: THE UNIFICATION OF THE SEFIROT                           ║
 * ║                                                                          ║
 * ║  "And they became as one vessel to hold the Infinite."                 ║
 * ║                                                                          ║
 * ║  THE TIKKUN OF THE DEPENDENCY TREE:                                    ║
 * ║  We conditionally graft the `tzimtzum` module ONLY if running in the   ║
 * ║  Main Thread! The worker no longer crashes trying to reference DOM     ║
 * ║  elements hidden inside UI stages.                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import loading from "./loading.js";
import entityLogic from "./entityLogic.js";
import hebrewLetters from "./hebrewLetters.js";
import heesHawvoos from "./heesHawvoos.js";
import HelpersBridge from "./helpers.js";
import loadNivrayim from "./loadNivrayim/index.js";
import placeholderAndEntities from "./placeholderAndEntities/index.js";
import hoyseef from "./hoyseef.js";
import sealayk from "./sealayk.js";
import properties from "./properties.js";
import bindAllListeners from "../eventListeners/index.js";

export default async function assembleFaculties() {
    const self = this;
    const isWorker = typeof document === "undefined";

    const graft = (ClassDef) => {
        if (!ClassDef || !ClassDef.prototype) return;
        Object.getOwnPropertyNames(ClassDef.prototype).forEach(name => {
            if (name !== "constructor") {
                self[name] = ClassDef.prototype[name].bind(self);
            }
        });
    };

    // B"H: silent


    const props = new properties();
    Object.keys(props).forEach(key => { self[key] = props[key]; });

    graft(hoyseef);
    graft(loadNivrayim);
    graft(placeholderAndEntities);
    graft(loading);
    graft(entityLogic);
    graft(hebrewLetters);
    graft(heesHawvoos);
    graft(HelpersBridge);
    graft(sealayk);

    const CanvasSetup = (await import("./canvasSetup.js")).default;
    graft(CanvasSetup);
    
    const boyrayNivraClass = (await import("./boyrayNivra.js")).default;
    graft(boyrayNivraClass);

    const Ohr = (await import("./ohr.js")).default;
    graft(Ohr);

    // B"H THE TZIMTZUM SHIELD
    // Only graft the Orchestrator if we are in the physical realm!
    if (!isWorker) {
        try {
            const tzimtzum = (await import("./tzimtzum/index.js")).default;
            graft(tzimtzum);
            // B"H: silent

        } catch (e) {
            console.error(`B"H - 🚨 Failed to graft Tzimtzum Orchestrator!`, e);
        }
    }

    bindAllListeners.call(this);

    // B"H: silent

}
