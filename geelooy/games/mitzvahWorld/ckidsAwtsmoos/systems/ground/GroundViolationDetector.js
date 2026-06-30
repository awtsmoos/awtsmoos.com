// B"H
import { groundStatus } from "./GroundProbe2D.js";

export function findGroundViolations(entities = [], context = {}) {
  const violations = [];
  for (const entity of entities) {
    const status = groundStatus(entity, context);
    if (status.aboveGround) continue;
    violations.push({
      id:status.id,
      point:status.point,
      belowGround:status.belowGround,
      outOfBounds:!status.inBounds,
      insideSolid:status.insideSolid,
      blockers:status.blockers
    });
  }
  return violations;
}

export function summarizeGround(entities = [], context = {}) {
  const statuses = entities.map(entity => groundStatus(entity, context));
  return {
    checked:statuses.length,
    aboveGround:statuses.filter(status => status.aboveGround).length,
    violations:statuses.filter(status => !status.aboveGround)
  };
}

export default { findGroundViolations, summarizeGround };
