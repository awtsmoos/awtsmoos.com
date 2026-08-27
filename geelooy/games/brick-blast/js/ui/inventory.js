// B"H
import * as persistence from '../persistence.js';
import { POWER_UPS } from '../store/index.js';

/**
 * Opens or closes the player's sacred satchel of power-ups.
 * @param {boolean} show Whether to show or hide the inventory.
 * @param {(powerUpId: string) => void} onUseCallback The action to perform when an item is used.
 */
export async function toggleInventoryPanel(show, onUseCallback) {
    const panel = document.getElementById('inventory-panel');
    if (show) {
        panel.innerHTML = ''; // Clear previous items
        const inventory = await persistence.getInventory();
        const consumables = POWER_UPS.filter(p => p.type === 'consumable');

        let hasItems = false;
        for (const powerUp of consumables) {
            const count = inventory[powerUp.id] || 0;
            if (count > 0) {
                hasItems = true;
                const item = document.createElement('div');
                item.className = 'inventory-item';
                item.innerHTML = `
                    <div class="inventory-item-name">${powerUp.icon} ${powerUp.name}</div>
                    <div class="inventory-item-count">x${count} remaining</div>
                `;
                item.addEventListener('click', () => onUseCallback(powerUp.id));
                panel.appendChild(item);
            }
        }
        
        if (!hasItems) {
            const noItemsText = document.createElement('p');
            noItemsText.textContent = "No power-ups available.";
            noItemsText.style.color = 'var(--text-muted)';
            panel.appendChild(noItemsText);
        }
        
        const closeButton = document.createElement('button');
        closeButton.id = 'inventory-close-button';
        closeButton.className = 'btn btn-secondary';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => toggleInventoryPanel(false, onUseCallback));
        panel.appendChild(closeButton);

        panel.classList.add('active');
    } else {
        panel.classList.remove('active');
    }
}