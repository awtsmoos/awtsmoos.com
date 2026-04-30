
// B"H
/**
 * @module InsertionAndDistribution
 * @description
 * ⚖️ THE JUSTICE OF MULTIPLICITY ⚖️
 * "How manifold are Your works, O Lord!"
 * 
 * If a large rock spans 4 distinct quadrants in space, it cannot physically belong
 * to only one array. The `Object3D.add` method steals it from the previous quadrant.
 * Here, we apply the Absolute Tikkun: We clone the mesh deeply for EACH quadrant,
 * preserving its matrix entirely, so physics calculations remain perfect in all bounds.
 */
import { NODE_STATE } from '../constants.js';

export default {
    _insertMeshOnly(node, mesh, meshBox) {
        if (!node.box.intersectsBox(meshBox)) return false;
        
        if (node.type === 'LEAF') {
            let meshToAdd;
            
            // B"H: ABSOLUTE EXISTENTIAL CONTINUITY
            // We ALWAYS clone to prevent theft by siblings!
            meshToAdd = mesh.clone();
            meshToAdd.matrixWorld.copy(mesh.matrixWorld);
            meshToAdd.userData = { ...mesh.userData };
            
            node.physicsMeshGroup.add(meshToAdd);
            node.state = NODE_STATE.PENDING_BUILD;
            
            if(meshToAdd.userData) meshToAdd.userData.inMainWorld = true;
            
            if (node.physics) this._synchronouslyRebuildNode(node, meshToAdd);
            else this._buildNodePhysics(node);
            
            return true;
        } else {
            let placed = false;
            for (const child of node.children) {
                if (this._insertMeshOnly(child, mesh, meshBox)) placed = true;
            }
            return placed;
        }
    },

    _distributeMeshes(node, mesh) {
        const meshWorldBox = mesh.geometry ? mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld) : null;
        if (!meshWorldBox || !node.box.intersectsBox(meshWorldBox)) return;
        
        if (node.type === 'LEAF') {
            const clone = mesh.clone();
            clone.matrixWorld.copy(mesh.matrixWorld);
            clone.userData = { ...mesh.userData };
            
            node.physicsMeshGroup.add(clone);
            node.state = NODE_STATE.PENDING_BUILD;
            return;
        }
        
        if (node.type === 'BRANCH') {
            const intersectingChildren = node.children.filter(child => child.box.intersectsBox(meshWorldBox));
            intersectingChildren.forEach(child => {
                const c = mesh.clone();
                c.matrixWorld.copy(mesh.matrixWorld); 
                c.userData = { ...mesh.userData };
                this._distributeMeshes(child, c);
            });
        }
    }
};
