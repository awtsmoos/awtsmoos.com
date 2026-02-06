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
        
        // B"H: The Kav of Existence cannot be born from Nothingness.
        // If the direction vector has no magnitude (e.g., looking straight up/down),
        // normalizing it creates NaN, which spreads like a spiritual sickness.
        // We must guard against this Ayin (Nothingness) and provide a default direction.
        if (dir.lengthSq() < 0.0001) {
            // Default to a safe forward direction if vector is zero
            dir.set(0, 0, -1);
        } else {
            dir.normalize();
        }

        return dir;
    }
    
    static getSideVector(object3D, direction) {
        var dir = direction || new THREE.Vector3();
        object3D.getWorldDirection(dir);
        dir.y = 0;
        
        // B"H: Similar guard for the side vector
        if (dir.lengthSq() < 0.0001) {
            // If forward is zero, we can't get a side vector from it.
            // We must rely on the object's direct orientation.
            dir.set(1, 0, 0); // Default to world X
            dir.applyQuaternion(object3D.quaternion); // Apply object's rotation
            dir.y = 0;
            dir.normalize();
        } else {
            dir.normalize();
            dir.cross(object3D.up);
        }
        
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