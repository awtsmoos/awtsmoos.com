
// B"H
import { buildHeader } from './header.js';
import { buildInspector } from './inspector.js';
import { buildSurgeryPanel, buildLogsPanel } from './surgery.js';
import { buildChat } from './chat.js';
import { buildModals } from './modals.js';

export function buildApp() {
    const root = document.getElementById('app-root');
    if (!root) return;
    
    // 1. Header
    root.appendChild(buildHeader());

    // 2. Main Viewport
    const viewport = document.createElement('div');
    viewport.className = 'view-viewport';
    root.appendChild(viewport);

    // 3. Inspector View
    const inspector = buildInspector();
    viewport.appendChild(inspector);
    
    // Inject Right Column Content (Surgery + Logs)
    const rightCol = inspector.querySelector('#inspectorRightCol');
    if (rightCol) {
        rightCol.appendChild(buildSurgeryPanel());
        rightCol.appendChild(buildLogsPanel());
    }

    // 4. Chat View
    viewport.appendChild(buildChat());

    // 5. Modals
    const modals = buildModals();
    modals.forEach(m => document.body.appendChild(m));
}
