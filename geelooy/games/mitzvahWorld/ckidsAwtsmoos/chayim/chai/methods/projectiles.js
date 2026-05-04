
/**
 * B"H
 * @file projectiles.js
 * Throwing things.
 */
import * as THREE from '/games/scripts/build/three.module.js';

const SPHERE_RADIUS = 0.2;
const sphereGeometry = new THREE.IcosahedronGeometry( SPHERE_RADIUS, 5 );
const sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xdede8d } );

export default {
    makeSphere(letter, options={}) {
        let mesh;
        if(letter) {
            mesh = this.olam.makeNewHebrewLetter(letter, options);
        }
        if(!mesh)
            mesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
      
        const sphere = {
            mesh,
            collider: new THREE.Sphere( new THREE.Vector3( 0, - 100, 0 ), SPHERE_RADIUS ),
            velocity: new THREE.Vector3(),
            startTime: Date.now(),
            damage: options.damage || 10,
            isAttack: options.isAttack || false,
            hitEnemies: new Set() // Prevent hitting the same enemy multiple times
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
            dir = this.currentModelVector; 
        }
    
        sphere.collider.center.copy( this.collider.end ).addScaledVector( dir, this.collider.radius * 1.5 );

        const impulse = 15 + 30;
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,0,1), dir.normalize());

        let up = new THREE.Vector3(0, 1, 0);
        let right = new THREE.Vector3().crossVectors(up, dir).normalize();
        let adjustedUp = new THREE.Vector3().crossVectors(dir, right);

        let uprightQuaternion = new THREE.Quaternion();
        uprightQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), adjustedUp.normalize());

        quat.multiply(uprightQuaternion);
        sphere.mesh.quaternion.copy(quat);
        sphere.velocity.copy( dir ).multiplyScalar( impulse );

        this.olam.scene.add(sphere.mesh);
    },

    updateSpheres(deltaTime) {
        this.spheres.forEach(s => {
            s.collider.center.addScaledVector( s.velocity, deltaTime );
            s.mesh.position.copy( s.collider.center );
            
            // B"H: Combat Collision Detection
            if (s.isAttack && this.olam && this.olam.nivrayim) {
                Object.values(this.olam.nivrayim).forEach(niv => {
                    if (niv && niv.type === 'mazik' && !s.hitEnemies.has(niv.id)) {
                        // Check distance
                        if (niv.mesh && s.collider.center.distanceTo(niv.mesh.position) < 3) {
                            s.hitEnemies.add(niv.id);
                            
                            // Visual explosion for the hit
                            if (typeof this.spawnHebrewParticles === 'function') {
                                this.spawnHebrewParticles(s.collider.center, 10);
                            }
                            
                            // Deal damage
                            if (typeof niv.takeDamage === 'function') {
                                niv.takeDamage(s.damage);
                            }
                            
                            // Deflect projectile slightly
                            s.velocity.x += (Math.random() - 0.5) * 10;
                            s.velocity.y += (Math.random() - 0.5) * 10;
                        }
                    }
                });
            }

            if(Date.now() - s.startTime > 3000) { // Fixed typo from 300 to 3000 (3 seconds)
                try {
                    s.mesh.removeFromParent();
                    const ind = this.spheres.indexOf(s);
                    if(ind > -1) {
                        this.spheres.splice(ind, 1);
                    }
                } catch(e) {}
            }
        });
    }
};
        