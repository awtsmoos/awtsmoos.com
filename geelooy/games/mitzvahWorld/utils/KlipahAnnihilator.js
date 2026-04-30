
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file KlipahAnnihilator.js
 * 
 * Sometimes, even when the source HTML is purified, the physical world (the browser)
 * holds onto memory (Klipot/Shells). It might cache the old `register.js` or 
 * try to execute it from a deeper level.
 * 
 * This class is the sword of Gevurah (Judgment). It actively scans the DOM
 * the moment the engine boots and violently rips out any script tags containing
 * the forbidden texts, while simultaneously performing the ultimate exorcism 
 * on any active Service Workers.
 */

/**
 * @class KlipahAnnihilator
 * @extends SederHishtalshelusNode
 * @description Seeks and destroys unholy physical remnants in the DOM and Navigator.
 */
export default class KlipahAnnihilator extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Asiyah_Judgment_And_Purification" });
    }

    /**
     * @method annihilate
     * @description Unleashes the pure nullification across the document and navigator.
     * @returns {void}
     */
    annihilate() {
        this.acknowledgeCreator();
        this.destroyForbiddenScripts();
        this.banishCachingAngels();
        this.purgeOldDOMNodes();
    }

    /**
     * @method destroyForbiddenScripts
     * @description Hunts down `<script>` tags pointing to register.js.
     * @returns {void}
     */
    destroyForbiddenScripts() {
        console.log(`B"H - 🗡️ Scanning DOM for forbidden scripts...`);
        const scripts = document.querySelectorAll('script');
        
        for (let i = 0; i < scripts.length; i++) {
            const src = scripts[i].src || '';
            if (src.includes('register.js')) {
                console.warn(`B"H - 🛑 DETECTED FORBIDDEN SCRIPT: ${src}`);
                scripts[i].parentNode.removeChild(scripts[i]);
                console.log(`B"H - 💥 Forbidden script utterly destroyed and returned to the void.`);
            }
        }
    }

    /**
     * @method purgeOldDOMNodes
     * @description Rips out any old HTML that isn't the primary container.
     * @returns {void}
     */
    purgeOldDOMNodes() {
        console.log(`B"H - 🧹 Sweeping away old UI elements...`);
        
        // If there are lingering UI divs from old code (like login buttons, old menus), 
        // we forcefully hide or delete them.
        const potentialKlipot = document.querySelectorAll('.awtsmoosBtn, .loginStatus, #loginPassword, #registerPassword');
        for (let i = 0; i < potentialKlipot.length; i++) {
            potentialKlipot[i].parentNode.removeChild(potentialKlipot[i]);
        }
    }

    /**
     * @method banishCachingAngels
     * @description Completely unregisters any active service workers.
     * @returns {void}
     */
    banishCachingAngels() {
        if ('serviceWorker' in navigator) {
            
            // Override the register function so it physically CANNOT be called by rogue scripts.
            navigator.serviceWorker.register = function() {
                console.error(`B"H - 🛑 A script just attempted to summon a Service Worker! The Awtsmoos Engine BLOCKED it.`);
                return Promise.reject(new Error("Service Workers are forbidden in this realm."));
            };

            // Hunt down existing ones
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (let i = 0; i < registrations.length; i++) {
                    registrations[i].unregister().then((success) => {
                        if (success) {
                            console.log(`B"H - 🕊️ Caching angel at scope ${registrations[i].scope} has been successfully banished.`);
                        }
                    });
                }
            });
            
            // Clear all physical cache storage
            if ('caches' in window) {
                caches.keys().then((names) => {
                    for (let i = 0; i < names.length; i++) {
                        caches.delete(names[i]);
                        console.log(`B"H - 🗑️ Erased physical cache: ${names[i]}`);
                    }
                });
            }
        }
    }
}
