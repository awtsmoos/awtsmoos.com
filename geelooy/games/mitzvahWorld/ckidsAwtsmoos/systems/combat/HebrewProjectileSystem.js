/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE PROJECTILE MANIFESTOR — HebrewProjectileSystem.js
 *   ──────────────────────────────────────────────────────────────────
 *
 *   📜 CHAPTER: THE FLIGHT OF THE HOLY LETTERS
 *   When the Chossid swings his sword or draws his bow,
 *   The Hebrew letters burst forth from the weapon,
 *   Each letter a universe of light hurled at the forces of darkness.
 *
 *   The letters are created as TextGeometry sprites that fly through
 *   the 3D world, colliding with Mazzikim and dealing Torah-powered damage.
 *
 *   @module HebrewProjectileSystem
 *   @description Manages the lifecycle of Hebrew letter projectiles.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { getRandomLetter, getLetterByIndex } from './WeaponRegistry.js';

/**
 * B"H
 * @class HebrewProjectileSystem
 * @description Spawns, updates, and resolves Hebrew letter projectiles.
 */
export default class HebrewProjectileSystem {
    constructor(olam) {
        /** @type {import('../../Olam/olamDynamic.js').default} */
        this.olam = olam;

        /** @type {Array<Object>} Active projectiles in flight */
        this.projectiles = [];

        /** @type {THREE.Group} Container for all projectile meshes */
        this.projectileGroup = new THREE.Group();
        this.projectileGroup.name = "HebrewProjectiles";

        if (olam.scene) {
            olam.scene.add(this.projectileGroup);
        }
    }

    /**
     * B"H - Fires Hebrew letter projectiles from the player.
     * @param {Object} weaponDef - The weapon definition from WeaponRegistry.
     * @param {THREE.Vector3} origin - The world position to fire from.
     * @param {THREE.Vector3} direction - The normalized direction of fire.
     */
    fire(weaponDef, origin, direction) {
        if (!weaponDef || !weaponDef.projectile) return;

        const proj = weaponDef.projectile;
        const burstCount = proj.burst || 1;

        for (let i = 0; i < burstCount; i++) {
            const letter = proj.letter === "ALL"
                ? getLetterByIndex(i)
                : (burstCount > 1 ? getRandomLetter() : proj.letter);

            // B"H - Create the letter mesh using canvas texture
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 128, 128);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 96px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter, 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({
                map: texture,
                color: new THREE.Color(proj.color),
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const sprite = new THREE.Sprite(material);
            sprite.scale.set(proj.size, proj.size, proj.size);
            sprite.position.copy(origin);

            // B"H - Apply spread for burst weapons
            const dir = direction.clone();
            if (proj.spread > 0) {
                const spreadAngle = (Math.random() - 0.5) * proj.spread;
                const axis = new THREE.Vector3(0, 1, 0);
                dir.applyAxisAngle(axis, spreadAngle);
                // Also slight vertical spread
                const vertSpread = (Math.random() - 0.5) * proj.spread * 0.3;
                const horizAxis = new THREE.Vector3().crossVectors(dir, axis).normalize();
                if (horizAxis.length() > 0.01) {
                    dir.applyAxisAngle(horizAxis, vertSpread);
                }
            }

            this.projectileGroup.add(sprite);

            this.projectiles.push({
                mesh: sprite,
                velocity: dir.multiplyScalar(proj.speed),
                damage: weaponDef.damage,
                lifetime: proj.lifetime,
                age: 0,
                letter: letter
            });
        }
    }

    /**
     * B"H - Updates all projectiles. Called every frame.
     * @param {number} dt - Delta time in seconds.
     * @param {Array} enemies - Array of entities that can be hit.
     */
    update(dt, enemies = []) {
        const toRemove = [];

        for (let i = 0; i < this.projectiles.length; i++) {
            const p = this.projectiles[i];
            p.age += dt;

            if (p.age >= p.lifetime) {
                toRemove.push(i);
                continue;
            }

            // B"H - Move the letter through the world
            p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));

            // B"H - Fade out near end of life
            const lifeRatio = p.age / p.lifetime;
            p.mesh.material.opacity = 1.0 - (lifeRatio * lifeRatio);

            // B"H - Pulsating glow effect
            const pulse = 1.0 + Math.sin(p.age * 15) * 0.2;
            p.mesh.scale.set(
                p.mesh.scale.x * pulse / (p.mesh._lastPulse || 1),
                p.mesh.scale.y * pulse / (p.mesh._lastPulse || 1),
                1
            );
            p.mesh._lastPulse = pulse;

            // B"H - Collision detection against enemies
            for (const enemy of enemies) {
                if (!enemy || !enemy.mesh || !enemy.isReady) continue;
                if (enemy.hp <= 0) continue;

                const dist = p.mesh.position.distanceTo(enemy.mesh.position);
                if (dist < 2.0) {
                    // HIT!
                    if (enemy.takeDamage) {
                        enemy.takeDamage(p.damage);
                    }

                    // B"H - Spawn hit flash
                    this._spawnHitEffect(p.mesh.position.clone(), p.letter);

                    toRemove.push(i);
                    break;
                }
            }
        }

        // B"H - Remove expired/hit projectiles (reverse order)
        for (let i = toRemove.length - 1; i >= 0; i--) {
            const idx = toRemove[i];
            const p = this.projectiles[idx];
            if (p && p.mesh) {
                this.projectileGroup.remove(p.mesh);
                p.mesh.material.dispose();
                p.mesh.material.map?.dispose();
            }
            this.projectiles.splice(idx, 1);
        }
    }

    /**
     * B"H - Creates a brief flash of the letter at the hit point.
     * @param {THREE.Vector3} position
     * @param {string} letter
     */
    _spawnHitEffect(position, letter) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff0';
        ctx.font = 'bold 48px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, 32, 32);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({
            map: tex, transparent: true,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const sprite = new THREE.Sprite(mat);
        sprite.position.copy(position);
        sprite.scale.set(1.5, 1.5, 1.5);
        this.projectileGroup.add(sprite);

        // B"H - Auto-remove after flash
        let age = 0;
        const flashUpdate = () => {
            age += 0.016;
            sprite.scale.multiplyScalar(1.05);
            mat.opacity = Math.max(0, 1.0 - age * 4);
            if (age > 0.3) {
                this.projectileGroup.remove(sprite);
                mat.dispose();
                tex.dispose();
            } else {
                requestAnimationFrame(flashUpdate);
            }
        };
        requestAnimationFrame(flashUpdate);
    }

    /**
     * B"H - Cleanup all projectiles.
     */
    dispose() {
        for (const p of this.projectiles) {
            if (p.mesh) {
                this.projectileGroup.remove(p.mesh);
                p.mesh.material.dispose();
                p.mesh.material.map?.dispose();
            }
        }
        this.projectiles = [];
    }
}
