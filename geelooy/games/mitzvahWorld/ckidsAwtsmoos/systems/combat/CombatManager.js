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

        /** @type {Object|null} Currently equipped weapon definition */
        this.equippedWeapon = null;

        /** @type {number} Cooldown tracker */
        this.lastAttackTime = 0;

        /** @type {Array} References to all active Mazzikim */
        this.enemies = [];

        /** @type {boolean} Whether combat has been initialized */
        this.initialized = false;
    }

    /**
     * B"H - Initializes the combat system after the world is ready.
     */
    init() {
        if (this.initialized) return;
        if (typeof document === "undefined") {
            return;
        }
        this.initialized = true;

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
        };
        document.addEventListener('keydown', this._onKeyDown);
    }

    /**
     * B"H - Equips a weapon by its registry ID.
     * @param {string} weaponId - Key from WEAPON_REGISTRY.
     */
    equipWeapon(weaponId) {
        const def = WEAPON_REGISTRY[weaponId];
        if (!def) return;

        // B"H - Check if player has this weapon in inventory
        const player = this.olam?.player;
        if (player?.inventory) {
            const hasWeapon = player.inventory.items?.some(
                item => item?.id === weaponId
            );
            if (!hasWeapon && weaponId !== 'cherev_hakodesh') {
                // Only allow equipping owned weapons (sword is default)
                if (this.olam) {
                    this.olam.ayshPeula("ui event", "toast", {
                        message: `B"H - You don't own the ${def.name}! Buy it from the Weaponsmith.`
                    });
                }
                return;
            }
        }

        this.equippedWeapon = def;
        if (this.olam) {
            this.olam.ayshPeula("ui event", "toast", {
                message: `B"H - Equipped: ${def.icon} ${def.name}`
            });
        }
    }

    /**
     * B"H - Fires the equipped weapon.
     */
    attack() {
        if (!this.equippedWeapon) {
            // B"H - Default to fists (Hebrew Sword) if nothing equipped
            this.equippedWeapon = WEAPON_REGISTRY.cherev_hakodesh;
        }

        const now = Date.now() / 1000;
        if (now - this.lastAttackTime < this.equippedWeapon.attackSpeed) return;
        this.lastAttackTime = now;

        const player = this.olam?.player;
        if (!player?.mesh) return;

        // B"H - Fire from player position in camera's forward direction
        const origin = player.mesh.position.clone();
        origin.y += 1.5; // Eye height

        let direction;
        if (this.olam.camera) {
            direction = new THREE.Vector3(0, 0, -1);
            direction.applyQuaternion(this.olam.camera.quaternion);
        } else {
            direction = new THREE.Vector3(0, 0, -1);
            direction.applyEuler(player.mesh.rotation);
        }

        this.projectiles.fire(this.equippedWeapon, origin, direction.normalize());
    }

    /**
     * B"H - Registers a Mazik enemy into the combat system.
     * @param {Object} enemy - The Mazik entity.
     */
    registerEnemy(enemy) {
        if (!enemy) return;
        this.enemies.push(enemy);
        this.healthBars.createBar(enemy);
    }

    /**
     * B"H - Main update loop. Called every frame from the world engine.
     * @param {number} dt - Delta time.
     */
    update(dt) {
        if (!this.initialized) return;

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
                if (this.olam?.player && enemy.xpValue) {
                    if (this.olam.player.gainXP) {
                        this.olam.player.gainXP(enemy.xpValue);
                    }
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
        if (typeof document !== "undefined") {
            const canvas = this.olam?.renderer?.domElement || document;
            canvas.removeEventListener('mousedown', this._onMouseDown);
            document.removeEventListener('keydown', this._onKeyDown);
        }
    }
}
