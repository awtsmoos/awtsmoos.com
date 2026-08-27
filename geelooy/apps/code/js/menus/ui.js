
// B"H
// FILE: js/menus/ui.js

import { DOM, State } from '../state.js';

export const MenuUI = {
    handleDocumentClick(e) {
        const isMenuClick = (DOM.contextMenu && DOM.contextMenu.contains(e.target)) || 
                          (DOM.mainMenu && DOM.mainMenu.contains(e.target));
        if (!isMenuClick) {
            MenuUI.hideAll();
        }
    },

    hideAll() {
        if (DOM.contextMenu) DOM.contextMenu.style.display = "none";
        if (DOM.mainMenu) DOM.mainMenu.style.display = "none";
        document.querySelectorAll(".context-active").forEach(el => el.classList.remove("context-active"));
        document.removeEventListener("click", this.handleDocumentClick);
    },

    renderMenu(container, items, e) {
        if (!container || !e) return;
        
        const x = (typeof e.clientX === 'number') ? e.clientX : window.innerWidth / 2;
        const y = (typeof e.clientY === 'number') ? e.clientY : window.innerHeight / 2;
        
        container.innerHTML = items.map(i => {
            if (i.isSeparator) return `<hr class="menu-separator">`;
            const dangerClass = i.danger ? 'danger' : '';
            return `
                <button class="menu-button ${dangerClass}" data-action="${i.action}">
                    <svg class="svg-icon"><use href="#icon-${i.icon || 'play'}"/></svg> 
                    <span>${i.label}</span>
                </button>`;
        }).join("");
        
        container.onclick = (event) => {
            const btn = event.target.closest('button[data-action]');
            if (btn) {
                event.preventDefault();
                event.stopPropagation();
                import('./index.js').then(m => m.Menus.handleAction(btn.dataset.action));
            }
        };

        this.positionMenu(container, x, y);
    },

    positionMenu(menu, x, y) {
        menu.style.display = "block";
        menu.style.visibility = "hidden";
        
        requestAnimationFrame(() => {
            const rect = menu.getBoundingClientRect();
            let posX = x + 5;
            let posY = y + 5;

            if (posX + rect.width > window.innerWidth) posX = window.innerWidth - rect.width - 10;
            if (posY + rect.height > window.innerHeight) posY = window.innerHeight - rect.height - 10;

            menu.style.left = `${Math.max(5, posX)}px`;
            menu.style.top = `${Math.max(5, posY)}px`;
            menu.style.visibility = "visible";
            
            setTimeout(() => {
                document.addEventListener("click", this.handleDocumentClick, { once: true });
            }, 10);
        });
    }
};
