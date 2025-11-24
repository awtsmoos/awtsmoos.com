// /heichelos/heichel/app.js
// B"H 
//- The Awtsmoos's Point of Inception

import { HeichelNavigator } from './modules/navigator.js';
import { initializeEventListeners } from './modules/events.js';
import { appState } from './state.js';
import { initializeDOMElements } from './modules/dom.js'; // FIX: Import initialization function

document.addEventListener('DOMContentLoaded', () => {
    // FIX: Populate DOMElements object now that the DOM is ready.
    // This resolves the error where elements were null.
    initializeDOMElements(); 

    console.log("B\"H - Quantum Datastream Engaging...");
    const heichelId = window.location.pathname.split('/')[2];

    if (!heichelId) {
        document.body.innerHTML = '<h1>FATAL ERROR: Heichel ID missing from URL. Cannot initialize.</h1>';
        return;
    }
    appState.heichelId = heichelId;

    const navigator = new HeichelNavigator(heichelId);

    navigator.initialize().then(() => {
        initializeEventListeners(navigator);
        console.log("B\"H - Heichel Consciousness Fully Awake.");
    }).catch(error => {
        console.error("Initialization failed:", error);
        document.body.innerHTML = '<h1>Error initializing Heichel. See console for details.</h1>';
    });
});