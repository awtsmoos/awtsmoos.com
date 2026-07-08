
// B"H
import buildNodePhysics from '../buildNodePhysics.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import synchronouslyRebuildNode from '../synchronouslyRebuildNode.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    ...buildNodePhysics,
    ...synchronouslyRebuildNode
};
