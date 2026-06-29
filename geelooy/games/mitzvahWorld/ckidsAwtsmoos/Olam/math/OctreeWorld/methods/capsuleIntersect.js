// B"H
/**
 * @file capsuleIntersect.js
 * @description
 * Player collision asks for the deepest real surface inside the capsule bubble.
 * The response stays a single correction normal so walking slides along walls
 * instead of jittering through them.
 */
import {
  bubbleStats,
  capsuleBubbleBox,
  leafNodesInsideBubble,
  pendingOctreesInsideBubble
} from "./query/CollisionBubbleQuery.js";

function deeper(current, next) {
  if (!next) return current;
  if (!current || next.depth > current.depth) return next;
  return current;
}

export default {
  capsuleIntersect(capsule) {
    const bubble = capsuleBubbleBox(capsule);
    const nodes = leafNodesInsideBubble(this, bubble);
    const satellites = pendingOctreesInsideBubble(this, bubble);
    let bestResult = null;

    for (const node of nodes) {
      if (node.physics) bestResult = deeper(bestResult, node.physics.capsuleIntersect(capsule));
    }

    for (const satellite of satellites) {
      bestResult = deeper(bestResult, satellite.capsuleIntersect(capsule));
    }

    this.__lastCapsuleBubbleStats = bubbleStats("capsule", nodes, satellites);
    return bestResult || false;
  }
};
