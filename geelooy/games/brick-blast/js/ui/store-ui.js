// B"H
import * as persistence from '../persistence.js';
import { POWER_UPS } from '../store/index.js';

/**
 * Manifests the player's sacred wealth, their Perutas, in all designated places.
 * @param {number} amount The number of Perutas the player possesses.
 */
export function updatePerutaDisplay(amount) {
    const displays = document.querySelectorAll('.peruta-display');
    displays.forEach(d => {
        d.textContent = `${amount} ¤`;
        d.style.color = amount < 0 ? 'var(--danger)' : 'var(--peruta-gold)';
    });
}

/**
 * A private map to get the correct persistence function for an upgrade ID.
 */
export const upgradeLevelGetters = {
    'extra_balls': persistence.getBallUpgradeLevel,
    'peruta_magnet': persistence.getPerutaMagnetLevel,
    'divine_foresight': persistence.getDivineForesightLevel,
    'rapid_fire': persistence.getRapidFireLevel,
    'paddle_size': persistence.getPaddleSizeLevel,
    'peruta_interest': persistence.getPerutaInterestLevel,
    'critical_strike': persistence.getCriticalStrikeLevel,
};

/**
 * Shows the "Sefer HaMa'amarim" (Book of Discourses) modal.
 * @param {object} powerUp The item to expound upon.
 */
export function showInfoModal(powerUp) {
    document.getElementById('info-modal-title').textContent = powerUp.name;
    document.getElementById('info-modal-icon').textContent = powerUp.icon;
    
    let probText = '';
    if (powerUp.probability_start) {
        probText = `<div style="margin-top: 1rem; color: var(--warning); font-size: 0.8rem;">
            <strong>Divine Probability (Mazal):</strong> Starts at ${Math.round(powerUp.probability_start * 100)}% per turn. 
            Increases by ${Math.round(powerUp.probability_inc * 100)}% each turn it fails to manifest.
        </div>`;
    }

    document.getElementById('info-modal-body').innerHTML = `
        ${powerUp.longDescription || powerUp.description}
        ${probText}
    `;
    
    const closeBtn = document.getElementById('info-modal-close');
    const modal = document.getElementById('info-modal');
    
    // Remove old listeners to avoid stacking
    const newBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newBtn, closeBtn);
    
    newBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.style.display = 'flex';
}

/**
 * Conjures the items for sale in the celestial marketplace.
 * @param {HTMLElement} gridElement The container for the store items.
 * @param {(powerUp: object) => void} onBuyCallback The action to perform when a purchase is attempted.
 * @param {(powerUp: object) => void} onSellCallback The action to perform when a sale is attempted.
 */
export async function populateStore(gridElement, onBuyCallback, onSellCallback) {
    gridElement.innerHTML = '';
    const perutas = await persistence.getPerutas();

    for (const powerUp of POWER_UPS) {
        const item = document.createElement('div');
        item.className = 'store-item';
        
        let ownedText = '';
        let cost = 0;
        let canAfford = false;
        let actionButtonsHTML = '';
        let isMaxLevel = false;
        let canSell = false;
        let buyButtonText = '';

        if (powerUp.type === 'upgrade') {
            const getLevelFunc = upgradeLevelGetters[powerUp.id];
            // Safe guard against undefined functions
            const level = getLevelFunc ? await getLevelFunc() : 0;
            
            isMaxLevel = powerUp.max_level && level >= powerUp.max_level;
            ownedText = isMaxLevel ? 'Max Level' : `Level: ${level}`;
            cost = Math.floor(powerUp.cost * (powerUp.cost_increase_factor ** level));
            canAfford = perutas >= cost;
            canSell = level > 0 && powerUp.id !== 'divine_foresight';
            buyButtonText = isMaxLevel ? 'MAX' : `${cost} ¤`;
            
            let sellButton = canSell 
                ? `<button class="btn btn-danger store-sell-button">Sell</button>`
                : '';
            
            actionButtonsHTML = `
                ${sellButton}
                <button class="btn btn-secondary store-buy-button" ${(!canAfford || isMaxLevel) ? 'disabled' : ''}>
                    <span>${buyButtonText}</span>
                </button>
            `;

        } else if (powerUp.type === 'song') {
            // Songs are currently just visual placeholders for future functionality.
            // Since there is only one, we assume it is owned and active.
            ownedText = "Status: Active";
            cost = powerUp.cost;
            canAfford = true;
            
            actionButtonsHTML = `
                <button class="btn btn-secondary store-buy-button" disabled style="opacity: 0.7; cursor: default;">
                    <span>Playing</span>
                </button>
            `;

        } else { // consumable
            const count = await persistence.getPowerUpCount(powerUp.id);
            ownedText = `Owned: ${count}`;
            cost = powerUp.cost;
            canAfford = perutas >= cost;
            canSell = count > 0;
            
            if (powerUp.customizable) {
                buyButtonText = `${cost} ¤ / ${powerUp.unitName}`;
            } else {
                buyButtonText = `${cost} ¤`;
            }
            
            let sellButton = canSell
                ? `<button class="btn btn-danger store-sell-button">Sell</button>`
                : '';

            actionButtonsHTML = `
                ${sellButton}
                <button class="btn btn-secondary store-buy-button" ${!canAfford ? 'disabled' : ''}>
                    <span class="store-item-cost">${powerUp.customizable ? 'Buy...' : buyButtonText}</span>
                </button>
            `;
        }

        item.innerHTML = `
            <div class="store-item-icon">${powerUp.icon}</div>
            <div class="store-item-details">
                <div class="store-item-header">
                    <div class="store-item-name">${powerUp.name}</div>
                    <button class="btn-icon info-icon" title="Deep Knowledge">ℹ️</button>
                </div>
                <div class="store-item-desc">${powerUp.description}</div>
                <div class="store-item-owned">${ownedText}</div>
            </div>
            <div class="store-item-action">
                ${actionButtonsHTML}
            </div>
        `;
        
        // Add listener for Info Icon
        item.querySelector('.info-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            showInfoModal(powerUp);
        });
        
        if (!isMaxLevel && powerUp.type !== 'song') {
            const buyButton = item.querySelector('.store-buy-button');
            if (buyButton) buyButton.addEventListener('click', () => onBuyCallback(powerUp));
        }
        if (canSell) {
            const sellButton = item.querySelector('.store-sell-button');
            if(sellButton) sellButton.addEventListener('click', () => onSellCallback(powerUp));
        }

        gridElement.appendChild(item);
    }
}

/**
 * Displays the Debt Collector interface.
 * @param {number} currentDebt The negative amount.
 * @param {Array<object>} assets List of sellable assets.
 * @param {Function} onSell Asset sell callback.
 * @param {Function} onContinue Continue callback (only enabled if debt is manageable).
 */
export function showDebtCollector(currentDebt, assets, onSell, onContinue) {
    const modal = document.getElementById('debt-modal');
    document.getElementById('debt-amount').textContent = currentDebt;
    const list = document.getElementById('debt-assets-list');
    list.innerHTML = '';
    
    if (assets.length === 0) {
        list.innerHTML = '<p class="text-muted">You have no assets to sell. The Debt Collector takes pity on you... for now.</p>';
    } else {
        assets.forEach(asset => {
            const item = document.createElement('div');
            item.className = 'debt-asset-item';
            
            const sellValue = Math.floor(asset.value * 0.5);
            
            item.innerHTML = `
                <div class="debt-asset-info">
                    <div class="debt-asset-name">${asset.icon} ${asset.name} (Lvl ${asset.level})</div>
                    <div class="debt-asset-val">Val: ${asset.value} ¤</div>
                </div>
                <button class="btn btn-danger btn-sm">Sell for ${sellValue} ¤</button>
            `;
            
            item.querySelector('button').addEventListener('click', () => onSell(asset));
            list.appendChild(item);
        });
    }

    const continueBtn = document.getElementById('debt-continue-button');
    // If we have no assets, or if debt is cleared (>=0), enable continue
    // Wait, the rule is "make it past a certain threshold".
    // Let's say threshold is -500.
    const isManageable = currentDebt > -500 || assets.length === 0;
    
    continueBtn.disabled = !isManageable;
    continueBtn.onclick = onContinue;

    modal.style.display = 'flex';
}