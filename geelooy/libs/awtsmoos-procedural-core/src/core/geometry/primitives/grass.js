
// B"H
/**
 * @file grass.js
 * @brief Generates instanced grass fields constrained strictly to defined patches.
 */
export function createGrassFieldMesh(params) {
    const count = params.count || 1000;
    const width = params.width || 20; 
    const bladeW = params.bladeWidth || 0.1;
    const bladeH = params.bladeHeight || 1.0;
    const seed = params.seed || 777;
    const patches = params.patches ||[];

    const hash = (x, z) => {
        const h = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453;
        return h - Math.floor(h);
    };

    const hw = bladeW / 2;
    const positions =[ -hw, 0, 0, hw, 0, 0, 0, bladeH, 0 ];
    const indices = [0, 1, 2];
    const normals =[ 0, 0, 1, 0, 0, 1, 0, 0, 1 ];
    const colors =[ 0,1,0,1, 0,1,0,1, 0,1,0,1 ];

    const instanceOffsets = [];
    const instanceScales =[];
    const instanceRotations =[];
    
    let generated = 0;
    let attempts = 0;
    
    // B"H - Spatial Distibution Engine
    while (generated < count && attempts < count * 15) {
        attempts++;
        
        let x, z;
        
        if (patches.length > 0) {
            // Pick a random patch to spawn in
            const patch = patches[Math.floor(Math.random() * patches.length)];
            const px = patch[0], pz = patch[2], radius = patch[3];
            
            // Random point strictly within the circular patch
            const r = radius * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            x = px + r * Math.cos(theta);
            z = pz + r * Math.sin(theta);
            
            // Taper the edges with noise so the meadow fades into dirt naturally
            const distRatio = r / radius;
            if (distRatio > 0.6 && hash(x*0.1, z*0.1) < (distRatio - 0.5)*2.5) {
                continue; 
            }
        } else {
            // Fallback
            x = (Math.random() - 0.5) * width;
            z = (Math.random() - 0.5) * width;
            if (hash(x * 0.1, z * 0.1) < 0.5) continue;
        }

        instanceOffsets.push(x, 0, z);
        instanceScales.push(0.7 + Math.random() * 0.6);
        instanceRotations.push(Math.random() * Math.PI * 2);
        generated++;
    }

    return {
        positions, indices, normals, colors,
        instanceOffsets: new Float32Array(instanceOffsets),
        instanceScales: new Float32Array(instanceScales),
        instanceRotations: new Float32Array(instanceRotations),
        instanceCount: generated,
        drawMode: 'TRIANGLES'
    };
}
