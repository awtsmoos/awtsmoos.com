
/**
 * B"H
 * @module HeichelApp
 * @description
 * The single spark that initiates the creation of the Great Library.
 * It coordinates the manifestation of the UI from JSON and the 
 * awakening of the Navigator.
 */

import { HeichelNavigator } from './modules/navigator.js';
import { initializeEventListeners } from './modules/events.js';
import { manifestWorld } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("B\"H - Commencing Creation Ritual...");

        const heichelId = window.location.pathname.split('/')[2];
        if (!heichelId) {
            throw new Error('Heichel ID missing from the URL.');
        }

        const navigator = new HeichelNavigator(heichelId);

        // 1. Manifest the entire UI from JSON blueprints
        manifestWorld(navigator, document.body);

        // 2. Awake the Navigator's logic
        navigator.initialize().then(() => {
            initializeEventListeners(navigator);
            console.log("B\"H - The Library consciousness is fully manifest.");
        });

    } catch (error) {
        console.error("B\"H - Fatal failure in the Great Manifestation:", error);
        document.body.innerHTML = `<h1 style='color:red; text-align:center;'>VOID ERROR: ${error.message}</h1>`;
    }
});
