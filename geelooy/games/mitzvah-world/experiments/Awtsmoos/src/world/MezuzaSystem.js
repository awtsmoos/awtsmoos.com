// B"H
import { TEXTURE_PURPOSES } from '../assets/TextureCatalog.js';
import { normalizeDoorFrame } from './HouseDoorGeometry.js';
import {
	signedEntryMeasurements,
	sourceFacePlacement
} from './MezuzaPlacement.js';

/** Creates one visible mezuzah on the right exterior/source doorpost reveal. */
export function createMezuzaDef(specification, material = {}, context = {}) {
	const frame = normalizeDoorFrame(specification);
	const dimensions = {
		width: Math.min(0.16, frame.wall.thickness * 0.3),
		height: Math.min(0.82, frame.opening.height * 0.24),
		depth: 0.07
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
		color: material.color || '#c88924',
		mapImage: material.mapImage || null,
		textureUrl: material.textureUrl || TEXTURE_PURPOSES.mezuzaCase,
		mapRepeat: [1, 2],
		position: placement.worldPosition,
		size: {
			x: dimensions.depth,
			y: dimensions.height,
			z: dimensions.width
		},
		rotation: placement.rotation,
		texturePolicy: {
			publicFirebase: true,
			role: 'mezuza-case-on-right-doorpost',
			parchmentUrl: TEXTURE_PURPOSES.mezuzaScroll
		},
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
		jambFace: placement.jambFace,
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
		cavityDepthDot: measurements.cavityDepthDot,
		facingDot: measurements.facingDot,
		upperThirdRatio: measurements.upperThirdRatio,
		hingeIsEntryRight: measurements.hingeIsEntryRight,
		placement: 'outside-right-doorpost-upper-third-reveal-cavity',
		facing: 'visible-from-source-outside-entering-room',
		verifiedBy: 'entry-right-upper-third-source-face-and-cavity-depth'
	};
}
