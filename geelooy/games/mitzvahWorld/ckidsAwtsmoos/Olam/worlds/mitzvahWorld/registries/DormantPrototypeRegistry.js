// B"H
/**
 * DormantPrototypeRegistry
 *
 * Purpose:
 * Gives disconnected prototype files an explicit owner without importing them
 * into mobile boot or live physics.
 *
 * Runtime owner:
 * Architecture/headless audits. The village runtime does not import this file.
 *
 * Inputs:
 * Static metadata for prototype modules found in disconnected-file reports.
 *
 * Outputs:
 * Plain registry rows and diagnostics for adoption/delete decisions.
 *
 * Performance:
 * No dynamic imports, no scene access, no THREE dependency, and no boot work.
 *
 * Fallback:
 * Prototypes that assume flat Y=0 terrain stay dormant because live collision
 * must use registered mesh geometry first.
 *
 * Diagnostics:
 * snapshot() reports counts by lane and the files blocked from live collision.
 */

const rows = Object.freeze([
  Object.freeze({
    id:"ground-rectifier-flat-box",
    file:"Olam/oyved/geometry/GroundRectifier.js",
    lane:"collision-helper",
    owner:"dormant-prototype-registry",
    status:"dormant",
    reason:"Assumes a thick box ground whose top face is Y=0; live terrain must be mesh-direct."
  }),
  Object.freeze({
    id:"ground-axiom-flat-foundation",
    file:"Olam/oyved/vessels/physics/GroundAxiomRectifier.js",
    lane:"collision-helper",
    owner:"dormant-prototype-registry",
    status:"dormant",
    reason:"Moves visual ground to Y=0 from JSON box dimensions; not valid for procedural village hills."
  }),
  Object.freeze({
    id:"physical-alignment-half-capsule",
    file:"Olam/oyved/briyah/PhysicalAlignment.js",
    lane:"player-visual-alignment",
    owner:"dormant-prototype-registry",
    status:"superseded",
    reason:"Uses half-capsule offsets; current VisualGroundClamp measures rendered model bounds."
  }),
  Object.freeze({
    id:"chossid-feet-half-height",
    file:"Olam/oyved/vessels/alignment/ChossidFeetProtocol.js",
    lane:"player-visual-alignment",
    owner:"dormant-prototype-registry",
    status:"superseded",
    reason:"Uses fixed half-height lowering; current player proof reports capsule feet and visual bounds."
  })
]);

export function listDormantPrototypes() {
  return rows.slice();
}

export function getDormantPrototype(id) {
  return rows.find(row => row.id === id) || null;
}

export function snapshot() {
  const byLane = {};
  const blockedFromLiveCollision = [];
  for (const row of rows) {
    byLane[row.lane] = (byLane[row.lane] || 0) + 1;
    if (row.lane === "collision-helper" && row.status === "dormant") blockedFromLiveCollision.push(row.file);
  }
  return {
    owner:"dormant-prototype-registry",
    count:rows.length,
    byLane,
    blockedFromLiveCollision,
    bootSafe:true
  };
}

export default { listDormantPrototypes, getDormantPrototype, snapshot };
