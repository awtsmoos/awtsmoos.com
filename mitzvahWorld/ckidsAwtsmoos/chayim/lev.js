
//B"H
/**
 * Lev - The seat of emotions (Joy and Anger).
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class Lev {
    constructor(owner) {
        this.owner = owner;
        this.simcha = 0.5; // Joy (0 to 1)
        this.kaas = 0.0;   // Anger (0 to 1)
        this.baseline = { simcha: 0.5, kaas: 0.0 };
    }

    update(dt) {
        // Return to baseline over time (Emotional equilibrium)
        this.simcha = THREE.MathUtils.lerp(this.simcha, this.baseline.simcha, 0.05 * dt);
        this.kaas = THREE.MathUtils.lerp(this.kaas, this.baseline.kaas, 0.05 * dt);
        
        // Behavioral triggers
        if (this.simcha > 0.9 && Math.random() < 0.01) {
            this.owner.playChaweeyoos("dance silly");
        }
        if (this.kaas > 0.8 && Math.random() < 0.01) {
             this.owner.ayshPeula("ui event", "effectsOverlay", { text: `${this.owner.name} is annoyed!`, color: "red" });
        }
    }

    react(type, intensity = 0.2) {
        if (type === 'GIFT') {
            this.simcha = Math.min(1, this.simcha + intensity);
            this.kaas = Math.max(0, this.kaas - intensity);
        } else if (type === 'INSULT' || type === 'THEFT') {
            this.kaas = Math.min(1, this.kaas + intensity);
            this.simcha = Math.max(0, this.simcha - intensity);
        }
    }
}
