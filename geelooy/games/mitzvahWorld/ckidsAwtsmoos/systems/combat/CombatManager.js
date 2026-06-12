/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE ORCHESTRATOR OF HOLY WAR — CombatManager.js
 *   ──────────────────────────────────────────────────────────────────
 *
 *   📜 THE BALLAD OF THE SACRED BATTLE:
 *   The Chossid steps forth with blade held high,
 *   Hebrew letters blazing across the sky,
 *   Each swing a prayer, each shot a psalm,
 *   The Awtsmoos grants victory through the calm!
 *
 *   This manager coordinates:
 *   - Weapon equipping from inventory
 *   - Attack input handling (left click)
 *   - Projectile lifecycle
 *   - Health bar rendering for all enemies
 *   - Damage resolution and enemy death
 *
 *   @module CombatManager
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';
import HebrewProjectileSystem from './HebrewProjectileSystem.js';
import HealthBarSystem from './HealthBarSystem.js';
import CombatTargeting from './CombatTargeting.js';
import { WEAPON_REGISTRY } from './WeaponRegistry.js';

/**
 * B"H
 * @class CombatManager
 * @description The unified combat orchestrator for Mitzvah World.
 */
export default class CombatManager {
    /**
     * @param {Object} olam - The world engine instance.
     */
    constructor(olam) {
        this.olam = olam;
        this.projectiles = new HebrewProjectileSystem(olam);
        this.healthBars = new HealthBarSystem();
        this.targeting = new CombatTargeting(olam, target => this.onTargetChanged(target));

        /** @type {Object|null} Currently equipped weapon definition */
        this.equippedWeapon = null;

        /** @type {number} Cooldown tracker */
        this.lastAttackTime = 0;

        /** @type {Array} References to all active Mazzikim */
        this.enemies = [];

        /** @type {boolean} Whether combat has been initialized */
        this.initialized = false;
        this.lastUnitFrameAt = 0;
    }

    /**
     * B"H - Initializes the combat system after the world is ready.
     */
    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.equipWeapon('cherev_hakodesh', { silent: true });
        if (typeof document === "undefined") {
            return;
        }

        // B"H - Bind attack input
        this._onMouseDown = (e) => {
            if (e.button === 0) this.attack();
        };

        // B"H - We bind to the renderer's domElement or document
        const canvas = this.olam?.renderer?.domElement || document;
        canvas.addEventListener('mousedown', this._onMouseDown);

        // B"H - Keyboard weapon swap (1, 2, 3 keys)
        this._onKeyDown = (e) => {
            const weaponKeys = {
                '1': 'cherev_hakodesh',
                '2': 'keshes_haemes',
                '3': 'mateh_hatorah'
            };
            if (weaponKeys[e.key]) {
                this.equipWeapon(weaponKeys[e.key]);
            }
            if (e.code === 'KeyV') this.attack({ source: 'keyboard' });
        };
        document.addEventListener('keydown', this._onKeyDown);
    }

    /**
     * B"H - Equips a weapon by its registry ID.
     * @param {string} weaponId - Key from WEAPON_REGISTRY.
     */
    equipWeapon(weaponId, options = {}) {
        const def = WEAPON_REGISTRY[weaponId];
        if (!def) return;

        // B"H - Check if player has this weapon in inventory
        const player = this.player();
        if (player?.inventory) {
            const hasWeapon = player.inventory.items?.some(
                item => item?.id === weaponId
            );
            if (!hasWeapon && weaponId !== 'cherev_hakodesh' && Number(def.price || 0) > 0) {
                // Only allow equipping owned weapons (sword is default)
                if (this.olam && !options.silent) {
                    this.olam.ayshPeula("ui event", "toast", {
                        message: `B"H - You don't own the ${def.name}! Buy it from the Weaponsmith.`
                    });
                }
                return;
            }
        }

        this.equippedWeapon = def;
        if (this.olam && !options.silent) {
            this.olam.ayshPeula("ui event", "toast", {
                message: `B"H - Equipped: ${def.icon} ${def.name}`
            });
        }
    }

    /**
     * B"H - Fires the equipped weapon.
     */
    attack(options = {}) {
        if (!this.equippedWeapon) {
            // B"H - Default to fists (Hebrew Sword) if nothing equipped
            this.equippedWeapon = WEAPON_REGISTRY.cherev_hakodesh;
        }

        const player = this.player();
        if (!player?.mesh) return;
        const now = Date.now() / 1000;
        if (now - this.lastAttackTime < this.equippedWeapon.attackSpeed) return;
        this.lastAttackTime = now;
        const cost = Number(this.equippedWeapon.koachCost || 0);
        const currentKoach = Number(player.koach ?? player.maxKoach ?? 100);
        if (currentKoach < cost) {
            this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "LOW KOACH", color: "#70b7ff" });
            return;
        }
        player.koach = Math.max(0, currentKoach - cost);
        player.updateStatsUI?.();

        // B"H - Fire from player position in camera's forward direction
        const origin = player.mesh.position.clone();
        origin.y += 1.5; // Eye height

        let direction;
        if (this.olam.camera) {
            direction = new THREE.Vector3(0, 0, -1);
            direction.applyQuaternion(this.olam.camera.quaternion);
        } else {
            direction = new THREE.Vector3(0, 0, 1);
            direction.applyEuler(player.mesh.rotation);
        }

        direction = this.resolveAimDirection(origin, direction.normalize());
        this.projectiles.fire(this.equippedWeapon, origin, direction.normalize());
        if (!options.quiet) this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: this.equippedWeapon.projectile?.letter || "ATTACK", color: "#ffe680" });
    }

    /**
     * B"H - Soft-locks attacks toward nearby living enemies for smoother play.
     * @param {THREE.Vector3} origin - Shot origin.
     * @param {THREE.Vector3} fallback - Camera/player forward vector.
     * @returns {THREE.Vector3} Resolved aim.
     */
    resolveAimDirection(origin, fallback) {
        const selected = this.targeting.selected;
        if (selected?.mesh && selected.hp > 0 && !selected.isDead) {
            const direct = selected.mesh.position.clone().sub(origin);
            if (direct.length() <= (this.equippedWeapon?.range || 50)) return direct.normalize();
        }
        let best = null;
        let bestScore = Infinity;
        for (const enemy of this.enemies) {
            if (!enemy?.mesh || enemy.hp <= 0 || enemy.isDead) continue;
            const toEnemy = enemy.mesh.position.clone().sub(origin);
            const dist = toEnemy.length();
            if (dist <= 0.01 || dist > (this.equippedWeapon?.range || 50)) continue;
            const dir = toEnemy.clone().normalize();
            const angle = fallback.angleTo(dir);
            const score = angle * 28 + dist * 0.04;
            if (angle < 0.62 && score < bestScore) { best = dir; bestScore = score; }
        }
        return best || fallback;
    }

    /**
     * B"H - Registers a Mazik enemy into the combat system.
     * @param {Object} enemy - The Mazik entity.
     */
    registerEnemy(enemy) {
        if (!enemy) return;
        if (!this.enemies.includes(enemy)) this.enemies.push(enemy);
        this.healthBars.createBar(enemy);
    }

    /** @returns {object|null} Active player across legacy and current world names. */
    player() {
        return this.olam?.player || this.olam?.chossid || null;
    }

    /** @returns {"none"|"selected"|"confirmed"} Pointer selection result. */
    selectTargetFromPointer() {
        return this.targeting.selectFromPointer(this.enemies);
    }

    /** @param {object|null} target Newly selected enemy. */
    onTargetChanged(target) {
        this.healthBars.setSelected(target);
        this.emitUnitFrames(true);
        if (target) this.olam?.ayshPeula?.("ui event", "toast", { message: `B"H - Target: ${target.name}. Click again or press V to attack.` });
    }

    /** @returns {object} Current player and target HUD state. */
    unitFramePayload() {
        const player = this.player(), stats = player?.currentStats || {};
        const hp = Number(player?.hp ?? stats.health ?? 100), maxHp = Number(player?.maxHp ?? stats.maxHealth ?? stats.health ?? 100);
        const target = this.targeting.selected;
        return {
            player: { name: player?.displayName || "Chossid", hp, maxHp, koach: Number(player?.koach ?? 0), maxKoach: Number(player?.maxKoach ?? 100), level: Number(player?.level || 1) },
            target: target ? { name: target.name, species: target.def?.species || target.elementalType || "target", hp: Number(target.hp || 0), maxHp: Number(target.maxHp || 1), color: Number(target.def?.color || 0x9a6238) } : null
        };
    }

    /** @param {boolean} force Ignore cadence. */
    emitUnitFrames(force = false) {
        const now = performance.now();
        if (!force && now - this.lastUnitFrameAt < 100) return;
        this.lastUnitFrameAt = now;
        this.olam?.ayshPeula?.("ui event", "combatUnitFrames", this.unitFramePayload());
    }

    /**
     * B"H - Removes an enemy from combat targeting and UI.
     * @param {Object} enemy - Enemy to remove.
     */
    unregisterEnemy(enemy) {
        if (!enemy) return;
        if (this.targeting.selected === enemy) this.targeting.set(null);
        this.healthBars.removeBar(enemy.name);
        const i = this.enemies.indexOf(enemy);
        if (i >= 0) this.enemies.splice(i, 1);
    }

    /**
     * B"H - Main update loop. Called every frame from the world engine.
     * @param {number} dt - Delta time.
     */
    update(dt) {
        if (!this.initialized) return;
        this.targeting.update();
        const player = this.player();
        if (player && Number.isFinite(Number(player.maxKoach))) {
            player.koach = Math.min(Number(player.maxKoach), Number(player.koach || 0) + dt * 4);
        }
        this.emitUnitFrames();

        // B"H - Update projectiles and check collisions
        this.projectiles.update(dt, this.enemies);

        // B"H - Update health bars
        this.healthBars.update(this.olam?.camera);

        // B"H - Clean up dead enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy.hp !== undefined && enemy.hp <= 0) {
                this.healthBars.removeBar(enemy.name);
                // B"H - Award XP
                if (player && enemy.xpValue) {
                    if (player.gainXP) player.gainXP(enemy.xpValue);
                    else if (player.gainXp) player.gainXp(enemy.xpValue);
                    this.olam.ayshPeula("ui event", "toast", {
                        message: `B"H - ${enemy.name} refined! +${enemy.xpValue} XP`
                    });
                }
                this.enemies.splice(i, 1);
            }
        }
    }

    /**
     * B"H - Cleanup.
     */
    dispose() {
        this.projectiles.dispose();
        this.healthBars.dispose();
        this.targeting.dispose();
        if (typeof document !== "undefined") {
            const canvas = this.olam?.renderer?.domElement || document;
            canvas.removeEventListener('mousedown', this._onMouseDown);
            document.removeEventListener('keydown', this._onKeyDown);
        }
    }
}
