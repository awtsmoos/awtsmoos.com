// B"H
import { normalizeDoorFrame } from './HouseDoorGeometry.js';
import {
	signedEntryMeasurements,
	sourceFacePlacement
} from './MezuzaPlacement.js';

/** Creates one visible source-side mezuzah for an exterior or interior doorway. */
export function createMezuzaDef(specification, material = {}, context = {}) {
	const frame = normalizeDoorFrame(specification);
	const dimensions = {
		width: Math.min(0.18, frame.wall.thickness * 0.24),
		height: Math.min(0.82, frame.opening.height * 0.24),
		depth: 0.075
	};
	const placement = sourceFacePlacement(frame, dimensions);
	const measurements = signedEntryMeasurements(frame, placement);
	const evidence = createEvidence(frame, placement, measurements, context);
	return {
		id: evidence.id,
		shape: 'box',
		solid: false,
		walkable: false,
		noEdge: true,
		color: material.color || '#b87514',
		mapImage: material.mapImage || null,
		textureUrl: material.textureUrl || null,
		mapRepeat: [1, 1],
		position: placement.worldPosition,
		size: {
			x: dimensions.width,
			y: dimensions.height,
			z: dimensions.depth
		},
		rotation: placement.rotation,
		userData: { AwtsmoosMezuza: evidence }
	};
}

function createEvidence(frame, placement, measurements, context) {
	return {
		id: `${frame.doorId}-mezuza`,
		doorId: frame.doorId,
		wallId: frame.wallId,
		houseId: frame.houseId,
		doorwayKind: context.doorwayKind || 'exterior',
		sourceRoomId: context.sourceRoomId || 'outside',
		targetRoomId: context.targetRoomId || frame.houseId,
		entrySide: 'right',
		enteringDirection: frame.basis.inward,
		enteringRight: frame.entry.right,
		wallFaceDirection: frame.basis.outward,
		localPosition: {
			x: placement.localX,
			y: placement.worldPosition.y - frame.opening.bottomY,
			z: placement.sourceDepth
		},
		worldPosition: placement.worldPosition,
		position: {
			x: placement.worldPosition.x,
			z: placement.worldPosition.z
		},
		slantRadians: placement.rotation.z,
		dotFromOpeningCenter: measurements.rightDot,
		sourceFaceDot: measurements.sourceDot,
		facingDot: measurements.facingDot,
		placement: 'source-side-exterior-face',
		facing: 'visible-from-source-room',
		verifiedBy: 'entry-right-and-source-face-world-basis'
	};
}
