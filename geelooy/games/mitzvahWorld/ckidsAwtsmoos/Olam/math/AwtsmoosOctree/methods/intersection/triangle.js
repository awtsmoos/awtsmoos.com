
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

const _v1 = new THREE.Vector3();
const _plane = new THREE.Plane();
const _line1 = new THREE.Line3();
const _line2 = new THREE.Line3();

export default {
    _triangleCapsuleIntersect(capsule, triangle) {
        triangle.getPlane(_plane);
        
        // B"H: THE PURIFICATION OF MATH
        // If the plane has no solid normal, or is infected by NaN, reject collision entirely.
        if (_plane.normal.lengthSq() < 0.1 || isNaN(_plane.normal.x)) return false;
        
        const d1 = _plane.distanceToPoint(capsule.start) - capsule.radius;
        const d2 = _plane.distanceToPoint(capsule.end) - capsule.radius;
        
        // Complete separation check
        if ((d1 > 0 && d2 > 0) || (d1 < -capsule.radius && d2 < -capsule.radius)) return false;
        
        const sumDist = Math.abs(d1) + Math.abs(d2);
        const delta = sumDist > 1e-6 ? Math.abs(d1 / sumDist) : 0;
        const intersectPoint = _v1.copy(capsule.start).lerp(capsule.end, delta);
        
        // Face check
        if (triangle.containsPoint(intersectPoint)) {
            return { normal: _plane.normal.clone(), point: intersectPoint.clone(), depth: Math.abs(Math.min(d1, d2)) };
        }
        
        // Edge check
        const r2 = capsule.radius * capsule.radius;
        _line1.set(capsule.start, capsule.end);
        const lines = [[triangle.a, triangle.b], [triangle.b, triangle.c],[triangle.c, triangle.a]];
        for (let i = 0; i < lines.length; i++) {
            _line2.set(lines[i][0], lines[i][1]);
            const[point1, point2] = capsule.lineLineMinimumPoints(_line1, _line2);
            if (point1.distanceToSquared(point2) < r2) {
                return { normal: point1.clone().sub(point2).normalize(), point: point2.clone(), depth: capsule.radius - point1.distanceTo(point2) };
            }
        }
        return false;
    }
};
