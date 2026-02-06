// B"H
/**
 * Traversal.js
 * Handles the recursive processing of a vessel's hierarchy.
 * Assigns properties, materials, and specialized logic to children.
 */
import Utils from "../../../utils.js";

export default class Traversal {
    static async traverseVessel(meshRoot, nivra, olam, collections) {
        const { 
            placeholders, 
            thingsToRemove, 
            materials, 
            boneChildren, 
            garments, 
            bodyParts 
        } = collections;

        const children = [];
        meshRoot.traverse(child => { children.push(child); });

        let nodeCount = 0;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            nodeCount++;
            
            // Yield to main thread every 100 nodes to prevent freezing
            if (nodeCount % 100 === 0) {
                await new Promise(r => setTimeout(r, 0));
            }

            child.nivraAwtsmoos = nivra;

            // B"H: THE DIVINE FIX for the 'length of undefined' TypeError
            // The light of the Awtsmoos reveals that some vessels (THREE.Points)
            // are created with the potential for morphing (morphAttributes in geometry)
            // but without the array to control that morphing (morphTargetInfluences).
            // The renderer expects this vessel to exist, even if empty. We now ensure its existence.
            if (child.isPoints && child.geometry && child.geometry.morphAttributes.position) {
                if (child.morphTargetInfluences === undefined) {
                    child.morphTargetInfluences = [];
                }
            }

            // 1. Identity & Anatomy
            if(child.type == "Bone") boneChildren[child.name] = child;
            if(child?.userData?.garment) garments[child.userData.garment] = child;
            if(child?.userData?.["body-part"]) bodyParts[child.userData["body-part"]] = child;
            
            // 2. Elemental Properties
            if(child.userData?.water) {
                child.isWater = true;
                olam.ayshPeula("start water", child);
            }

            if(child.userData.meen == "land") {
                if(!nivra.lands) nivra.lands = [];
                nivra.lands.push(child);
            }

            // 3. Actions
            if(child.userData?.action) {
                const ac = olam.actions[child.userData.action];
                if(ac) {
                    if(!nivra.childrenWithActions) nivra.childrenWithActions = [];
                    nivra.childrenWithActions.push(ac);
                    child.awtsmoosAction = (p, n) => ac(p, n, olam);
                }
            }

            // 4. Placeholders
            if(typeof(child.userData.placeholder) == "string") {
                const { position, rotation, scale } = olam.getTransformation(child);
                if(!placeholders[child.userData.placeholder]) placeholders[child.userData.placeholder] = [];
                placeholders[child.userData.placeholder].push({
                    position, rotation, scale, mesh: child, addedTo: false,
                    shlichus: child.userData.shlichus
                });
                thingsToRemove.push(child);
            }

            // 5. Entities (Sub-Nivrayim)
            if(typeof(child.userData.entity) == "string") {
                olam.saveEntityInNivra(child.userData.entity, nivra, child);
                if(nivra.isSolid) child.isSolid = true;
                child.isMesh = true;
            }

            // 6. Scene Registration
            if (child.isMesh && !child.isAwduhm && !child.isWater) {
                olam.objectsInScene.push(child);
                child.castShadow = true;
                child.receiveShadow = true;
            } else if(child.isWater) {
                olam.water = child;
                if(!olam.waters) olam.waters = [];
                olam.waters.push(child);
            }

            // 7. Material Optimization
            if(child.material) {
                Utils.replaceMaterialWithLambert(child);
                materials.push(child.material);
                if(child.userData.invisible) child.material.visible = false;
            }
        }
        
        return nodeCount;
    }
}