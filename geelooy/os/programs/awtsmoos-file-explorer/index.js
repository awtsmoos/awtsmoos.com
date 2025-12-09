/*B"H*/
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import myStyles from "./styles/index.js";
import { createState } from "./state.js";
import createNavbar from "./components/navbar.js";
import createSidebar from "./components/sidebar.js";
import createFileView from "./components/fileView.js";
import { handlePaste } from "./utils/dragDrop.js";

export default ({ os, path, title, system } = {}) => {
    const state = createState(path);
    const container = createElement({ 
        tag: "div", 
        attributes: { class: "file-explorer", tabindex: "0" } // Tabindex ensures div can catch paste events
    });

    // --- Actions ---
    const refreshAll = () => {
        fileView.render();
    };

    const navigateTo = async (newPath) => {
        state.currentPath = newPath;
        navbar.updatePath(newPath);
        await fileView.render();
        await sidebarComp.syncSelection(newPath);
    };

    const enterSelectionMode = async (initialPath) => {
        state.selectionMode = true;
        await fileView.render(); // Re-render to clear listeners/state if needed
        const el = container.querySelector(`[data-path="${initialPath}"]`);
        if (el) el.classList.add('selected');
        renderSelectionActionBar();
    };

    const exitSelectionMode = async () => {
        state.selectionMode = false;
        container.querySelector('.selection-action-bar')?.remove();
        await fileView.render();
    };

    // --- Components ---
    const sidebarComp = createSidebar({ state, os, onNavigate: navigateTo, onRefresh: refreshAll });
    const navbar = createNavbar({ state, os, onNavigate: navigateTo, onRefresh: refreshAll, sidebar: sidebarComp });
    const fileView = createFileView({ state, os, onNavigate: navigateTo, onRefresh: refreshAll, system, onEnterSelectionMode: enterSelectionMode, onExitSelectionMode: exitSelectionMode });

    // --- Layout ---
    const contentArea = createElement({ tag: 'div', attributes: { class: 'file-explorer-content' }});
    const resizer = createElement({ tag: 'div', attributes: { class: 'sidebar-resizer' } });
    
    // Resizer Logic
    const startResize = (startEvent) => {
        startEvent.preventDefault();
        document.body.style.cursor = 'col-resize';
        const startX = startEvent.touches ? startEvent.touches[0].clientX : startEvent.clientX;
        const startWidth = sidebarComp.dom.offsetWidth;
        const doDrag = (moveEvent) => {
            const currentX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const newWidth = startWidth + currentX - startX;
            if (newWidth > 100) sidebarComp.dom.style.width = newWidth + 'px';
        };
        const stopDrag = () => {
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
        };
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    };
    resizer.addEventListener('mousedown', startResize);

    contentArea.append(sidebarComp.dom, resizer, fileView.dom);
    container.append(navbar.dom, contentArea);

    // --- Clipboard Paste Support ---
    container.addEventListener('paste', (e) => {
        handlePaste(e, state.currentPath, os, system, refreshAll);
    });

    // --- Selection Action Bar ---
    function renderSelectionActionBar() {
        const bar = createElement({
            tag: 'div', attributes: { class: 'selection-action-bar' },
            children: [
                { tag: 'span', html: 'Selected Items' },
                { tag: 'button', html: 'Cut', on: { click: () => {
                    const paths = Array.from(container.querySelectorAll('.selected')).map(el => el.dataset.path);
                    os.clipboard = { action: 'cut', paths, path: paths[0], name: paths[0].split('/').pop() };
                    exitSelectionMode();
                }}},
                { tag: 'button', html: 'Delete', on: { click: async () => {
                     if (confirm("Delete selected?")) {
                         const els = container.querySelectorAll('.selected');
                         for(const el of els) await os.db.deleteFile(el.dataset.path.substring(0, el.dataset.path.lastIndexOf('/')), el.dataset.path.split('/').pop());
                         exitSelectionMode();
                     }
                }}},
                { tag: 'button', html: 'Cancel', attributes: { class: 'cancel-btn' }, on: { click: exitSelectionMode } }
            ]
        });
        container.appendChild(bar);
    }

    // --- Init ---
    const style = document.createElement("style");
    style.innerHTML = myStyles;
    document.head.appendChild(style);

    // Initial Render
    navigateTo(state.currentPath);

    return { div: container };
};