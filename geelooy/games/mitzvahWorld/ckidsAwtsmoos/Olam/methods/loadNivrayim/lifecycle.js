
/**
 * @module lifecycle
 * @description
 * B"H
 * 🌌 THE CYCLE OF SUMMONING (BRIYAH) 🌌
 */

const HEESCHEEL_TIMEOUT_MS = 25_000;
const LOADING_RANGE_START = 50;
const LOADING_RANGE_END   = 100;

export default {
    async runHeescheel(nivrayimMade) {
        const total = nivrayimMade.length;
        for (let i = 0; i < total; i++) {
            const nivra = nivrayimMade[i];
            const label = `${nivra.name || nivra.constructor?.name || 'Unknown'}`;
            if (nivra.heescheel && typeof nivra.heescheel === 'function') {
                try {
                    // B"H: Defensive check for materialGenerator readiness
                    if (this.materialGenerator && !this.materialGenerator.olam) {
                        this.materialGenerator.olam = this;
                    }
                    
                    await _withTimeout(
                        nivra.heescheel(this, { nivrayimMade }),
                        HEESCHEEL_TIMEOUT_MS,
                        label
                    );
                } catch (e) {
                    if (e instanceof HeescheelTimeoutError) {
                        console.warn(`B"H - ⏱️ [heescheel] STALL DETECTED: ${label} took over ${HEESCHEEL_TIMEOUT_MS/1000}s.`);
                    } else {
                        console.error(`B"H - 🚨 [heescheel] ERROR in ${label}:`, e);
                    }
                }
            }

            const bandFraction = (i + 1) / total;
            const absolutePercent = LOADING_RANGE_START + (bandFraction * (LOADING_RANGE_END - LOADING_RANGE_START));

            this.ayshPeula("increase loading percentage", {
                amount: absolutePercent,
                reset: true,
                nivra,
                action: `Elevating: ${label}`
            });
        }
    },

    async runMadeAll(nivrayimMade) {
        for (const nivra of nivrayimMade) {
            if (nivra.madeAll) await nivra.madeAll(this);
        }
    },

    async runReady(nivrayimMade) {
        for (const nivra of nivrayimMade) {
            if (nivra.ready) await nivra.ready();
        }
    },

    async runAfterBriyah(nivrayimMade) {
        for (const nivra of nivrayimMade) {
            if (nivra.afterBriyah) await nivra.afterBriyah();
        }
    }
};

class HeescheelTimeoutError extends Error {
    constructor(label, ms) {
        super(`B"H - HeescheelTimeout: "${label}" exceeded ${ms}ms.`);
        this.name = 'HeescheelTimeoutError';
    }
}

function _withTimeout(promise, ms, label) {
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new HeescheelTimeoutError(label, ms));
        }, ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutHandle);
    });
}
