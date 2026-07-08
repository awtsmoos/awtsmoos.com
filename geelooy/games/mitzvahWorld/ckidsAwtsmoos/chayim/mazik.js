// B"H
/**
 * Mazik - A force of chaos/challenge in the Olam.
 * Uses procedural spiky geometry.
 * 
 * 📜 THE PSALM OF THE KLIPAH:
 * From the husks of unrectified worlds they rise,
 * Spiky vessels of chaos beneath the skies,
 * But every swing of the Hebrew blade,
 * Refines the sparks in the darkness arrayed!
 */
import Medabeir from "./medabeir/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Mazik extends Medabeir {
    type = "mazik";
    
    constructor(options, olam) {
        // B"H - Read stats from data manifest
        options.maxHp = options.maxHp || 50;
        options.speed = options.speed || 40;
        
        super(options, olam);
        
        /** @type {number} Current health points */
        this.hp = options.maxHp;
        /** @type {number} Maximum health points */
        this.maxHp = options.maxHp;
        /** @type {number} XP awarded on death */
        this.xpValue = options.xpValue || 50;
        /** @type {number} Damage dealt per attack */
        this.damage = options.damage || 10;
        /** @type {number} Melee attack range */
        this.attackRange = options.attackRange || 2.5;
        /** @type {number} Detection range for aggro */
        this.aggroRange = options.aggroRange || 15.0;
        /** @type {number} Timestamp of last attack */
        this.lastAttackTime = 0;
        /** @type {number} Seconds between attacks */
        this.attackCooldown = 1.5;
        /** @type {boolean} Whether this Mazik is alive */
        this.isDead = false;
        
        if (this.name.startsWith("nivra")) {
            this.name = (options.name || "Mazik") + " " + Math.floor(Math.random() * 100);
        }
    }
    
    async heescheel(olam) {
        if (!this.options.golem && !this.options.path) {
            const geo = new THREE.IcosahedronGeometry(0.5, 1);
            const pos = geo.attributes.position;
            
            // B"H - Spike the geometry for menacing appearance
            for (let i = 0; i < pos.count; i++) {
                if (i % 3 === 0) {
                    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
                    v.multiplyScalar(1.5);
                    pos.setXYZ(i, v.x, v.y, v.z);
                }
            }
            geo.computeVertexNormals();
            
            // B"H - Color from options data
            const colorVal = this.options.color || 0x550000;
            const mat = new THREE.MeshStandardMaterial({ 
                color: colorVal, roughness: 0.8, 
                emissive: colorVal, emissiveIntensity: 0.2
            });
            this.mesh = new THREE.Mesh(geo, mat);
            this.mesh.name = this.name;
            this.mesh.castShadow = true;
            
            if (this.options.position) {
                this.mesh.position.set(
                    this.options.position.x || 0,
                    this.options.position.y || 1.5,
                    this.options.position.z || 0
                );
            }
            
            this.mesh.userData.isSolid = true;
            if (this.olam?.worldOctree) {
                this.olam.worldOctree.addObject(this.mesh);
            }
            this.nivrayimGroup.add(this.mesh);
            this.isReady = true;

            // B"H - Register with CombatManager if available
            if (this.olam?.combatManager) {
                this.olam.combatManager.registerEnemy(this);
            }
        } else {
            await super.heescheel(olam);
        }
    }
    
    /**
     * B"H - Takes damage and checks for death.
     * @param {number} amount - Damage to take.
     */
    takeDamage(amount) {
        if (this.isDead) return;
        this.hp = Math.max(0, this.hp - amount);
        
        // B"H - Flash red on hit
        if (this.mesh?.material) {
            const originalEmissive = this.mesh.material.emissive?.clone();
            this.mesh.material.emissive?.set(0xff0000);
            setTimeout(() => {
                if (this.mesh?.material?.emissive && originalEmissive) {
                    this.mesh.material.emissive.copy(originalEmissive);
                }
            }, 100);
        }
        
        if (this.hp <= 0) {
            this._onDeath();
        }
    }
    
    /**
     * B"H - Called when the Mazik is refined (killed).
     */
    _onDeath() {
        this.isDead = true;
        
        // B"H - Death animation: shrink and fade
        const deathAnim = () => {
            if (!this.mesh) return;
            this.mesh.scale.multiplyScalar(0.9);
            this.mesh.material.opacity -= 0.05;
            this.mesh.material.transparent = true;
            
            if (this.mesh.scale.x > 0.1) {
                requestAnimationFrame(deathAnim);
            } else {
                // B"H - Remove from scene
                if (this.mesh.parent) {
                    this.mesh.parent.remove(this.mesh);
                }
                this.mesh.geometry?.dispose();
                this.mesh.material?.dispose();
            }
        };
        requestAnimationFrame(deathAnim);
    }
    
    heesHawvoos(dt) {
        if (this.isDead) return;
        super.heesHawvoos(dt);
        
        if (!this.olam?.player || !this.isReady) return;
        
        const player = this.olam.player;
        if (!player.mesh) return;
        const dist = this.mesh.position.distanceTo(player.mesh.position);
        
        if (dist < this.aggroRange) {
            if (dist > this.attackRange) {
                this.moving.forward = true;
                this.mesh.lookAt(player.mesh.position);
                this.rotation.y = this.mesh.rotation.y;
            } else {
                this.moving.forward = false;
                this.attack(player);
            }
        } else {
            this.moving.forward = false;
        }
    }
    
    attack(target) {
        const now = Date.now();
        if (now - this.lastAttackTime > this.attackCooldown * 1000) {
            this.lastAttackTime = now;
            
            // B"H - Visual lunge
            if (this.mesh) {
                this.mesh.position.y += 0.5;
            }
            
            if (target.takeDamage) {
                target.takeDamage(this.damage);
            }
        }
    }
}
