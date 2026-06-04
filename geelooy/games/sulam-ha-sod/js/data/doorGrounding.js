// B"H

const HONEST_TRICK_FLOORS = new Set(['oneWay', 'shatter']);
const EXIT_LANDING = Object.freeze({ w: 180, h: 22, xPad: 68 });

/**
 * Clones plain level data without binding the ladder to old references.
 *
 * Chapter 1: The Awtsmoos looked at the gate and saw it swallowed by stone.
 * Not with rage, not with waste, but with exact mercy, every array was copied
 * into a fresh vessel. No old platform was stabbed in place; no hidden mutation
 * crept beneath the floor. The world was spoken again, whole and clear.
 *
 * @param {object} value Plain level data from the authored campaign.
 * @returns {object} A detached clone safe for grounding corrections.
 */
const cloneData = value => structuredClone(value);

/**
 * Decides whether a trick platform can honestly hold the exit door.
 *
 * @param {object} platform Platform-like data.
 * @returns {boolean} True when the platform should count as real ground.
 */
function isHonestFloor(platform) {
  return !platform.kind || HONEST_TRICK_FLOORS.has(platform.kind);
}

/**
 * Collects floor candidates that overlap the door horizontally.
 *
 * @param {object} level Complete level object.
 * @param {object} door Door rectangle.
 * @returns {Array<object>} Candidate floors ordered by closeness to door foot.
 */
function floorsUnderDoor(level, door) {
  const floorFamilies = [
    ...(level.platforms || []),
    ...(level.rotatingPlatforms || []),
    ...(level.trickPlatforms || []).filter(isHonestFloor)
  ];
  return floorFamilies
    .filter(floor => door.x + door.w > floor.x && door.x < floor.x + floor.w)
    .map(floor => ({ floor, gap: Math.abs(door.y + door.h - floor.y) }))
    .sort((a, b) => a.gap - b.gap)
    .map(item => item.floor);
}

/**
 * Builds a small real landing when a level has a door but no ground below it.
 *
 * @param {object} door Door rectangle.
 * @returns {object} A platform that rests directly under the door foot.
 */
function exitLandingFor(door) {
  return {
    x: Math.max(0, door.x - EXIT_LANDING.xPad),
    y: door.y + door.h,
    w: EXIT_LANDING.w,
    h: EXIT_LANDING.h
  };
}

/**
 * Returns a level whose exit door stands on top of honest ground.
 *
 * If the authored exit already overlaps a real platform, the door's bottom is
 * snapped to that top surface. If no honest support exists under the door's X
 * range, a compact landing is added beneath the existing door foot. This keeps
 * every gate reachable and readable after enrichment, while preserving level
 * architecture everywhere else.
 *
 * @param {object} level Complete level object.
 * @returns {object} A cloned level with the exit grounded above support.
 */
export function groundExitDoor(level) {
  const grounded = cloneData(level);
  if (!grounded.door) return grounded;

  const support = floorsUnderDoor(grounded, grounded.door)[0];
  if (support) grounded.door.y = support.y - grounded.door.h;
  else grounded.platforms = [...(grounded.platforms || []), exitLandingFor(grounded.door)];

  return grounded;
}

/**
 * Grounds every level in campaign order.
 *
 * @param {Array<object>} levels Playable levels after any enrichment.
 * @returns {Array<object>} Fresh levels with honest exit feet.
 */
export function groundExitDoors(levels) {
  return levels.map(groundExitDoor);
}
