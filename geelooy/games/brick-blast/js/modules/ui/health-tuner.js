// B"H
import { toggleModal } from '../../ui.js';

export class HealthTuner {
    constructor(elements) {
        this.elements = elements.healthTuner;
        this.onSetCallback = () => {};
    }
    
    update(value) {
        const numValue = Math.max(1, Math.min(99999, parseInt(value, 10) || 1));
        this.elements.display.textContent = numValue;
        this.elements.slider.value = numValue;
        this.elements.input.value = numValue;
    }

    show(currentHealth, onSet) {
        this.onSetCallback = onSet;
        this.update(currentHealth);
        toggleModal(true, 'health-tuner-modal');
    }

    hide() {
        toggleModal(false, 'health-tuner-modal');
    }
    
    set() {
        const newHealth = parseInt(this.elements.input.value, 10);
        this.onSetCallback(newHealth);
        this.hide();
    }
    
    increment() {
        this.update(parseInt(this.elements.input.value, 10) + 1);
    }

    decrement() {
        this.update(parseInt(this.elements.input.value, 10) - 1);
    }
}