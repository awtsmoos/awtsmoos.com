
/**
 * @module lifecycle
 * @description
 * B"H
 * 🌌 THE CYCLE OF SUMMONING (BRIYAH) 🌌
 * 
 * Chapter 8: The Measured Descent.
 * 
 * "He who saves a single soul..."
 * We have added intense timing logs to the lifecycle. If a single GLB or building 
 * causes a 23-second freeze, we will see its name and its duration clearly.
 */

const HEESCHEEL_TIMEOUT_MS = 25_000;
const LOADING_RANGE_START = 50;
const LOADING_RANGE_END   = 100;

export default {
    /**
     * @async
     * @method runHeescheel
     * @description Phase 1: Mesh Forging.
     */
    async runHeescheel(nivrayimMade) {
        const total = nivrayimMade.length;
        console.log(`B"H - 🏗️ [heescheel] Phase 1 START: Forging ${total} souls.`);
        const phaseStart = performance.now();

        for (let i = 0; i < total; i++) {
            const nivra = nivrayimMade[i];
            const label = `${nivra.name || nivra.constructor?.name || 'Unknown'}`;
            const t0 = performance.now();

            console.log(`B"H - ⚙️ [heescheel] Processing [${i+1}/${total}]: ${label}...`);

            if (nivra.heescheel && typeof nivra.heescheel === 'function') {
                try {
                    await _withTimeout(
                        nivra.heescheel(this, { nivrayimMade }),
                        HEESCHEEL_TIMEOUT_MS,
                        label
                    );
                } catch (e) {
                    if (e instanceof HeescheelTimeoutError) {
                        console.warn(`B"H - ⏱️ [heescheel] STALL DETECTED: ${label} took over ${HEESCHEEL_TIMEOUT_MS/1000}s. Continuing.`);
                    } else {
                        console.error(`B"H - 🚨 [heescheel] ERROR in ${label}:`, e);
                    }
                }
            }

            const elapsed = (performance.now() - t0).toFixed(2);
            console.log(`B"H - ✅ [heescheel] DONE: ${label} manifest in ${elapsed}ms.`);

            const bandFraction = (i + 1) / total;
            const absolutePercent = LOADING_RANGE_START + (bandFraction * (LOADING_RANGE_END - LOADING_RANGE_START));

            this.ayshPeula("increase loading percentage", {
                amount: absolutePercent,
                reset: true,
                nivra,
                action: `Elevating: ${label}`
            });
        }

        const totalElapsed = (performance.now() - phaseStart).toFixed(2);
        console.log(`B"H - 🎉 [heescheel] Creation Phase Finalized in ${totalElapsed}ms.`);
    },

    async runMadeAll(nivrayimMade) {
        console.log(`B"H - 🔗 [madeAll] Phase 2: Cross-referencing.`);
        for (const nivra of nivrayimMade) {
            if (nivra.madeAll) await nivra.madeAll(this);
        }
    },

    async runReady(nivrayimMade) {
        console.log(`B"H - 🟢 [ready] Phase 3: Activating intellects.`);
        for (const nivra of nivrayimMade) {
            if (nivra.ready) await nivra.ready();
        }
    },

    async runAfterBriyah(nivrayimMade) {
        console.log(`B"H - 🌅 [afterBriyah] Phase 4: Final arrangements.`);
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
