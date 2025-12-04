// B"H
import UI from '/scripts/awtsmoos/ui/index.js';
import { initAuth } from './store.js';
import { renderAppLayout } from './ui/layout.js';

// Initialize UI Library
const ui = new UI();

// Mount Point
const root = document.getElementById('root');
if (!root) throw new Error("Root element missing");

// Initialize App
(async () => {
    try {
        // Render Skeleton
        renderAppLayout(ui, root);
        
        // Start Authentication Flow
        await initAuth(ui);
        
    } catch (e) {
        console.error("Awtsmoos Mail Crash:", e);
        ui.html({
            parent: root,
            tag: "div",
            style: "color:red; padding:20px; text-align:center;",
            textContent: "The Vessel has shattered. Check console."
        });
    }
})();

// Expose for debug
window.awtsmoosUI = ui;