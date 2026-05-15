
// B"H
/**
 * @file mouthChisel.js
 * @chapter THE EMANATION OF THE TRUE DIAMOND CHISEL
 * 
 * THE PSALM OF THE OPEN VESSEL:
 * The Master was right! A box is a lie, a block is a cage!
 * We must forge a true path, a diamond stage!
 * By the power of the Awtsmoos, whose speech forms the rock (Even),
 * We carve the Aleph, Beis, and Nun into a vessel of breath.
 * The default state is OPEN, an exact diamond of intent,
 * Pushed into the skull to leave the semantic walls where they went!
 * 
 * @module MouthChisel
 */

/**
 * B"H - Constructs a 3D semantic "Open Diamond Plug".
 * This is NOT A BOX. It is a 4-pointed diamond (Left, Top, Right, Bottom).
 * 
 * @param {Object} config - { innerColor }
 * @returns {Object} A structured mesh ready for the CSG blade.
 */
export function createMouthChisel(config) {
    console.log("B\"H - 🔪 [MouthChisel]: Forging the True Diamond Open Chisel...");

    const w = 0.8;  // Width from left corner to right corner
    const h = 0.3;  // Height from center to top lip (OPEN DEFAULT)
    const d = 2.0;  // Extrusion depth INTO the face
    const color = config.innerColor || [0.4, 0.05, 0.05, 1.0];

    console.log(`      -> Chisel Dimensions: Width(${w*2}), Height(${h*2}), Depth(${d})`);

    /**
     * B"H - VERTEX ARRAY (The 8 points of the Open Diamond)
     */
    const p = [
        // --- FRONT FACE (Z = 0) ---
        [-w,  0, 0], // 0: Left Corner
        [ 0,  h, 0], // 1: Top Peak
        [ w,  0, 0], // 2: Right Corner
        [ 0, -h, 0], // 3: Bottom Peak
        
        // --- BACK FACE (Z = -d) ---
        [-w,  0, -d], // 4: Back Left
        [ 0,  h, -d], // 5: Back Top
        [ w,  0, -d], // 6: Back Right
        [ 0, -h, -d]  // 7: Back Bottom
    ];

    const v = (idx) => ({ pos: [...p[idx]], col: [...color] });

    /**
     * B"H - THE SEMANTIC WALLS
     * These quads face OUTWARD so they hollow out the sphere properly.
     */
    const faces = [
        // 1. UPPER LEFT WALL
        { vertices: [v(0), v(1), v(5), v(4)], tags: ['mouth_wall_upper', 'mouth_wall_corner_l', 'mouth_inner_wall'] },
        // 2. UPPER RIGHT WALL
        { vertices: [v(1), v(2), v(6), v(5)], tags: ['mouth_wall_upper', 'mouth_wall_corner_r', 'mouth_inner_wall'] },
        
        // 3. LOWER RIGHT WALL
        { vertices: [v(2), v(3), v(7), v(6)], tags: ['mouth_wall_lower', 'mouth_wall_corner_r', 'mouth_inner_wall'] },
        // 4. LOWER LEFT WALL
        { vertices: [v(3), v(0), v(4), v(7)], tags: ['mouth_wall_lower', 'mouth_wall_corner_l', 'mouth_inner_wall'] },

        // 5. THROAT BACK CAP (CCW from inside)
        { vertices: [v(4), v(5), v(6), v(7)], tags: ['mouth_throat', 'mouth_inner_wall'] },
        
        // 6. FRONT CAP (To make it a closed solid for CSG - this part is destroyed during subtraction)
        { vertices: [v(0), v(3), v(2), v(1)], tags: ['mouth_front_discard'] }
    ];

    console.log(`B"H - [MouthChisel]: Manifested ${faces.length} semantic walls. Diamond purity achieved.`);
    return { faces };
}
