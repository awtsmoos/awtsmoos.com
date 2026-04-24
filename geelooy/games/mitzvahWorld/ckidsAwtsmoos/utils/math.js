/**
 * B"H
 * Math Utilities
 */
import * as THREE from '/games/scripts/build/three.module.js';

var IDs = 0;

export default class MathUtils {
    static generateID() {
        return "BH_" + Date.now() + "_" + (IDs++);
    }

    static getForwardVector(object3D, direction) {
        var dir = direction || new THREE.Vector3();
        object3D.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        return dir;
    }
    
    static getSideVector(object3D, direction) {
        var dir = direction || new THREE.Vector3();
        object3D.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        dir.cross(object3D.up);
        return dir;
    }

    static capsuleSphereColliding(capsule, sphere) {
		var _vector1 = new THREE.Vector3();
        var direction = new THREE.Vector3().subVectors(capsule.end, capsule.start);
        var halfDirection = direction.multiplyScalar(0.5);
        var emtsaCapsule = _vector1.addVectors(capsule.start, halfDirection);
        var emtsaSphere = sphere.center;
        var radius = capsule.radius + sphere.radius;
        var r2 = radius * radius;
		var ar = [capsule.start, capsule.end, emtsaCapsule];
        for(var nikooduh of ar) {
            var reechook2 = nikooduh.distanceToSquared(emtsaSphere);
            if(reechook2 < r2) {
                return true;
            }
        }
        return false;
    }
}