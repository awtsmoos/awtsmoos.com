
/**
 * B"H
 * THE BOUNDARIES OF REALITY (AABB)
 * 
 * Chapter: The Exact Limits
 * Axis-Aligned Bounding Boxes. The simplest expression of form.
 * No rotations. No scaling. Just pure, unadulterated Min and Max.
 * 
 * @class AABBMath
 */
export class AABBMath {
    /**
     * B"H
     * Determines the exact distance at which the Ray pierces the box.
     * @param {Array<number>} origin - Ray source.
     * @param {Array<number>} dir - Ray direction.
     * @param {Array<number>} min - Box minimums.
     * @param {Array<number>} max - Box maximums.
     * @returns {number|null} Distance t, or null if missed.
     */
    static intersect(origin, dir, min, max) {
        let tmin = -Infinity;
        let tmax = Infinity;

        for (let i = 0; i < 3; i++) {
            if (Math.abs(dir[i]) < 1e-8) {
                if (origin[i] < min[i] || origin[i] > max[i]) return null;
            } else {
                let t1 = (min[i] - origin[i]) / dir[i];
                let t2 = (max[i] - origin[i]) / dir[i];
                
                if (t1 > t2) { let temp = t1; t1 = t2; t2 = temp; }
                
                tmin = Math.max(tmin, t1);
                tmax = Math.min(tmax, t2);
                
                if (tmin > tmax) return null;
            }
        }
        
        if (tmax < 0) return null;
        return Math.max(tmin, 0); // Handles ray starting inside box
    }

    /**
     * B"H
     * Dynamically constructs bounds from raw vertices.
     */
    static compute(positions) {
        let min = [Infinity, Infinity, Infinity];
        let max = [-Infinity, -Infinity, -Infinity];
        
        if (!positions || positions.length === 0) {
            return { min: [-1,-1,-1], max: [1,1,1] };
        }

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i], y = positions[i+1], z = positions[i+2];
            if (x < min[0]) min[0] = x; if (x > max[0]) max[0] = x;
            if (y < min[1]) min[1] = y; if (y > max[1]) max[1] = y;
            if (z < min[2]) min[2] = z; if (z > max[2]) max[2] = z;
        }

        // Add a tiny epsilon so flat planes don't disappear
        const ep = 0.01;
        min = [min[0]-ep, min[1]-ep, min[2]-ep];
        max = [max[0]+ep, max[1]+ep, max[2]+ep];

        return { min, max };
    }
}
