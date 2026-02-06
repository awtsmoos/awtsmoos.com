// B"H
import { toggleModal } from '../../ui.js';

/**
 * The Purchase Tuner is a specialized UI minister that presides over the
 * Altar of Customization—the modal for buying variable quantities of consumables.
 */
export class PurchaseTuner {
    constructor() {
        this.elements = {
            title: document.getElementById('purchase-modal-title'),
            desc: document.getElementById('purchase-modal-desc'),
            display: document.getElementById('purchase-modal-display'),
            cost: document.getElementById('purchase-modal-cost'),
            slider: document.getElementById('purchase-tuner-slider'),
            input: document.getElementById('purchase-tuner-input'),
            buy: document.getElementById('purchase-tuner-buy'),
            cancel: document.getElementById('purchase-tuner-cancel'),
            plus: document.getElementById('purchase-tuner-plus'),
            minus: document.getElementById('purchase-tuner-minus'),
        };
        
        this.powerUp = null;
        this.currentPerutas = 0;
        this.onPurchaseCallback = () => {};

        // Bind event listeners once
        this.elements.cancel.addEventListener('click', () => this.hide());
        this.elements.buy.addEventListener('click', () => this.purchase());
        this.elements.plus.addEventListener('click', () => this.increment());
        this.elements.minus.addEventListener('click', () => this.decrement());
        this.elements.slider.addEventListener('input', (e) => this.update(e.target.value));
        this.elements.input.addEventListener('input', (e) => this.update(e.target.value));
    }
    
    /**
     * Updates the tuner's display and cost based on the chosen quantity.
     * @param {string | number} value The new quantity.
     */
    update(value) {
        if (!this.powerUp) return;
        const max = this.powerUp.max_purchase || 100;
        const quantity = Math.max(1, Math.min(max, parseInt(value, 10) || 1));
        
        this.elements.display.textContent = quantity;
        this.elements.slider.value = quantity;
        this.elements.input.value = quantity;
        
        const totalCost = this.powerUp.cost * quantity;
        this.elements.cost.textContent = `Cost: ${totalCost} ¤`;
        
        if (totalCost > this.currentPerutas) {
            this.elements.buy.disabled = true;
            this.elements.cost.style.color = 'var(--danger)';
        } else {
            this.elements.buy.disabled = false;
            this.elements.cost.style.color = 'var(--peruta-gold)';
        }
    }

    /**
     * Opens the Altar of Customization for a specific power-up.
     * @param {object} powerUp The power-up being purchased.
     * @param {number} currentPerutas The player's current wealth.
     * @param {(quantity: number, totalCost: number) => void} onPurchase The divine command to execute on purchase.
     */
    show(powerUp, currentPerutas, onPurchase) {
        this.powerUp = powerUp;
        this.currentPerutas = currentPerutas;
        this.onPurchaseCallback = onPurchase;

        this.elements.title.textContent = `Purchase ${powerUp.name}`;
        this.elements.desc.textContent = `Select how many ${powerUp.unitName}s to buy.`;
        
        const max = powerUp.max_purchase || 100;
        this.elements.slider.max = max;
        this.elements.input.max = max;
        
        this.update(1); // Start with a quantity of 1
        toggleModal(true, 'purchase-modal');
    }

    /**
     * Closes the altar.
     */
    hide() {
        toggleModal(false, 'purchase-modal');
    }
    
    /**
     * Executes the purchase command.
     */
    purchase() {
        const quantity = parseInt(this.elements.input.value, 10);
        const totalCost = this.powerUp.cost * quantity;
        this.onPurchaseCallback(quantity, totalCost);
        this.hide();
    }
    
    increment() {
        this.update(parseInt(this.elements.input.value, 10) + 1);
    }

    decrement() {
        this.update(parseInt(this.elements.input.value, 10) - 1);
    }
}