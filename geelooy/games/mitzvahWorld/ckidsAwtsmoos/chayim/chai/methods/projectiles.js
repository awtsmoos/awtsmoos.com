/**
 * B"H
 * @file projectiles.js
 * Throwing things with Elemental Kavanah (Intent).
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    makeSphere(letter, options={}) {
        let mesh;
        
        // B"H: Elemental Mapping
        let color = 0xffffff;
        let element = options.element || 'neutral';
        
        if (element === 'fire') { color = 0xff4500; letter = "ש"; } 
        else if (element === 'water') { color = 0x00aaff; letter = "מ"; } 
        else if (element === 'air') { color = 0xccffff; letter = "א"; } 
        else if (element === 'earth') { color = 0x8b4513; letter = "ה"; } 
        
        if(letter) {
            mesh = this.olam.makeNewHebrewLetter(letter, { color });
        }
        
        if(!mesh) {
            const sphereGeometry = new THREE.IcosahedronGeometry( 0.2, 1 );
            const sphereMaterial = new THREE.MeshLambertMaterial( { color: color } );
            mesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
        }
        
        if (element === 'fire') {
            const light = new THREE.PointLight(0xff4500, 2, 5);
            mesh.add(light);
        }
        
        // B"H: Water Blob Shader
        if (element === 'water') {
             mesh.material = new THREE.MeshPhysicalMaterial({
                 color: 0x00aaff,
                 transmission: 0.9,
                 roughness: 0,
                 ior: 1.33,
                 transparent: true
             });
        }
      
        const sphere = {
            mesh,
            collider: new THREE.Sphere( new THREE.Vector3( 0, - 100, 0 ), 0.2 ),
            velocity: new THREE.Vector3(),
            startTime: Date.now(),
            damage: options.damage || 0,
            isAttack: options.isAttack || false,
            element: element,
            owner: this
        }
        this.spheres.push(sphere);
        return sphere;
    },

    throwBall(letter, options) {
        const sphere = this.makeSphere(letter, options);
        
        const v = new THREE.Vector3();  
        let dir;
        if(this.olam.ayin.isFPS) {
            dir = this.olam.ayin.camera.getWorldDirection( v );
        } else {
            dir = this.currentModelVector.clone(); 
            dir.y += 0.2;
            dir.normalize();
        }
    
        sphere.collider.center.copy( this.collider.end ).addScaledVector( dir, this.collider.radius * 1.5 );

        const impulse = 30; 
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,0,1), dir.normalize());

        sphere.mesh.quaternion.copy(quat);
        sphere.velocity.copy( dir ).multiplyScalar( impulse );

        this.olam.scene.add(sphere.mesh);
        
        this.playSound("awtsmoos://dingSound", { volume: 0.3, pitch: 1.5 });
    },

    updateSpheres(deltaTime) {
        for (let i = this.spheres.length - 1; i >= 0; i--) {
            const s = this.spheres[i];
            
            s.velocity.y -= 10 * deltaTime; 
            s.collider.center.addScaledVector( s.velocity, deltaTime );
            s.mesh.position.copy( s.collider.center );
            
            s.mesh.rotation.x += 10 * deltaTime;
            s.mesh.rotation.z += 10 * deltaTime;

            // B"H: Check Dynamic Collision (Trees/NPCs)
            const hit = this.checkProjectileCollision(s);
            if (hit) {
                 this.handleImpact(s, hit);
                 this.removeSphere(i);
                 continue;
            }
            
            // B"H: Check Ground Collision for Water Splat
            const ray = new THREE.Ray(s.mesh.position, new THREE.Vector3(0,-1,0));
            if (this.olam.worldOctree) {
                const groundHit = this.olam.worldOctree.rayIntersect(ray);
                if (groundHit && groundHit.distance < 0.5) {
                    if (s.element === 'water') {
                        // Spawn fluid dynamics
                        if (!this.olam.fluidSystem) {
                             import('../../dvarim/nature/fluidSystem.js').then(m => {
                                 this.olam.fluidSystem = new m.default(this.olam);
                                 this.olam.fluidSystem.addWater(groundHit.point, 5.0);
                             });
                        } else {
                            this.olam.fluidSystem.addWater(groundHit.point, 5.0);
                        }
                    }
                    this.removeSphere(i);
                    continue;
                }
            }

            if(Date.now() - s.startTime > 3000) { 
                this.removeSphere(i);
            }
        }
    },
    
    handleImpact(projectile, target) {
        let dmg = projectile.damage;
        
        if (projectile.element === 'fire') {
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "IGNITE!", color: "#ff4500" });
        }
        if (projectile.element === 'water') {
            const pushDir = projectile.velocity.clone().normalize().multiplyScalar(10);
            if (target.velocity) target.velocity.add(pushDir);
        }
        
        // B"H: Interact with Trees
        if (target.userData && target.userData.isTree && target.userData.nivraAwtsmoos) {
            target.userData.nivraAwtsmoos.takeDamage(10, projectile.element);
            return;
        }

        if (target.takeDamage) {
            target.takeDamage(dmg);
        }
    },
    
    removeSphere(index) {
        const s = this.spheres[index];
        if (s) {
            s.mesh.removeFromParent();
            this.spheres.splice(index, 1);
        }
    },

    checkProjectileCollision(sphere) {
        if (!this.olam.nivrayim) return null;
        
        for (const n of this.olam.nivrayim) {
            if (n === this) continue; 
            if (!n.isReady || !n.mesh) continue;
            
            // Octree solid check for static trees
            if (n.type === 'proceduralTree') {
                const dist = sphere.collider.center.distanceTo(n.mesh.position);
                if (dist < 2.0) return n.mesh; // Return mesh wrapper for handleImpact
            }
            
            let hit = false;
            if (n.collider && n.collider.start) {
                 const center = new THREE.Vector3().addVectors(n.collider.start, n.collider.end).multiplyScalar(0.5);
                 const dist = sphere.collider.center.distanceTo(center);
                 if (dist < (n.collider.radius + sphere.collider.radius + 0.5)) hit = true;
            } else {
                 const dist = sphere.collider.center.distanceTo(n.mesh.position);
                 if (dist < 1.5) hit = true;
            }
            
            if (hit) return n;
        }
        return null;
    }
};
