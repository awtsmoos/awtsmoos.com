// B"H
/**
 * Mazik - A force of chaos/challenge in the Olam.
 * Uses procedural spiky geometry.
 */
import Medabeir from "./medabeir/index.js"; // Base class with physics/movement
import * as THREE from '/games/scripts/build/three.module.js';

export default class Mazik extends Medabeir {
    type = "mazik";
    
    constructor(options, olam) {
        // Setup stats before super
        options.maxHp = 30;
        options.speed = 40; // Slower than player
        
        super(options, olam);
        
        this.xpValue = 50;
        this.damage = 10;
        this.attackRange = 2.0;
        this.aggroRange = 15.0;
        this.lastAttackTime = 0;
        this.attackCooldown = 1.5;
        
        // Placeholder Name if not set
        if (this.name.startsWith("nivra")) this.name = "Mazik " + Math.floor(Math.random()*100);
    }
    
    async heescheel(olam) {
        // Generate Procedural Spiky Body if no model provided
        if (!this.options.golem && !this.options.path) {
            const geo = new THREE.IcosahedronGeometry(0.5, 1);
            const pos = geo.attributes.position;
            
            // Spike it
            for (let i=0; i<pos.count; i++) {
                if (i % 3 === 0) {
                    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
                    v.multiplyScalar(1.5); // Push out
                    pos.setXYZ(i, v.x, v.y, v.z);
                }
            }
            geo.computeVertexNormals();
            
            this.options.golem = {
                guf: { "Custom": geo }, // Hack for generateMesh, we usually pass type string.
                // Since generateMesh expects JSON, let's just make it here manually.
            };
            
            // Manual mesh creation since golem parser is simple
            const mat = new THREE.MeshStandardMaterial({ color: 0x550000, roughness: 0.8 });
            this.mesh = new THREE.Mesh(geo, mat);
            this.mesh.name = this.name;
            this.mesh.castShadow = true;
            
            if (this.options.position) this.mesh.position.copy(this.options.position);
            
            // Physics setup
            this.mesh.userData.isSolid = true;
            this.olam.worldOctree.addObject(this.mesh);
            this.nivrayimGroup.add(this.mesh);
            this.isReady = true;
        } else {
            await super.heescheel(olam);
        }
    }
    
    heesHawvoos(dt) {
        super.heesHawvoos(dt);
        
        if (!this.olam.player || !this.isReady) return;
        
        const player = this.olam.player;
        const dist = this.mesh.position.distanceTo(player.mesh.position);
        
        // AI Logic
        if (dist < this.aggroRange) {
            // Chase
            if (dist > this.attackRange) {
                const dir = new THREE.Vector3().subVectors(player.mesh.position, this.mesh.position).normalize();
                this.moving.forward = true;
                this.mesh.lookAt(player.mesh.position);
                // Sync rotation to physics
                this.rotation.y = this.mesh.rotation.y;
            } else {
                this.moving.forward = false;
                this.attack(player);
            }
        } else {
            this.moving.forward = false;
            // Maybe wander?
        }
    }
    
    attack(target) {
        const now = Date.now();
        if (now - this.lastAttackTime > this.attackCooldown * 1000) {
            this.lastAttackTime = now;
            
            // Visual lung
            this.mesh.position.y += 0.5; 
            
            if (target.takeDamage) {
                target.takeDamage(this.damage);
            }
        }
    }
}
