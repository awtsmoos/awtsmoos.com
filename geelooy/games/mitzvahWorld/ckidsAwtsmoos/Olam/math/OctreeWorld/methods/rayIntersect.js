// B"H
/**
 * @file rayIntersect.js
 * @description
 * Interaction rays are local questions. A click, a talk ray, or a bow line
 * should not wake every collider in an endless world, so this method asks only
 * the leaf nodes and satellite octrees inside a short bubble around the ray.
 */
import {
  bubbleStats,
  leafNodesInsideBubble,
  pendingOctreesInsideBubble,
  rayBubbleBox
} from "./query/CollisionBubbleQuery.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function chooseClosest(current, next) {
  if (!next) return current;
  if (!current || next.distance < current.distance) return next;
  return current;
}

export default {
  rayIntersect(ray) {
    const bubble = rayBubbleBox(ray, { radius: this.queryRadius || this.rayQueryRadius });
    const nodes = leafNodesInsideBubble(this, bubble);
    const satellites = pendingOctreesInsideBubble(this, bubble);
    let closestResult = false;

    for (const node of nodes) {
      if (node.physics) closestResult = chooseClosest(closestResult, node.physics.rayIntersect(ray));
    }

    for (const satellite of satellites) {
      closestResult = chooseClosest(closestResult, satellite.rayIntersect(ray));
    }

    this.__lastRayBubbleStats = bubbleStats("ray", nodes, satellites);
    return closestResult;
  }
};
