// B"H
/**
 * @module lifecycle
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE FOUR PHASES OF CREATION — BRIYAH LIFECYCLE (TIKKUN EDITION)              ║
 * ║                                                                                  ║
 * ║  "And there was evening and there was morning — one day." (Bereishis 1:5)      ║
 * ║                                                                                  ║
 * ║  BUGS FIXED IN THIS TIKKUN:                                                     ║
 * ║                                                                                  ║
 * ║  BUG 1 — THE STUCK LOADING SCREEN (GLB Timeout):                              ║
 * ║    Previously: if any entity's heescheel() hung (e.g. the Chossid GLB loading  ║
 * ║    from an external CDN that was slow or offline), the entire lifecycle         ║
 * ║    awaited forever. The progress bar reached 50% (after terrain) and stopped.   ║
 * ║    The loading screen stayed on-screen eternally.                               ║
 * ║                                                                                  ║
 * ║    Fix: each entity's heescheel() is wrapped in a Promise.race() with a        ║
 * ║    HEESCHEEL_TIMEOUT_MS timeout. If the entity takes too long, we log a        ║
 * ║    warning, mark it as timed-out, and CONTINUE. The world still loads.         ║
 * ║    A broken or slow model never holds the whole universe hostage.              ║
 * ║                                                                                  ║
 * ║  BUG 2 — PROGRESS BAR PERCENTAGES:                                             ║
 * ║    Previously: each entity sent amount=100/total (e.g. 50 for 2 entities).    ║
 * ║    The olam event listener ACCUMULATES these, so terrain→50%, chossid→100%.   ║
 * ║    This was actually correct, BUT the progress bar was also being used by      ║
 * ║    WorldHeescheel.js pre-loading (0–50% range) which caused a reset-then-jump.  ║
 * ║                                                                                  ║
 * ║    Fix: we now send ABSOLUTE percentages for each entity, with the range        ║
 * ║    mapped to 50–100% (leaving 0–50% for WorldHeescheel's pre-loading phase).   ║
 * ║    We use reset:true so the accumulator is bypassed and we set width directly.  ║
 * ║                                                                                  ║
 * ║  "Even in the deepest night, one candle dispels much darkness." (Tanya)        ║
 * ║  Even one timeout fix dispels an infinite loading screen.                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file lifecycle.js
 * @memberof loadNivrayim
 * @path ckidsAwtsmoos/Olam/methods/loadNivrayim/lifecycle.js
 */

/**
 * @constant {number} HEESCHEEL_TIMEOUT_MS
 * @description
 * Maximum milliseconds to wait for a single entity's heescheel() to resolve.
 *
 * Why 25 seconds?
 * — The Chossid GLB is ~several MB from an external CDN.
 * — On a slow connection or first load, 25s is generous but not forever.
 * — On cache hit, it loads in <500ms — well under the timeout.
 * — If it truly cannot load, we continue without it rather than hang forever.
 *
 * "He who saves a single soul, it is as if he saved an entire world." (Sanhedrin 37a)
 * He who timeouts a single stall, saves the entire loading screen.
 */
const HEESCHEEL_TIMEOUT_MS = 25_000;

/**
 * @constant {number} LOADING_RANGE_START
 * @constant {number} LOADING_RANGE_END
 * @description
 * The loading bar percentage range owned by the heescheel phase.
 * WorldHeescheel.js owns 0–50% for its pre-loading work.
 * This lifecycle owns 50–100% for the actual entity mesh creation.
 *
 * By splitting the range, the bar fills SMOOTHLY from left to right
 * without any resets or jumps. Each entity gets an equal slice of the 50-100 band.
 */
const LOADING_RANGE_START = 50;
const LOADING_RANGE_END   = 100;

export default {

    /**
     * @async
     * @method runHeescheel
     * @description
     * ══════════════════════════════════════════════════════════════════
     * PHASE 1 — MESH FORGING
     * ══════════════════════════════════════════════════════════════════
     *
     * Calls heescheel() on each entity in sequence.
     * Each entity creates its THREE.js mesh, loads textures/GLBs,
     * sets up physics, and adds itself to the scene.
     *
     * TIMEOUT PROTECTION:
     * Each entity gets HEESCHEEL_TIMEOUT_MS milliseconds to complete.
     * If it times out, we log a warning and move on.
     * The world continues. The Awtsmoos never waits on a broken vessel.
     *
     * PROGRESS BAR:
     * We send absolute percentage values in the 50-100% range.
     * The "increased percentage" event bridge in WorldHeescheel converts
     * these to the main thread's "increasedOlamLoading" message,
     * which updates bar.style.width directly.
     *
     * We use reset:true on each update so the olam accumulator is bypassed —
     * we are setting the absolute position of the progress bar, not adding to it.
     *
     * "And G-d finished His work on the seventh day." (Bereishis 2:2)
     * We finish our work even if some vessels are cracked.
     *
     * @param {Array} nivrayimMade - Array of instantiated entity objects.
     * @returns {Promise<void>}
     */
    async runHeescheel(nivrayimMade) {
        const total = nivrayimMade.length;
        console.log(
            `B"H - 🏗️ [heescheel] Phase 1 START: Forging ${total} entities. ` +
            `Timeout per entity: ${HEESCHEEL_TIMEOUT_MS}ms. Progress range: ${LOADING_RANGE_START}–${LOADING_RANGE_END}%`
        );
        const phaseStart = performance.now();

        for (let i = 0; i < total; i++) {
            const nivra = nivrayimMade[i];
            const label = `${nivra.name || nivra.constructor?.name || 'Unknown'} [${i + 1}/${total}]`;
            const t0 = performance.now();

            console.log(`B"H - ⚙️ [heescheel] START: ${label}`);

            // ── THE TIMEOUT RACE ────────────────────────────────────────────────
            if (nivra.heescheel && typeof nivra.heescheel === 'function') {
                try {
                    await _withTimeout(
                        nivra.heescheel(this, { nivrayimMade }),
                        HEESCHEEL_TIMEOUT_MS,
                        label
                    );
                } catch (e) {
                    if (e instanceof HeescheelTimeoutError) {
                        console.warn(
                            `B"H - ⏱️ [heescheel] TIMEOUT: ${label} exceeded ${HEESCHEEL_TIMEOUT_MS}ms. ` +
                            `Continuing without it. The world is larger than one vessel.`
                        );
                    } else {
                        console.error(`B"H - 🚨 [heescheel] CRASH in ${label}:`, e);
                    }
                }
            } else {
                console.warn(`B"H - ⚠️ [heescheel] No heescheel() on ${label} — skipping.`);
            }

            const elapsed = (performance.now() - t0).toFixed(1);
            console.log(`B"H - ✅ [heescheel] DONE: ${label} → ${elapsed}ms`);

            // ── ABSOLUTE PROGRESS BAR UPDATE ────────────────────────────────────
            // Map entity index to position in the LOADING_RANGE_START–LOADING_RANGE_END band.
            // After entity i (0-indexed), (i+1)/total of the band is complete.
            const bandFraction = (i + 1) / total;
            const absolutePercent = LOADING_RANGE_START + (bandFraction * (LOADING_RANGE_END - LOADING_RANGE_START));

            this.ayshPeula("increase loading percentage", {
                amount: absolutePercent,
                reset: true,        // ← CRITICAL: bypass accumulator, set absolute position
                nivra,
                action: `Forging Vessel: ${nivra.name || 'Unknown'}`
            });

            console.log(
                `B"H - 📊 [heescheel] Progress: ${absolutePercent.toFixed(1)}% ` +
                `(entity ${i + 1}/${total} in range ${LOADING_RANGE_START}–${LOADING_RANGE_END}%)`
            );
        }

        const totalElapsed = (performance.now() - phaseStart).toFixed(1);
        console.log(
            `B"H - 🎉 [heescheel] Phase 1 COMPLETE: All ${total} entities forged ` +
            `in ${totalElapsed}ms total. Progress bar at 100%.`
        );
    },

    /**
     * @async
     * @method runMadeAll
     * @description
     * ══════════════════════════════════════════════════════════════════
     * PHASE 2 — CROSS-REFERENCE
     * ══════════════════════════════════════════════════════════════════
     *
     * All meshes now exist in the scene.
     * Entities can look each other up, form relationships,
     * link portals to their destinations, etc.
     *
     * "And He brought them all before Adam to see what he would call them." (Bereishis 2:19)
     * In madeAll, each entity sees all others for the first time.
     *
     * @param {Array} nivrayimMade - Array of instantiated entity objects.
     * @returns {Promise<void>}
     */
    async runMadeAll(nivrayimMade) {
        const total = nivrayimMade.length;
        console.log(`B"H - 🔗 [madeAll] Phase 2 START: Cross-referencing ${total} entities.`);
        const t0 = performance.now();

        for (const nivra of nivrayimMade) {
            if (nivra.madeAll && typeof nivra.madeAll === 'function') {
                try {
                    await nivra.madeAll(this);
                } catch (e) {
                    console.error(`B"H - 🚨 [madeAll] CRASH in ${nivra.name || 'Unknown'}:`, e);
                }
            }
        }

        console.log(`B"H - ✅ [madeAll] Phase 2 DONE in ${(performance.now() - t0).toFixed(1)}ms.`);
    },

    /**
     * @async
     * @method runReady
     * @description
     * ══════════════════════════════════════════════════════════════════
     * PHASE 3 — FINAL ACTIVATION
     * ══════════════════════════════════════════════════════════════════
     *
     * The world is fully populated. Entities now fire up their
     * subscriptions, UI hooks, final positioning, camera targeting, etc.
     *
     * Any ready() that takes more than 50ms gets a warning logged —
     * it is likely blocking the game start signal.
     *
     * "And G-d saw all that He had made — and behold, it was VERY GOOD." (Bereishis 1:31)
     * The 'ready' phase is our moment of seeing.
     *
     * @param {Array} nivrayimMade - Array of instantiated entity objects.
     * @returns {Promise<void>}
     */
    async runReady(nivrayimMade) {
        const total = nivrayimMade.length;
        console.log(`B"H - 🟢 [ready] Phase 3 START: Activating ${total} entities.`);
        const t0 = performance.now();

        for (const nivra of nivrayimMade) {
            if (nivra.ready && typeof nivra.ready === 'function') {
                const label = nivra.name || nivra.constructor?.name || 'Unknown';
                const nt = performance.now();
                try {
                    await nivra.ready();
                } catch (e) {
                    console.error(`B"H - 🚨 [ready] CRASH in ${label}:`, e);
                }
                const elapsed = (performance.now() - nt).toFixed(1);
                if (parseFloat(elapsed) > 50) {
                    console.warn(`B"H - ⏱️ [ready] SLOW: ${label} took ${elapsed}ms — is it blocking game start?`);
                }
            }
        }

        console.log(`B"H - ✅ [ready] Phase 3 DONE in ${(performance.now() - t0).toFixed(1)}ms.`);
    },

    /**
     * @async
     * @method runAfterBriyah
     * @description
     * ══════════════════════════════════════════════════════════════════
     * PHASE 4 — POST-CREATION
     * ══════════════════════════════════════════════════════════════════
     *
     * The quietest phase. Cleanup, late subscriptions, optional effects.
     * Runs after the game-start signal has already been sent,
     * so the player can move while this phase completes in the background.
     *
     * "After the world was created, the details were arranged." —
     * afterBriyah is that arrangement.
     *
     * @param {Array} nivrayimMade - Array of instantiated entity objects.
     * @returns {Promise<void>}
     */
    async runAfterBriyah(nivrayimMade) {
        const total = nivrayimMade.length;
        console.log(`B"H - 🌅 [afterBriyah] Phase 4 START: Post-creation for ${total} entities.`);
        const t0 = performance.now();

        for (const nivra of nivrayimMade) {
            if (nivra.afterBriyah && typeof nivra.afterBriyah === 'function') {
                try {
                    await nivra.afterBriyah();
                } catch (e) {
                    console.error(`B"H - 🚨 [afterBriyah] CRASH in ${nivra.name || 'Unknown'}:`, e);
                }
            }
        }

        console.log(`B"H - ✅ [afterBriyah] Phase 4 DONE in ${(performance.now() - t0).toFixed(1)}ms.`);
    }
};

// ════════════════════════════════════════════════════════════════════════════
//  PRIVATE HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * @class HeescheelTimeoutError
 * @description
 * Sentinel error class thrown when an entity's heescheel() exceeds the timeout.
 * Using a named class (not a generic Error) lets the catch block distinguish
 * timeout errors from genuine crashes — important for diagnostics.
 *
 * "The vessel cracked, but the light still shines." — Kabbalah
 * A timeout is a cracked vessel. The light (the world) continues.
 */
class HeescheelTimeoutError extends Error {
    /**
     * @constructor
     * @param {string} label - The entity label that timed out.
     * @param {number} ms    - The timeout duration in milliseconds.
     */
    constructor(label, ms) {
        super(`B"H - HeescheelTimeout: "${label}" exceeded ${ms}ms.`);
        this.name = 'HeescheelTimeoutError';
        this.label = label;
        this.timeoutMs = ms;
    }
}

/**
 * @function _withTimeout
 * @description
 * Races a Promise against a timer. If the timer fires first,
 * the returned Promise rejects with a HeescheelTimeoutError.
 * If the original Promise resolves first, the timer is cleared.
 *
 * No memory leak: the timeout handle is always cleared after the race.
 * "And the fire shall not go out on the altar." (Vayikra 6:6) —
 * But THIS timeout fire DOES go out. Cleanly. Via clearTimeout.
 *
 * @param   {Promise}  promise  - The entity's heescheel() promise.
 * @param   {number}   ms       - Timeout in milliseconds.
 * @param   {string}   label    - Entity label for the error message.
 * @returns {Promise}           - Resolves to the original promise result OR
 *                                rejects with HeescheelTimeoutError.
 */
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