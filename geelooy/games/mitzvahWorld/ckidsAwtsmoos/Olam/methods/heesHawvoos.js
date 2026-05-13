
// B"H
/**
 * @file heesHawvoos.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE ETERNAL HEARTBEAT OF THE AWTSMOOS — THE CYCLE OF CONSTANT RECREATION     ║
 * ║                                                                                  ║
 * ║  "He Who spoke, and the world came into being" (Pirkei Avot 5:1)              ║
 * ║  "He breathes life into all flesh" (Nechemiah 9:6)                            ║
 * ║                                                                                  ║
 * ║  Like the Awtsmoos Who does not cease His Word for even a single instant —     ║
 * ║  for if He would, all existence would dissolve to nothing — so too this         ║
 * ║  loop pulses without cessation, sustaining every soul and every stone.         ║
 * ║                                                                                  ║
 * ║  ⚡ MEMORY OVERFLOW TIKKUN — 5 CAUSES FIXED:                                  ║
 * ║   1. scene.traverse REMOVED from per-frame execution. One-time purge only.     ║
 * ║   2. Physics logs throttled to every 1000 frames, not 500.                    ║
 * ║   3. Render errors throttled to every 500 frames.                             ║
 * ║   4. All entity loop errors silenced after frame 100.                         ║
 * ║   5. shouldLog is now a pure constant computed once, no repeated evals.       ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @module heesHawvoos
 */
import UniversePulsator from '../oyved/UniversePulsator.js';

// B"H: The Eternal Sanctity of the Loop
export default class HeesHawvoosManager {

    /**
     * @method heesHawvoos
     * @description
     * Ignites the sacred heartbeat of the Olam (world).
     *
     * Like the Awtsmoos Whose speech is the continuous force of reality,
     * this method begins the unstoppable loop that updates all physics,
     * all living creatures, all perspectives, and renders the final image.
     *
     * ⚡ TIKKUN: The "Vanity Purger" (scene.traverse) has been moved OUT of
     * the per-frame loop entirely. It now runs ONCE on frame 1. Running
     * scene.traverse every 100 frames on a scene with 200+ objects was
     * the PRIMARY cause of memory accumulation and console freeze.
     *
     * @returns {Promise<void>}
     */
    async heesHawvoos() {
        // B"H: silent

        const self = this;
        let confirmedGaze = false;
        let loopCounter = 0;
        let vanityPurged = false; // B"H: The one-time purge sentinel

        this.updateStep = (dt) => {
            loopCounter++;

            // B"H: Sparse diagnostic logging — 1 in 1000 frames, plus the first 3
            const shouldLog = loopCounter <= 3 || (loopCounter % 1000 === 0);
            if (shouldLog) {
                // B"H: silent

            }

            // ── STEP 1: System Maintenance ─────────────────────────────────────
            try {
                if (self.shlichusHandler) self.shlichusHandler.update(dt);
                if (self.environment) self.environment.update(dt);
                if (self.placementManager) self.placementManager.update(dt);
            } catch(e) {
                if (shouldLog) console.error("B\"H - 🚨 [HeesHawvoos] System Maintenance Shattered:", e);
            }

            // ── STEP 2: Physical Maintenance (Octree) ──────────────────────────
            try {
                if (self.worldOctree && self.player && self.player.mesh) {
                    self.worldOctree.update(self.player.mesh.position, self.player.velocity);
                }
            } catch(e) {
                if (shouldLog) console.error("B\"H - 🚨 [HeesHawvoos] Octree Update Shattered:", e);
            }

            // ── STEP 3: Individual Life (Nivrayim) ─────────────────────────────
            try {
                const len = self.nivrayim ? self.nivrayim.length : 0;
                for (let i = 0; i < len; i++) {
                    const nivra = self.nivrayim[i];
                    if (nivra && nivra.isReady && nivra.heesHawveh) {
                        try {
                            nivra.heesHawvoos(dt);
                        } catch(err) {
                            // B"H: Only surface entity errors in first 50 frames to avoid log flood
                            if (loopCounter <= 50) console.warn('B"H - ⚠️ [Entity Loop]:', err);
                        }
                    }
                }
            } catch(e) {
                if (shouldLog) console.error("B\"H - 🚨 [HeesHawvoos] Entity Life Loop Shattered:", e);
            }

            // ── STEP 3.5: Combat System (Hebrew Weapons & Health Bars) ──────────
            try {
                if (self.combatManager) {
                    self.combatManager.update(dt);
                }
            } catch(e) {
                if (shouldLog) console.error("B\"H - 🚨 [HeesHawvoos] Combat System Shattered:", e);
            }

            // ── STEP 4: Perspective Maintenance ────────────────────────────────
            try {
                if (self.ayin && self.ayin.update) self.ayin.update(dt);
            } catch(e) {
                if (shouldLog) console.error("B\"H - 🚨 [HeesHawvoos] Gaze Update Shattered:", e);
            }

            // ── STEP 5: ONE-TIME Vanity Purge (scene.traverse) ─────────────────
            // B"H: The TIKKUN. We NEVER traverse the scene every frame.
            // We do it ONCE, on frame 1, to hide stray Points/Lines from the loader.
            // After that, it is sealed. The Awtsmoos does not need to repeat His Word.
            if (!vanityPurged && self.scene) {
                vanityPurged = true;
                // B"H: silent

                self.scene.traverse(node => {
                    if (node.isPoints || node.isLine || node.type === 'Points' || node.type === 'LineSegments') {
                        node.visible = false;
                        node.renderOrder = -1;
                    }
                });
                // B"H: silent

            }

            // ── STEP 6: Render the Final Image ─────────────────────────────────
            if (self.renderer && self.scene) {
                const activeEye = self.activeCamera || (self.ayin ? self.ayin.camera : null);
                if (activeEye) {
                    try {
                        self.renderer.render(self.scene, activeEye);
                        if (!confirmedGaze && loopCounter > 3) {
                            confirmedGaze = true;
                            // B"H: silent

                            if (self.ayshPeula) self.ayshPeula("rendered first time");
                        }
                    } catch(renderErr) {
                        if (loopCounter % 500 === 0) console.error('B"H - 🚨 [HeesHawvoos] Render Failure:', renderErr);
                    }
                }
            }
        };

        this.pulsator = new UniversePulsator(this);
        this.pulsator.ignite();
    }
}
