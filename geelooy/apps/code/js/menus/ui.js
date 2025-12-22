// B"H
// FILE: js/menus/ui.js

import { DOM } from '../state.js';
import { Menus } from './index.js';

export const MenuUI = {
    handleDocumentClick(e) {
        if (!DOM.contextMenu.contains(e.target) && !DOM.mainMenu.contains(e.target)) {
            Menus.hideAll();
        }
    },

    hideAll() {
        DOM.contextMenu.style.display = "none";
        DOM.mainMenu.style.display = "none";
        document.querySelectorAll(".context-active").forEach(el => el.classList.remove("context-active"));
        document.removeEventListener("click", this.handleDocumentClick);
    },

    renderMenu(container, items, coords) {
        container.innerHTML = items.map(i => {
            if (i.isSeparator) return `<hr class="menu-separator">`;
            const dangerStyle = i.danger ? 'style="color: var(--color-accent-danger);"' : "";
            return `
                <button class="menu-button" data-action="${i.action}" ${i.disabled ? "disabled" : ""} ${dangerStyle}>
                    <svg class="svg-icon"><use href="#icon-${i.icon || 'play'}"/></svg> 
                    ${i.label}
                </button>`;
        }).join("");
        
        this.positionAndDisplay(container, coords);
    },

    positionAndDisplay(menu, coords) {
        // Slight delay to allow DOM to calculate dimensions
        setTimeout(() => {
            const { clientX: x, clientY: y } = coords;
            menu.style.display = "block";
            const menuRect = menu.getBoundingClientRect();
            
            const adjustedX = x + menuRect.width > window.innerWidth 
                ? window.innerWidth - menuRect.width - 5 
                : x;
            
            let adjustedY = y;
            if (y + menuRect.height > window.innerHeight) {
                if (y > window.innerHeight / 2) {
                    adjustedY = y - menuRect.height;
                    if (adjustedY < 0) adjustedY = 5; 
                } else {
                    adjustedY = window.innerHeight - menuRect.height - 5;
                }
            }
            
            menu.style.left = `${adjustedX}px`;
            menu.style.top = `${adjustedY}px`;
        }, 10);
    }
};