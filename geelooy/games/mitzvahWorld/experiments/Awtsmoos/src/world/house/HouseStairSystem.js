// B"H
import {
	PLAYER_CAPSULE,
	floorTopY
} from './HouseSpec.js';

export const STAIR_RULES = Object.freeze({
	maxRise: 0.26,
	treadDepth: 0.68,
	minimumWidth: 2.8,
	wallClearance: 0.7,
	headroomExtra: 0.8
});

/** Plans visual treads, one ramp, and the upper opening from one measured run. */
export function planHouseStaircase(spec, fromLevel, toLevel) {
	const fromY = floorTopY(spec, fromLevel);
	const toY = floorTopY(spec, toLevel);
	const totalRise = toY - fromY;
	const stepCount = Math.ceil(totalRise / STAIR_RULES.maxRise);
	const stepRise = totalRise / stepCount;
	const treadDepth = Math.max(PLAYER_CAPSULE.radius * 1.6, STAIR_RULES.treadDepth);
	const width = Math.max(PLAYER_CAPSULE.radius * 6, STAIR_RULES.minimumWidth);
	const run = stepCount * treadDepth;
	const headroom = PLAYER_CAPSULE.height + STAIR_RULES.headroomExtra;
	const openingSteps = Math.ceil(headroom / stepRise) + 2;
	const openingDepth = openingSteps * treadDepth + PLAYER_CAPSULE.radius * 2;
	const interiorWidth = spec.width - spec.wallT * 2;
	const interiorDepth = spec.depth - spec.wallT * 2;
	const centerX = clamp(-interiorWidth * 0.22, -interiorWidth / 2 + width, interiorWidth / 2 - width);
	const zMin = -interiorDepth / 2 + STAIR_RULES.wallClearance;
	const zMax = zMin + openingDepth;
	const finalStepZ = zMin + treadDepth / 2;
	const firstStepZ = finalStepZ + (stepCount - 1) * treadDepth;
	const lowerLandingDepth = Math.max(PLAYER_CAPSULE.radius * 3, 1.3);
	const lowerLandingCenterZ = firstStepZ + treadDepth / 2 + lowerLandingDepth / 2;
	const steps = Array.from({ length: stepCount }, (_, index) => Object.freeze({
		index,
		centerX,
		centerZ: firstStepZ - index * treadDepth,
		topY: fromY + (index + 1) * stepRise,
		bottomY: fromY,
		width,
		depth: treadDepth
	}));
	return Object.freeze({
		id: `${spec.id}-stairs-${fromLevel + 1}-${toLevel + 1}`,
		houseId: spec.id,
		fromLevel,
		toLevel,
		fromY,
		toY,
		totalRise,
		run,
		stepCount,
		stepRise,
		treadDepth,
		width,
		headroom,
		lowerLanding: Object.freeze({
			centerX,
			centerZ: lowerLandingCenterZ,
			width,
			depth: lowerLandingDepth,
			topY: fromY
		}),
		opening: Object.freeze({
			centerX,
			centerZ: (zMin + zMax) / 2,
			width: width + PLAYER_CAPSULE.radius * 2 + 0.24,
			depth: openingDepth,
			xMin: centerX - width / 2 - PLAYER_CAPSULE.radius - 0.12,
			xMax: centerX + width / 2 + PLAYER_CAPSULE.radius + 0.12,
			zMin,
			zMax
		}),
		steps: Object.freeze(steps)
	});
}

export function staircaseStats(layout) {
	const slopeAngle = Math.atan2(layout.totalRise, layout.run);
	return {
		id: layout.id,
		houseId: layout.houseId,
		totalSteps: layout.stepCount,
		landings: 1,
		octreeSteps: 1,
		openings: 1,
		maxRise: layout.stepRise,
		minTreadDepth: layout.treadDepth,
		approachClearance: layout.lowerLanding.depth,
		opening: layout.opening,
		visualTriangleCount: (layout.stepCount * 4 + 5) * 2,
		rampTriangleCount: 2,
		internalCollisionFaces: 0,
		slopeAngle,
		slopeNormalY: Math.cos(slopeAngle),
		collisionModel: 'continuous-two-triangle-ramp',
		capsuleFits: layout.opening.width > PLAYER_CAPSULE.radius * 2 && layout.headroom > PLAYER_CAPSULE.height
	};
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
