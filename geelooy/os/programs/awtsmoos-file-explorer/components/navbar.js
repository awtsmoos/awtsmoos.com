// B"H
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { importFiles } from "/os/helpers/scripts.js";
 
export default function createNavbar({ state, os, onNavigate, onRefresh, sidebar }) {
    // --- Input Dialog Helper ---
    function showInputDialog({ title, callback }) {
        const overlay = createElement({ tag: 'div', attributes: { class: 'input-dialog-overlay' } });
        const dialog = createElement({ tag: 'div', attributes: { class: 'input-dialog' } });
        const dialogTitle = createElement({ tag: 'div', attributes: { class: 'dialog-title' }, html: title });
        const input = createElement({ tag: 'input', attributes: { type: 'text' } });
        const buttonContainer = createElement({ tag: 'div', attributes: { class: 'dialog-buttons' } });
        const okButton = createElement({ tag: 'button', html: 'OK' });
        const cancelButton = createElement({ tag: 'button', html: 'Cancel' });
        
        buttonContainer.append(okButton, cancelButton);
        dialog.append(dialogTitle, input, buttonContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        input.focus();
        const closeDialog = () => overlay.remove();
        const submit = () => {
            if (input.value) callback(input.value);
            closeDialog();
        };
        okButton.onclick = submit;
        cancelButton.onclick = closeDialog;
        input.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
    }

    // --- Buttons ---
    const buttonBar = createElement({ tag: 'div', attributes: { class: 'button-bar' }});
    
    // Sidebar Toggle
    const sidebarToggleBtn = createElement({ 
        tag: 'button', 
        attributes: { class: 'sidebar-toggle-btn' }, 
        html: '<span>&#9776;</span>', 
        on: { click: () => document.querySelector('.file-explorer')?.classList.toggle('sidebar-collapsed') } 
    });

    // Actions
    const menuButtons = createElement({
        tag: 'div', attributes: { class: 'menu-buttons' },
        children: [
            { tag: "button", html: "New File", on: {
                click: () => showInputDialog({
                    title: 'Enter New File Name', 
                    callback: async (name) => { 
                        var ext = name.includes(".") ? name.substring(name.lastIndexOf(".")) : "";
                        var defCont = 'B"H\nContent of ' + name;
                        if(ext == ".html") defCont = "<!--B\"H-->\n<!DOCTYPE html>...";
                        await os.createFile({ path: state.currentPath, title: name, content:defCont });
                        onRefresh();
                    }
                })
            }},
            { tag: "button", html: "New Folder", on: { 
                click: () => showInputDialog({ title: 'Enter New Folder Name', callback: async (name) => { 
                    await os.createFolder({ path: state.currentPath, title: name }); 
                    onRefresh();
                    // Trigger sidebar refresh via callback if needed, but a full refresh usually handles it
                }})
            }},
            { tag: "button", html: "Import", on: { 
                click: async () => {
                    await importFiles({ os, path: state.currentPath });
                    onRefresh(); // B"H - Ensures UI updates after import finishes
                } 
            }},
        ]
    });

    const viewControls = createElement({
        tag: 'div', attributes: { class: 'view-controls' },
        children: [
            { tag: 'button', html: 'Icons', on: { click: () => { state.viewMode = 'icons'; onRefresh(true); } }},
            { tag: 'button', html: 'Details', on: { click: () => { state.viewMode = 'details'; onRefresh(true); } }}
        ]
    });

    const spacer = createElement({tag: 'div', attributes: { style: 'flex-grow: 1' } });
    buttonBar.append(sidebarToggleBtn, menuButtons, spacer, viewControls);

    // --- Path Bar ---
    const pathBarContainer = createElement({ tag: 'div', attributes: { class: 'path-bar-container' } });
    const pathBreadcrumbs = createElement({ tag: 'div', attributes: { class: 'path-breadcrumbs' }});
    const pathInputContainer = createElement({ tag: 'div', attributes: { class: 'path-input-container' }});
    const pathInput = createElement({ tag: 'input', attributes: { type: 'text' }});
    pathInputContainer.appendChild(pathInput);

    const upBtn = createElement({ 
        tag: 'button', 
        attributes: { class: 'nav-btn', title: 'Go Up' }, 
        html: '↑',
        on: { click: () => {
            if(state.currentPath === '/' || !state.currentPath) return;
            const parent = state.currentPath.split('/').slice(0, -1).join('/') || '/';
            onNavigate(parent);
        }}
    });

    const editBtn = createElement({ tag: 'button', attributes: { class: 'edit-path-btn' }, html: '✎' });

    // Mode Switching
    const switchToEditMode = () => {
        pathBreadcrumbs.style.display = 'none';
        editBtn.style.display = 'none';
        pathInputContainer.style.display = 'flex';
        pathInput.focus();
        pathInput.select();
    };
    const onEditEnd = () => {
        pathBreadcrumbs.style.display = 'flex';
        editBtn.style.display = 'block';
        pathInputContainer.style.display = 'none';
    };

    editBtn.onclick = switchToEditMode;
    pathInput.addEventListener('blur', onEditEnd);
    pathInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            onNavigate(pathInput.value.trim());
            onEditEnd();
        }
    });

    // Update function for external call
    const updatePath = (currentPath) => {
        pathBreadcrumbs.innerHTML = '';
        if (currentPath === '/') {
            pathBreadcrumbs.appendChild(createElement({ tag: 'span', attributes: { class: 'path-segment' }, html: 'Home' }));
            pathInput.value = 'Home';
            return;
        }

        const parts = currentPath.split('/').filter(p => p);
        parts.forEach((part, index) => {
            const partPath = parts.slice(0, index + 1).join('/');
            pathBreadcrumbs.appendChild(createElement({
                tag: 'span',
                attributes: { class: 'path-segment' },
                html: part,
                on: { click: (e) => { e.stopPropagation(); onNavigate(partPath); } }
            }));
            if (index < parts.length - 1) {
                pathBreadcrumbs.appendChild(createElement({ tag: 'span', attributes: { class: 'path-separator' }, html: '›' }));
            }
        });
        pathInput.value = currentPath;
    };

    pathBarContainer.onclick = (e) => {
         if (e.target === pathBarContainer || e.target === pathBreadcrumbs) switchToEditMode();
    };

    pathBarContainer.append(upBtn, pathBreadcrumbs, pathInputContainer, editBtn);

    const header = createElement({ tag: "div", attributes: { class: "file-explorer-header" } });
    header.append(buttonBar, pathBarContainer);

    return { dom: header, updatePath };
}