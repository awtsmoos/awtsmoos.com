
// B"H
import { NODE_STATE } from '../constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    _enforceCriticalPath(foci) {
        for (const focus of foci) {
            // Predict where the soul will be based on its velocity intent
            const criticalPoint = focus.position.clone().addScaledVector(focus.velocity, 0.25);
            let currentNode = this._findLeafNodeAtPoint(this.root, criticalPoint);
            
            // If the ground isn't ready for the foot, command reality to solidify instantly!
            if (currentNode && currentNode.state !== NODE_STATE.READY) {
                this._buildNodePhysics(currentNode);
            }
        }
    }
};
