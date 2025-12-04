
// B"H
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderLoginOverlay, renderComposeModal } from './modals.js';

export function renderAppLayout(ui, root) {
    // 1. Render Overlays (Modals) - Z-Index 9999
    renderLoginOverlay(ui, root);
    renderComposeModal(ui, root);

    // 2. Render Main Application Grid - Z-Index 5
    ui.html({
        parent: root,
        tag: 'div',
        shaym: 'appContainer',
        classList: ['app-container'], 
        children: [
            // Left Column: Sidebar
            {
                tag: 'aside',
                classList: ['sidebar'],
                shaym: 'sidebarPanel',
                ready: (el) => renderSidebar(ui, el)
            },
            // Right Column: Chat Area
            {
                tag: 'main',
                classList: ['chat-area'],
                shaym: 'chatPanel',
                ready: (el) => renderChat(ui, el)
            }
        ]
    });
}
