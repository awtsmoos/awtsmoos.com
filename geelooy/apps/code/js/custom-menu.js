// B"H
// FILE: js/custom-menu.js

import { DOM } from './state.js';
import { Menus } from './menus.js';

export const CustomMenu = {
    // Stores references to the created menu elements
    activeMenus: new Map(), // key: menuId, value: { button, dropdown }

    init() {
        // Global listener to close any open custom menus when clicking outside
        document.addEventListener('click', (e) => {
            // Check if the click was on one of our toggle buttons. If so, do nothing here.
            if (e.target.closest('.menu-bar-button[data-menu-id]')) {
                return;
            }
            // If the click is not inside a custom dropdown, hide all dropdowns.
            if (!e.target.closest('.custom-menu-dropdown')) {
                this.hideAllDropdowns();
            }
        });
    },

    createFromConfig(menuConfigs) {
        if (!Array.isArray(menuConfigs)) return;

        this.clearAll(); // Clear any existing menus first

        menuConfigs.forEach(config => {
            if (!config.title || !config.items) return;
            const menuId = `custom-menu-${config.title.replace(/\s+/g, '-')}`;

            // --- Create the button and add it to the menu bar ---
            const menuButton = document.createElement('button');
            menuButton.className = 'menu-bar-button';
            menuButton.textContent = config.title;
            menuButton.dataset.menuId = menuId; // Link button to its dropdown

            // --- Create the dropdown but append it to the BODY ---
            const dropdown = document.createElement('div');
            dropdown.className = 'custom-menu-dropdown';
            dropdown.id = menuId; // Give it a unique ID

            config.items.forEach(item => {
                const menuItem = document.createElement('button');
                menuItem.className = 'menu-button';
                menuItem.dataset.action = item.action;
                menuItem.innerHTML = `
                    <svg class="svg-icon"><use href="#icon-${item.icon || 'brain'}"></use></svg>
                    <span>${item.label}</span>
                `;
                dropdown.appendChild(menuItem);
            });
            
            document.body.appendChild(dropdown); // Append to body for correct positioning context

            // --- Add event listeners ---
            menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const currentlyVisible = dropdown.style.display === 'block';
                this.hideAllDropdowns(); // Hide all other menus
                if (!currentlyVisible) {
                    this.positionAndDisplay(dropdown, menuButton); // Show and position this one
                }
            });

            dropdown.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (button && button.dataset.action) {
                    Menus.handleAction(button.dataset.action);
                    this.hideAllDropdowns();
                }
            });

            // --- Assemble and append button to the DOM ---
            const menuContainer = document.createElement('div');
            menuContainer.className = 'custom-menu';
            menuContainer.appendChild(menuButton);
            DOM.customMenuContainer.appendChild(menuContainer);

            this.activeMenus.set(menuId, { button: menuButton, dropdown });
        });
    },

    positionAndDisplay(menu, button) {
        const btnRect = button.getBoundingClientRect();
        const coords = {
            clientX: btnRect.left,
            clientY: btnRect.bottom + 5 // Position below the button
        };
        
        const { clientX: x, clientY: y } = coords;
        menu.style.display = 'block';
        const menuRect = menu.getBoundingClientRect();

        const adjustedX = (x + menuRect.width > window.innerWidth) ? window.innerWidth - menuRect.width - 5 : x;
        let adjustedY = y;
        if (y + menuRect.height > window.innerHeight) {
            adjustedY = btnRect.top - menuRect.height - 5; // Reposition above button if no space
        }

        menu.style.left = `${adjustedX}px`;
        menu.style.top = `${adjustedY}px`;
    },

    hideAllDropdowns() {
        this.activeMenus.forEach(menu => {
            menu.dropdown.style.display = 'none';
        });
    },
    
    clearAll() {
        this.activeMenus.forEach(menu => {
            menu.button.parentElement.remove();
            menu.dropdown.remove();
        });
        this.activeMenus.clear();
        DOM.customMenuContainer.innerHTML = '';
    }
};