// B"H
// FILE: js/custom-menu.js

import { DOM } from './state.js';
import { Menus } from './menus.js';

export const CustomMenu = {
    // Stores references to the created menu elements
    activeMenus: new Map(),

    init() {
        // Add a global click listener to close any open custom menus
        document.addEventListener('click', (e) => {
            // If the click is not inside a custom menu, hide all dropdowns
            if (!e.target.closest('.custom-menu')) {
                this.hideAllDropdowns();
            }
        });
    },

    createFromConfig(menuConfigs) {
        if (!Array.isArray(menuConfigs)) return;

        // Clear any existing custom menus
        DOM.customMenuContainer.innerHTML = '';
        this.activeMenus.clear();

        menuConfigs.forEach(config => {
            if (!config.title || !config.items) return;

            // --- Create the HTML elements ---

            // 1. The main container for one menu (e.g., "Awtsmoos")
            const menuContainer = document.createElement('div');
            menuContainer.className = 'custom-menu';

            // 2. The button that is visible in the menu bar
            const menuButton = document.createElement('button');
            menuButton.className = 'menu-bar-button';
            menuButton.textContent = config.title;

            // 3. The dropdown panel, hidden by default
            const dropdown = document.createElement('div');
            dropdown.className = 'custom-menu-dropdown';

            // 4. Populate the dropdown with items from the config
            config.items.forEach(item => {
                const menuItem = document.createElement('button');
                menuItem.className = 'menu-button'; // Use the same style as other menu items
                menuItem.dataset.action = item.action;
                
                // Use innerHTML to create the icon and label
                menuItem.innerHTML = `
                    <svg class="svg-icon"><use href="#icon-${item.icon || 'brain'}"></use></svg>
                    <span>${item.label}</span>
                `;
                dropdown.appendChild(menuItem);
            });

            // --- Add event listeners ---

            // Click the main button to toggle its dropdown
            menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                // Hide other dropdowns before showing this one
                this.hideAllDropdowns(dropdown);
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });

            // Clicks inside the dropdown should be handled by the main menu action handler
            dropdown.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (button && button.dataset.action) {
                    Menus.handleAction(button.dataset.action);
                    this.hideAllDropdowns(); // Hide after an action is clicked
                }
            });

            // --- Assemble and append to the DOM ---
            menuContainer.append(menuButton, dropdown);
            DOM.customMenuContainer.appendChild(menuContainer);

            // Store a reference for later
            this.activeMenus.set(config.title, { container: menuContainer, dropdown });
        });
    },

    hideAllDropdowns(exceptThisOne = null) {
        this.activeMenus.forEach(menu => {
            if (menu.dropdown !== exceptThisOne) {
                menu.dropdown.style.display = 'none';
            }
        });
    }
};