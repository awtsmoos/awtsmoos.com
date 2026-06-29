// B"H
/**
 * @file CollisionBubbleQuery.js
 * @description
 * The world may be endless, but touch is local. These helpers turn player
 * collision, interaction rays, and door checks into small boxes before the
 * octree is asked anything, so distant villages never tax the current step.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const DEFAULT_RAY_RADIUS = 96;
const MIN_RAY_RADIUS = 12;
const MAX_RAY_RADIUS = 180;

function finite(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function capsuleBubbleBox(capsule) {
  const box = new THREE.Box3();
  const radius = finite(capsule?.radius, 0.5);
  box.min.copy(capsule.start).min(capsule.end).subScalar(radius);
  box.max.copy(capsule.start).max(capsule.end).addScalar(radius);
  return box;
}

export function rayBubbleBox(ray, options = {}) {
  const radius = clamp(finite(options.radius, DEFAULT_RAY_RADIUS), MIN_RAY_RADIUS, MAX_RAY_RADIUS);
  const origin = ray?.origin || new THREE.Vector3();
  const direction = ray?.direction || new THREE.Vector3(0, 0, -1);
  const end = origin.clone().add(direction.clone().normalize().multiplyScalar(radius));
  const box = new THREE.Box3().setFromPoints([origin, end]);
  box.expandByScalar(radius * 0.08 + 1);
  return box;
}

export function leafNodesInsideBubble(world, bubbleBox) {
  if (!world?.root || !bubbleBox) return [];
  return world._findLeafNodesInBox(world.root, bubbleBox);
}

export function pendingOctreesInsideBubble(world, bubbleBox) {
  if (!Array.isArray(world?._pendingOctrees) || !bubbleBox) return [];
  return world._pendingOctrees.filter(sat => sat?.box?.intersectsBox?.(bubbleBox));
}

export function bubbleStats(kind, nodes, satellites) {
  return {
    kind,
    leafNodes: nodes.length,
    satellites: satellites.length,
    localOnly: true
  };
}

export default {
  capsuleBubbleBox,
  rayBubbleBox,
  leafNodesInsideBubble,
  pendingOctreesInsideBubble,
  bubbleStats
};
