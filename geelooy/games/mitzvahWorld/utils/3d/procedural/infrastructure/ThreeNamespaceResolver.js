
/**
 * B"H
 * @file ThreeNamespaceResolver.js
 * @description
 * Resolves the real THREE namespace for procedural builders.
 *
 * The road error happened because ProceduralRoad passed the wrong object into
 * RoadAssembler. It was not the THREE namespace, so Group, Mesh, and BoxGeometry
 * were missing.
 *
 * This file makes the procedural system robust:
 * - if caller passes THREE, use it
 * - if caller passes { THREE }, use that
 * - otherwise use the real static THREE import
 */

import * as REAL_THREE from "/games/scripts/build/three.module.js";

/**
 * B"H
 * Checks if an object looks like a usable THREE namespace.
 *
 * @param {any} candidate
 * Candidate object.
 *
 * @returns {boolean}
 * True when the candidate has core constructors.
 */
export function isUsableThreeNamespace(candidate) {
  return Boolean(
    candidate &&
    typeof candidate.Group === "function" &&
    typeof candidate.Mesh === "function" &&
    typeof candidate.BoxGeometry === "function"
  );
}

/**
 * B"H
 * Resolves a valid THREE namespace from any procedural input.
 *
 * @param {any} input
 * Possible THREE namespace, object containing THREE, or anything else.
 *
 * @returns {any}
 * Valid THREE namespace.
 */
export function resolveThreeNamespace(input) {
  if (isUsableThreeNamespace(input)) {
    return input;
  }

  if (isUsableThreeNamespace(input?.THREE)) {
    return input.THREE;
  }

  if (isUsableThreeNamespace(input?.three)) {
    return input.three;
  }

  return REAL_THREE;
}
