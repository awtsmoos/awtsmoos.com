
/**
 * B"H
 * @module OlamGrafting
 * @description
 * 🌿 THE GRAFTING OF THE BRANCHES 🌿
 * 
 * Takes the loose, independent methods and surgically binds them to the Olam.
 * Ensures the 'this' context flows seamlessly from the Root.
 */
import loading from "../methods/loading.js";
import entityLogic from "../methods/entityLogic.js";
import hebrewLetters from "../methods/hebrewLetters.js";
import heesHawvoos from "../methods/heesHawvoos.js";
import HelpersBridge from "../methods/helpers.js";
import loadNivrayim from "../methods/loadNivrayim/index.js";
import placeholderAndEntities from "../methods/placeholderAndEntities/index.js";
import hoyseef from "../methods/hoyseef.js";
import sealayk from "../methods/sealayk.js";
import bindAllListeners from "../eventListeners/index.js";

export default class OlamGrafting {
    static async graft(olam) {
        const isWorker = typeof document === "undefined";
        
        const graftModule = (ClassDef) => {
            if (!ClassDef || !ClassDef.prototype) return;
            Object.getOwnPropertyNames(ClassDef.prototype).forEach(name => {
                if (name !== "constructor") {
                    olam[name] = ClassDef.prototype[name].bind(olam);
                }
            });
        };

        graftModule(hoyseef);
        graftModule(loadNivrayim);
        graftModule(placeholderAndEntities);
        graftModule(loading);
        graftModule(entityLogic);
        graftModule(hebrewLetters);
        graftModule(heesHawvoos);
        graftModule(HelpersBridge);
        graftModule(sealayk);

        const CanvasSetup = (await import("../methods/canvasSetup.js")).default;
        graftModule(CanvasSetup);
        
        const boyrayNivraClass = (await import("../methods/boyrayNivra.js?v=interactive-npc-static-safe-20260527")).default;
        graftModule(boyrayNivraClass);

        const Ohr = (await import("../methods/ohr.js")).default;
        graftModule(Ohr);

        if (!isWorker) {
            try {
                const tzimtzum = (await import("../methods/tzimtzum/index.js")).default;
                graftModule(tzimtzum);
            } catch (e) {
                console.error(`B"H - 🚨 Failed to graft Tzimtzum Orchestrator!`, e);
            }
        }

        bindAllListeners.call(olam);
    }
}
