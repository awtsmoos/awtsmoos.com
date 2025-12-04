// B"H
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderLoginOverlay } from './modals.js';
import { renderComposeModal } from './modals.js';

export function renderAppLayout(ui, root) {
    // 1. Overlay (Login)
    renderLoginOverlay(ui, root);

    // 2. Compose Modal
    renderComposeModal(ui, root);

    // 3. Main Grid
    ui.html({
        parent: root,
        tag: 'div',
        shaym: 'appContainer',
        classList: ['app-container'],
        children: [
            // Sidebar Column
            {
                tag: 'aside',
                classList: ['sidebar'],
                shaym: 'sidebarPanel',
                ready: (el) => renderSidebar(ui, el)
            },
            // Chat Column
            {
                tag: 'main',
                classList: ['chat-area'],
                shaym: 'chatPanel',
                ready: (el) => renderChat(ui, el)
            }
        ]
    });
}