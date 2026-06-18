/**
 * B"H
 * @file projectiles.js
 * @description Chapter 454: the flying letters no longer interrogate the whole
 * world. The Awtsmoos bends their search into a nearby circle of sparks.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { queryDynamicCircle } from '../../../../systems/spatial/DynamicSpatialWorld.js?v=dynamic-spatial-world-20260617-bh1';

const SPHERE_RADIUS = 0.2;
const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 5);
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xdede8d });

function isLiveMazik(niv, sphere) {
    return !!(niv && niv.type === 'mazik' && niv.mesh && !sphere.hitEnemies.has(niv.id));
}
function strikeMazik(self, sphere, niv) {
    if (!isLiveMazik(niv, sphere) || sphere.collider.center.distanceTo(niv.mesh.position) >= 3) return;
    sphere.hitEnemies.add(niv.id);
    if (typeof self.spawnHebrewParticles === 'function') self.spawnHebrewParticles(sphere.collider.center, 10);
    if (typeof niv.takeDamage === 'function') niv.takeDamage(sphere.damage);
    sphere.velocity.x += (Math.random() - 0.5) * 10;
    sphere.velocity.y += (Math.random() - 0.5) * 10;
}
function fallbackProjectileScan(self, sphere) {
    const raw = self.olam?.nivrayim || [];
    const list = Array.isArray(raw) ? raw : Object.values(raw);
    for (const niv of list) strikeMazik(self, sphere, niv);
}
function visitProjectileTargets(self, sphere) {
    if (!sphere.isAttack || !self.olam?.nivrayim) return;
    try {
        queryDynamicCircle(self.olam, sphere.collider.center, 3.2, niv => strikeMazik(self, sphere, niv), niv => isLiveMazik(niv, sphere));
    } catch (error) {
        console.warn('B"H dynamic projectile spatial query fell back', error);
        fallbackProjectileScan(self, sphere);
    }
}

export default {
    makeSphere(letter, options = {}) {
        let mesh = letter ? this.olam.makeNewHebrewLetter(letter, options) : null;
        if (!mesh) mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        const sphere = {
            mesh,
            collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), SPHERE_RADIUS),
            velocity: new THREE.Vector3(),
            startTime: Date.now(),
            damage: options.damage || 10,
            isAttack: options.isAttack || false,
            hitEnemies: new Set()
        };
        this.spheres.push(sphere);
        return sphere;
    },
    throwBall(letter, options) {
        const sphere = this.makeSphere(letter, options);
        const v = new THREE.Vector3();
        const dir = this.olam.ayin.isFPS ? this.olam.ayin.camera.getWorldDirection(v) : this.currentModelVector;
        sphere.collider.center.copy(this.collider.end).addScaledVector(dir, this.collider.radius * 1.5);
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,0,1), dir.normalize());
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(up, dir).normalize();
        const adjustedUp = new THREE.Vector3().crossVectors(dir, right);
        const uprightQuaternion = new THREE.Quaternion();
        uprightQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), adjustedUp.normalize());
        quat.multiply(uprightQuaternion);
        sphere.mesh.quaternion.copy(quat);
        sphere.velocity.copy(dir).multiplyScalar(45);
        this.olam.scene.add(sphere.mesh);
    },
    updateSpheres(deltaTime) {
        this.spheres.forEach(s => {
            s.collider.center.addScaledVector(s.velocity, deltaTime);
            s.mesh.position.copy(s.collider.center);
            visitProjectileTargets(this, s);
            if (Date.now() - s.startTime > 3000) {
                try {
                    s.mesh.removeFromParent();
                    const ind = this.spheres.indexOf(s);
                    if (ind > -1) this.spheres.splice(ind, 1);
                } catch(e) {}
            }
        });
    }
};
