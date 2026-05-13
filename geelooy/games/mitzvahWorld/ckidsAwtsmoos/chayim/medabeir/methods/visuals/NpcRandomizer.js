
/**
 * B"H
 * @module NpcRandomizer
 * @description
 * 🎭 THE GARMENTS OF MANY COLORS 🎭
 * 
 * "And he made him a coat of many colors..."
 * 
 * If every NPC shares the exact same .glb file in memory to save network bandwidth,
 * changing the material of one will change them ALL across the entire world! 
 * This module ensures the specific materials are CLONED deeply before colors 
 * are applied, granting each soul its own unique aesthetic identity.
 */

export default class NpcRandomizer {
    /**
     * @method randomize
     * @description Applies unique, non-colliding colors and visibility toggles to an NPC.
     * @param {THREE.Object3D} targetMesh - The root of the loaded GLB.
     */
    static randomize(targetMesh) {
        if (!targetMesh || typeof targetMesh.traverse !== 'function') return;
        
        const colors = [0x1a1a2e, 0x3d2b1f, 0x111111, 0x223344, 0x4a4a4a, 0x002200, 0x661122];
        const getCol = () => colors[Math.floor(Math.random() * colors.length)];
        
        const myJacketColor = getCol();
        const myPantsColor = getCol();
        
        // Randomly hide some accessories so they aren't all identical
        const hideHat = Math.random() > 0.5;
        const hideGlasses = Math.random() > 0.3;
        
        targetMesh.traverse(child => {
            if (child.isMesh && child.material && child.userData.garment) {
                const garment = child.userData.garment;
                
                if (garment === 'top-hat') child.visible = !hideHat;
                if (garment === 'yamulka') child.visible = hideHat;
                if (garment === 'glasses') child.visible = !hideGlasses;
                
                // Color injection
                if (garment === 'jacket' || garment === 'pants' || garment === 'outer-shirt') {
                    
                    // B"H: ABSOLUTE CLONING TO PREVENT GLOBAL POLLUTION
                    if (!child.userData.materialCloned) {
                        child.material = child.material.clone();
                        child.userData.materialCloned = true;
                    }
                    
                    let targetColor = myJacketColor;
                    if (garment === 'pants') targetColor = myPantsColor;
                    if (garment === 'outer-shirt') targetColor = 0xffffff; 
                    
                    // Arrays handled safely
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => {
                            if (m.color) m.color.setHex(targetColor);
                        });
                    } else if (child.material.color) {
                        child.material.color.setHex(targetColor);
                    }
                }
            }
        });
    }
}
