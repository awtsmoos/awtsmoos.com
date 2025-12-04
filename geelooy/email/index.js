
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
        // We pass 'ui' so store can manipulate overlays
        await initAuth(ui);
        
    } catch (e) {
        console.error("Awtsmoos Mail Crash:", e);
        ui.html({
            parent: root,
            tag: "div",
            style: "color:red; padding:20px; text-align:center; font-family:monospace; margin-top:50px;",
            textContent: "FATAL ERROR: The Vessel has shattered. Check console."
        });
    }
})();

window.awtsmoosUI = ui;
