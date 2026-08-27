// B"H
import { Vec3 } from '../../math/vec3.js';

export class CollisionSolver {

    static checkAndResolveSphereSphere(b1, b2) {
        const diff = Vec3.sub(b1.pos, b2.pos);
        const distSq = Vec3.dot(diff, diff);
        const r = b1.radius + b2.radius;

        if (distSq < r * r && distSq > 1e-9) {
            const dist = Math.sqrt(distSq);
            const normal = Vec3.scale(diff, 1.0 / dist);
            const penetration = r - dist;
            this.resolveContact(b1, b2, normal, penetration);
        }
    }

    static checkAndResolveSphereTriangle(sphere, p0, p1, p2) {
        const e1 = Vec3.sub(p1, p0);
        const e2 = Vec3.sub(p2, p0);
        const triNormal = Vec3.normalize(Vec3.cross(e1, e2));
        
        // 1. Continuous Tunneling Detection
        const distToPlane = Vec3.dot(Vec3.sub(sphere.pos, p0), triNormal);
        const oldDistToPlane = Vec3.dot(Vec3.sub(sphere.oldPos, p0), triNormal);
        
        if (oldDistToPlane * distToPlane < 0) {
            // Crossed the plane this sub-step
            const penetration = sphere.radius + Math.abs(distToPlane);
            const resolutionNormal = oldDistToPlane > 0 ? triNormal : Vec3.scale(triNormal, -1);
            this.resolveStaticContact(sphere, resolutionNormal, penetration);
            return;
        }
        
        // 2. Standard Overlap Check
        if (Math.abs(distToPlane) < sphere.radius) {
            const closest = this.closestPointTriangle(sphere.pos, p0, p1, p2);
            const diff = Vec3.sub(sphere.pos, closest);
            const distSq = Vec3.dot(diff, diff);
            
            if (distSq < sphere.radius * sphere.radius) {
                const dist = Math.sqrt(distSq);
                const normal = dist > 1e-6 ? Vec3.scale(diff, 1.0 / dist) : triNormal;
                this.resolveStaticContact(sphere, normal, sphere.radius - dist);
            }
        }
    }

    static resolveContact(b1, b2, normal, penetration) {
        const totalMass = b1.invMass + b2.invMass;
        if (totalMass === 0) return;

        // B"H - More aggressive positional correction (0.9) to prevent overlap sinks
        const correction = Vec3.scale(normal, (penetration / totalMass) * 0.9);
        if (!b1.isStatic) b1.pos = Vec3.add(b1.pos, Vec3.scale(correction, b1.invMass));
        if (!b2.isStatic) b2.pos = Vec3.sub(b2.pos, Vec3.scale(correction, b2.invMass));

        const relVel = Vec3.sub(b1.velocity, b2.velocity);
        const velAlongNormal = Vec3.dot(relVel, normal);
        if (velAlongNormal > 0) return;

        const e = Math.min(b1.bounciness, b2.bounciness);
        let j = -(1 + e) * velAlongNormal / totalMass;
        
        const impulse = Vec3.scale(normal, j);
        if (!b1.isStatic) b1.velocity = Vec3.add(b1.velocity, Vec3.scale(impulse, b1.invMass));
        if (!b2.isStatic) b2.velocity = Vec3.sub(b2.velocity, Vec3.scale(impulse, b2.invMass));
    }
    
    static resolveStaticContact(body, normal, penetration) {
        if (body.isStatic) return;

        // Position Correction (Factor > 1.0 to prevent sticking)
        body.pos = Vec3.add(body.pos, Vec3.scale(normal, penetration * 1.01));

        const vDotN = Vec3.dot(body.velocity, normal);
        if (vDotN < 0) {
            // Impulse
            const impulseMag = -(1.0 + body.bounciness) * vDotN;
            body.velocity = Vec3.add(body.velocity, Vec3.scale(normal, impulseMag));
            
            // B"H - Friction Nihilism: If friction is 0, preserve 100% of tangential speed
            if (body.friction > 0.001) {
                const normComp = Vec3.scale(normal, Vec3.dot(body.velocity, normal));
                const tangComp = Vec3.sub(body.velocity, normComp);
                body.velocity = Vec3.add(normComp, Vec3.scale(tangComp, 1.0 - body.friction));
            }
        }
    }

    static closestPointTriangle(p, a, b, c) {
        const ab=Vec3.sub(b,a), ac=Vec3.sub(c,a), ap=Vec3.sub(p,a);
        const d1=Vec3.dot(ab,ap), d2=Vec3.dot(ac,ap);
        if (d1 <= 0 && d2 <= 0) return a;
        const bp=Vec3.sub(p,b), d3=Vec3.dot(ab,bp), d4=Vec3.dot(ac,bp);
        if (d3 >= 0 && d4 <= d3) return b;
        const vc = d1*d4-d3*d2;
        if (vc <= 0 && d1 >= 0 && d3 <= 0) {
            const v=d1/(d1-d3); return Vec3.add(a, Vec3.scale(ab, v));
        }
        const cp=Vec3.sub(p,c), d5=Vec3.dot(ab,cp), d6=Vec3.dot(ac,cp);
        if (d6 >= 0 && d5 <= d6) return c;
        const vb=d5*d2-d1*d6;
        if (vb <= 0 && d2 >= 0 && d6 <= 0) {
            const w=d2/(d2-d6); return Vec3.add(a, Vec3.scale(ac, w));
        }
        const va=d3*d6-d5*d4;
        if (va <= 0 && (d4-d3)>=0 && (d5-d6)>=0) {
            const w=(d4-d3)/((d4-d3)+(d5-d6)); return Vec3.add(b, Vec3.scale(Vec3.sub(c, b), w));
        }
        const denom=1/(va+vb+vc);
        const v=vb*denom, w=vc*denom;
        return Vec3.add(a, Vec3.add(Vec3.scale(ab,v), Vec3.scale(ac,w)));
    }
}