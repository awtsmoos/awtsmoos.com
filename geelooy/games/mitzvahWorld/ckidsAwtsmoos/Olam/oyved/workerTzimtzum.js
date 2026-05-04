
/**
 * B"H
 * workerTzimtzum.js
 * Chapter 3: THE ALLOCATION OF FORCES.
 * 
 * Logic within the 'Oyved' thread that manages the flow of mesh loading 
 * and collision volume creation. Hyper-logging added to find 
 * where the Chossid is being trapped.
 */

export default {
    /**
     * @method ingestPhysicsMesh
     * @description Enters a mesh into the spiritual grid (Octree).
     */
    ingestPhysicsMesh(mesh, worldOctree) {
        if (!mesh || !worldOctree) return;

        // B"H: silent

        const start = performance.now();
        
        try {
            worldOctree.fromGraphNode(mesh);
            const duration = performance.now() - start;
            // B"H: silent

        } catch (err) {
            console.error(`B"H - 🚨 [OYVED_PHYSICS_CRASH]: Failed mesh [${mesh.name}]`, err);
        }
    },

    /**
     * @method signalGenesis
     * @description Signals progress of creation back to the Main Thread.
     */
    signalGenesis(ctx, amount, action) {
        ctx.postMessage({
            type: 'increasedOlamLoading',
            payload: { amount, action }
        });
    }
};
