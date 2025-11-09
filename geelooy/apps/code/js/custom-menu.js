// B"H
// FILE: js/custom-menu.js

import { State, DOM } from './state.js';
import { Menus } from './menus.js';

let activeCustomDropdown = null;

// This function will now be responsible for closing the custom menu
const hideCustomMenu = () => {
    if (activeCustomDropdown) {
        activeCustomDropdown.style.display = 'none';
        activeCustomDropdown = null;
        // Clean up the event listener
        document.removeEventListener('click', hideCustomMenu);
    }
};

export const CustomMenu = {
    init() {
        // We listen for clicks on the container to handle any custom menu button
        DOM.customMenuContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.menu-bar-button');
            if (!button) return;

            // Stop this click from immediately closing the menu via the document listener
            e.stopPropagation();
            
            // Hide any other standard menus that might be open
            Menus.hideAll(); 

            const menu = button.closest('.custom-menu');
            const dropdown = menu.querySelector('.custom-menu-dropdown');

            // If a different custom menu is already open, hide it first
            if (activeCustomDropdown && activeCustomDropdown !== dropdown) {
                hideCustomMenu();
            }

            // --- THIS IS THE CORE FIX ---
            
            // 1. Move the dropdown to be a direct child of the body.
            //    This breaks it out of all clipping and stacking contexts.
            document.body.appendChild(dropdown);

            // 2. Calculate the exact position of the button that was clicked.
            const rect = button.getBoundingClientRect();

            // 3. Position the dropdown using 'fixed' (relative to the viewport)
            //    right underneath the button.
            dropdown.style.position = 'fixed';
            dropdown.style.top = `${rect.bottom + 4}px`; // 4px gap
            dropdown.style.left = `${rect.left}px`;

            // 4. Toggle the display.
            const isVisible = dropdown.style.display === 'block';
            if (isVisible) {
                hideCustomMenu();
            } else {
                dropdown.style.display = 'block';
                activeCustomDropdown = dropdown;
                // Add a one-time listener to the whole document to close the menu
                // if the user clicks anywhere else.
                setTimeout(() => document.addEventListener('click', hideCustomMenu), 0);
            }
        });
    },

    create(menuConfig) {
        if (!menuConfig || !menuConfig.items) return;

        const menuDiv = document.createElement('div');
        menuDiv.className = 'custom-menu';

        const menuBarButton = document.createElement('button');
        menuBarButton.className = 'menu-bar-button';
        menuBarButton.textContent = menuConfig.title || 'Menu';
        
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-menu-dropdown';

        menuConfig.items.forEach(item => {
            const button = document.createElement('button');
            button.className = 'menu-button';
            button.dataset.action = item.action;
            button.innerHTML = `
                <svg class="svg-icon"><use href="#icon-${item.icon || 'file'}"></use></svg>
                <span>${item.label}</span>
            `;
            // This click will be handled by the main menu handler
            button.addEventListener('click', (e) => {
                Menus.handleAction(item.action);
                hideCustomMenu(); // Close menu after action
            });
            dropdown.appendChild(button);
        });

        menuDiv.appendChild(menuBarButton);
        // IMPORTANT: We append the dropdown here initially, but our 'show' logic will move it.
        menuDiv.appendChild(dropdown); 

        DOM.customMenuContainer.appendChild(menuDiv);
    }
};