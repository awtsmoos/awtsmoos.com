// B"H
/**
 * @file heesHawvoos.js
 * @description Stable world heartbeat. Restores the old working physics/render order:
 * system update -> octree focus update -> entity update -> camera update -> render.
 */
import UniversePulsator from '../oyved/UniversePulsator.js';

const FOCUS_MOVING_EPSILON_SQ = 0.0001;

/**
 * B"H
 * Keeps the octree's attention on the player and on genuinely moving souls.
 * Static NPCs can still animate, glow, and speak, but they do not become
 * collision-streaming foci every frame.
 *
 * @param {object} nivra
 * World entity being considered as a focus.
 *
 * @param {object} self
 * Olam instance.
 *
 * @returns {boolean}
 * True when this entity should drive octree LOD updates.
 */
function shouldDriveOctreeFocus(nivra, self) {
    if (!nivra) return false;
    if (nivra === self.chossid || nivra === self.player || nivra.type === "chossid") return true;

    const moving = nivra.moving || {};
    const hasIntent = !!(
        moving.forward ||
        moving.backward ||
        moving.stridingLeft ||
        moving.stridingRight ||
        moving.turningLeft ||
        moving.turningRight ||
        moving.jump ||
        nivra.movingAutomatically ||
        nivra.navTarget ||
        nivra.currentPath ||
        nivra._isMoving
    );

    return hasIntent || ((nivra.velocity?.lengthSq?.() || 0) > FOCUS_MOVING_EPSILON_SQ);
}

export default class HeesHawvoosManager {
    async heesHawvoos() {
        const self = this;
        let confirmedGaze = false;
        let loopCounter = 0;
        let vanityPurged = false;

        this.updateStep = (dt) => {
            loopCounter++;
            const shouldLog = loopCounter <= 3 || (loopCounter % 1000 === 0);

            try {
                if (self.shlichusHandler) self.shlichusHandler.update(dt);
                if (self.environment) self.environment.update(dt);
                if (self.placementManager) self.placementManager.update(dt);
            } catch (e) {
                if (shouldLog) console.error('B"H - [HeesHawvoos] system update failed:', e);
            }

            // B"H: old stable flow. The octree follows all ready living foci.
            try {
                if (self.worldOctree) {
                    const foci = [];

                    if (self.chossid?.mesh?.position && self.chossid?.velocity) {
                        foci.push({ position: self.chossid.mesh.position, velocity: self.chossid.velocity });
                    } else if (self.player?.mesh?.position && self.player?.velocity) {
                        foci.push({ position: self.player.mesh.position, velocity: self.player.velocity });
                    }

                    if (self.nivrayim) {
                        for (const n of self.nivrayim) {
                            if (n !== self.chossid && n !== self.player && n?.velocity && n?.mesh?.position && n?.onFloor !== undefined && n?.isReady && shouldDriveOctreeFocus(n, self)) {
                                foci.push({ position: n.mesh.position, velocity: n.velocity });
                            }
                        }
                    }

                    if (foci.length > 0) self.worldOctree.update(foci, null);
                }
            } catch (e) {
                if (shouldLog) console.error('B"H - [HeesHawvoos] octree update failed:', e);
            }

            try {
                const len = self.nivrayim ? self.nivrayim.length : 0;
                for (let i = 0; i < len; i++) {
                    const nivra = self.nivrayim[i];
                    if (nivra?.isReady && nivra?.heesHawveh && typeof nivra.heesHawvoos === 'function') {
                        try {
                            nivra.heesHawvoos(dt);
                        } catch (err) {
                            if (loopCounter <= 50) console.warn('B"H - [Entity Loop]:', err);
                        }
                    }
                }
            } catch (e) {
                if (shouldLog) console.error('B"H - [HeesHawvoos] entity loop failed:', e);
            }

            try {
                if (self.combatManager) self.combatManager.update(dt);
            } catch (e) {
                if (shouldLog) console.error('B"H - [HeesHawvoos] combat update failed:', e);
            }

            try {
                if (self.ayin?.update) self.ayin.update(dt);
            } catch (e) {
                if (shouldLog) console.error('B"H - [HeesHawvoos] camera update failed:', e);
            }

            if (!vanityPurged && self.scene) {
                vanityPurged = true;
                self.scene.traverse(node => {
                    if (node.isPoints || node.isLine || node.type === 'Points' || node.type === 'LineSegments') {
                        node.visible = false;
                        node.renderOrder = -1;
                    }
                });
            }

            if (self.renderer && self.scene) {
                const activeEye = self.activeCamera || self.ayin?.camera || null;
                if (activeEye) {
                    try {
                        if (typeof self.renderer.renderAsync === 'function') {
                            self.renderer.renderAsync(self.scene, activeEye);
                        } else {
                            self.renderer.render(self.scene, activeEye);
                        }

                        if (!confirmedGaze && loopCounter > 3) {
                            confirmedGaze = true;
                            if (self.ayshPeula) self.ayshPeula('rendered first time');
                        }
                    } catch (renderErr) {
                        if (loopCounter % 500 === 0) console.error('B"H - [HeesHawvoos] render failed:', renderErr);
                    }
                }
            }
        };

        this.pulsator = new UniversePulsator(this);
        this.pulsator.ignite();
    }
}
