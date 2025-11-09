// B"H

import { Menus } from './menus.js';

export const CustomMenu = {
    container: null,

    init() {
        this.container = document.getElementById('custom-menu-container');
        if (!this.container) {
            console.error("Custom menu container not found!");
        }
        // Listen for registration messages from the parent (the OS)
        window.addEventListener('message', (event) => {
            if (event.data?.type === 'registerMenus') {
                this.buildFromConfig(event.data.payload);
            }
        });
    },

    /**
     * Builds all custom menus from a configuration object.
     * @param {Array<object>} menuConfigs - An array of menu configuration objects.
     * Example: [{ title: 'Awtsmoos', items: [{ label: 'Run', action: 'run-js' }] }]
     */
    buildFromConfig(menuConfigs) {
        if (!this.container || !Array.isArray(menuConfigs)) return;

        // Clear any existing custom menus
        this.container.innerHTML = '';

        menuConfigs.forEach(config => {
            const menuEl = this.createMenu(config);
            this.container.appendChild(menuEl);
        });
    },

    /**
     * Creates a single menu element from a config object.
     * @param {object} config - A configuration for one menu.
     */
    createMenu(config) {
        const menuContainer = document.createElement('div');
        menuContainer.className = 'custom-menu';

        const button = document.createElement('button');
        button.className = 'menu-bar-button';
        button.innerHTML = config.title; // The title can be HTML

        const dropdown = document.createElement('div');
        dropdown.className = 'custom-menu-dropdown';

        // Populate dropdown with items
        config.items.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.className = 'menu-button';
            itemButton.dataset.action = item.action;
            
            let iconHTML = '';
            if (item.icon) {
                // Allows for SVG icon names or full <svg> tags
                const isIconName = !item.icon.trim().startsWith('<');
                iconHTML = isIconName 
                    ? `<svg class="svg-icon"><use href="#icon-${item.icon}"/></svg>`
                    : item.icon;
            }
            
            itemButton.innerHTML = `${iconHTML} ${item.label}`;
            dropdown.appendChild(itemButton);
        });

        menuContainer.append(button, dropdown);

        // --- Attach Event Listeners ---
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            Menus.hideAll(); // Hide other menus
            // Hide all other custom dropdowns before showing this one
            document.querySelectorAll('.custom-menu-dropdown').forEach(d => d.style.display = 'none');
            dropdown.style.display = isVisible ? 'none' : 'block';
        });

        dropdown.addEventListener('click', (e) => {
            const actionButton = e.target.closest('button[data-action]');
            if (actionButton) {
                Menus.handleAction(actionButton.dataset.action);
            }
        });

        return menuContainer;
    }
};