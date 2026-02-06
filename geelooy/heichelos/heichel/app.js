// B"H
// /heichelos/heichel/app.js
// The single point of ignition for the Great Library's consciousness.

import { HeichelNavigator } from './modules/navigator.js';
import { initializeEventListeners } from './modules/events.js';
import { appState } from './state.js';
import { initializeDOMElements } from './modules/dom.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("B\"H - Awakening the Great Library...");
        
        initializeDOMElements();
        console.log("B\"H - The physical form of the Library is recognized.");

        const heichelId = window.location.pathname.split('/')[2];
        if (!heichelId) {
            throw new Error('Heichel ID missing from the sacred path (URL).');
        }
        appState.heichelId = heichelId;

        const navigator = new HeichelNavigator(heichelId);

        navigator.initialize().then(() => {
            initializeEventListeners(navigator);
            console.log("B\"H - The Library's consciousness is fully awake.");
        });

    } catch (error) {
        console.error("A fatal rupture occurred in the Library's creation:", error);
        document.body.innerHTML = `<h1>Error: ${error.message}</h1>`;
    }
});