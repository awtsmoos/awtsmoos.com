
// B"H
/**
 * @file testHumanScene.js
 * @brief Primal Human Foundation.
 * 
 * THE BALLAD OF THE GROUNDED:
 * Upon the earth, the foundation is set,
 * A tower of clay, no longer a net.
 * Three times the height of its breadth and its bone,
 * Reaching one hand from the silent unknown.
 */
export const SCENE_DATA = {
    camera: {
        initialPosition: [0, 5, 12],
        target: [0, 1.5, 0],
    },
    globalShaderVars: {
        uAmbientLightColor: [0.4, 0.4, 0.45],
        uDirectionalLightColor: [1.2, 1.2, 1.1],
        uLightDirection: [0.5, 1.0, 0.5],
    },
    objects: [
        {
            id: 'grounded_human_primitive',
            primitive: 'cube',
            parameters: { size: 1.0 },
            modifiers: [
                // 1. ANCHOR ORIGIN TO BOTTOM
                // Before scaling, we move the base of the 1x1x1 cube to Y=0.
                { type: 'translateMesh', translation: [0, 0.5, 0] },
                
                // 2. SCALE TO PROPORTION
                // Height = 3.0, Width/Depth = 1.0. Torso is exactly 3x higher.
                { type: 'scaleMesh', scale: [1.0, 3.0, 1.0] },
                
                // 3. SUBDIVIDE FOR DETAIL
                { type: 'subdivide', levels: 3 },
                
                // 4. THE SINGLE ARM TEST
                // Shoulder is at Y ~ 2.5 on the left side (-X).
                { 
                    type: 'tagFaces', 
                    params: { 
                        tag: 'shoulder_face', 
                        query: { closestTo: [-0.5, 2.5, 0], normalDot: [-1, 0, 0], count: 4 } 
                    } 
                },
                { 
                    type: 'extrudeFaces', 
                    params: { 
                        query: { tag: 'shoulder_face' }, 
                        distance: 1.5, 
                        scale: 0.7,
                        assignCapTag: 'hand' 
                    } 
                },

                // 5. COLORS
                { type: 'setFaceColor', params: { color: [0.85, 0.7, 0.55, 1.0] } },
                { type: 'setFaceColor', params: { query: { tag: 'hand' }, color: [0.9, 0.3, 0.2, 1.0] } },

                // 6. BLENDER FLAT SHADING
                { type: 'flatNormals' }
            ],
            shaderVars: { uMaterialType: 'lambert' }
        },
        {
            id: 'ground',
            primitive: 'plane',
            parameters: { size: 40 },
            shaderVars: { 
                uMaterialType: 'lambert', 
                uBaseColor: [0.2, 0.3, 0.2], 
                uTexture: 'tile', 
                uTextureScale: 10.0 
            },
            position: [0, -0.01, 0] // No keyframe needed!
        }
    ]
};
