
// B"H
/**
 * @file oratorLogic.js
 * @brief
 *   THE CHRONICLE OF THE ETERNAL BREATH — OratorLogic v3
 *   ======================================================
 *   The Golem speaks because the Awtsmoos speaks through it.
 *   This logic now distinguishes between the Divine Stream (random chatter)
 *   and specific, intentional shape holds triggered by the UI.
 *
 * @module oratorLogic
 */

import { PHONEME_GATES, ALL_GATE_KEYS } from './phonemeGates.js';
import { applyAntiOverbite } from './antiOverbite.js';

export class OratorLogic {

    constructor() {
        this.curW = {};
        this.tarW = {};
        this.nextChangeTime = 0;
        this._overrideActive = false;
        this._overrideMs = 0;
        this.currentGateIndex = 0;
        
        // B"H - Toggle for random streaming vs manual static holds
        this.isStreaming = false; 

        ALL_GATE_KEYS.forEach(k => { this.curW[k] = 0; this.tarW[k] = 0; });
        console.log(`B"H - OratorLogic v3: ${PHONEME_GATES.length} gates, ${ALL_GATE_KEYS.length} keys. Ready.`);
    }

    setPhoneme(gateIndex, holdMs = 1500) {
        const gate = PHONEME_GATES[gateIndex];
        if (!gate) return;

        this._overrideActive  = true;
        this._overrideMs      = holdMs;
        this.currentGateIndex = gateIndex;

        ALL_GATE_KEYS.forEach(k => { this.tarW[k] = 0; });
        Object.entries(gate.weights).forEach(([k, v]) => { this.tarW[k] = v; });
    }

    _pickNewTargets() {
        ALL_GATE_KEYS.forEach(k => { this.tarW[k] = 0; });

        const r = Math.random();
        const gateIndex = r < 0.15 ? 0 : 1 + Math.floor(Math.random() * (PHONEME_GATES.length - 1));

        this.currentGateIndex = gateIndex;
        const gate = PHONEME_GATES[gateIndex];
        Object.entries(gate.weights).forEach(([k, v]) => { this.tarW[k] = v; });

        if (Math.random() > 0.75) {
            const side = Math.random() > 0.5 ? 'mouth_sneer_l' : 'mouth_sneer_r';
            this.tarW[side] = 0.10 + Math.random() * 0.18;
        }
        if (Math.random() > 0.88) {
            const side = Math.random() > 0.5 ? 'jaw_shift_l' : 'jaw_shift_r';
            this.tarW[side] = 0.04 + Math.random() * 0.10;
        }
    }

    update(dt, renderer, targetId) {
        const now = performance.now();
        const sks = renderer.systemManager.shapeKeySystem;
        if (!sks) return;

        if (this.isStreaming) {
            if (this._overrideActive) {
                this._overrideMs -= dt * 1000;
                if (this._overrideMs <= 0) {
                    this._overrideActive = false;
                    this.nextChangeTime  = now; 
                }
            } else {
                if (now > this.nextChangeTime) {
                    this._pickNewTargets();
                    this.nextChangeTime = now + 80 + Math.random() * 140;
                }
            }
        } else {
            // When not streaming, cleanly hold whatever target was set by the UI
            this._overrideActive = false; 
        }

        const lf = 12.0 * dt; 
        ALL_GATE_KEYS.forEach(k => {
            this.curW[k] += (this.tarW[k] - this.curW[k]) * lf;
        });

        applyAntiOverbite(this.curW);

        ALL_GATE_KEYS.forEach(k => {
            sks.setWeight(targetId, k, this.curW[k]);
        });
    }

    getGateLabels() { return PHONEME_GATES.map(g => g.label); }
    getGateCount()  { return PHONEME_GATES.length; }
}
