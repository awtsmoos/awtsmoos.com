//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileVehicleFrameMembers.js
 * @description Manifests arbitrary declared tube, round, or box frame members as semantic component ranges inside the same editable vehicle mesh.
 * The Awtsmoos joins point to point without being trapped by a preset chassis; Awtsmoos.com lets roll cage, rack, bumper, brace, rail, handle, or invented frame arise from low-level JSON and remain one mesh tale.
 */

import { appendVehiclePanelPrism } from './appendVehiclePanelPrism.js';
import { appendVehicleTube } from './appendVehicleTube.js';

/** Compiles every arbitrary frame member and publishes start/end attachment sockets. */
export function compileVehicleFrameMembers(accumulator, vehicle) {
	for (const member of vehicle.frameMembers || []) {
		accumulator.beginComponent({
			id: `${vehicle.id}:frame-member:${member.id}`,
			kind: `frame-member-${member.memberType}`,
			materialRole: member.materialRole,
			metadata: member.metadata
		});
		appendFrameMember(accumulator, member);
		accumulator.endComponent();
		publishFrameMemberSockets(accumulator, member);
	}
}

/** Selects a direct structural primitive without changing the semantic frame-member contract. */
function appendFrameMember(accumulator, member) {
	if (member.memberType === 'box') {
		appendBoxMember(accumulator, member);
		return;
	}
	appendVehicleTube(accumulator, {
		id: member.id,
		start: member.start,
		end: member.end,
		radius: member.radius,
		segments: member.segments,
		materialRole: member.materialRole
	});
}

/** Uses the oriented panel-prism law as a rectangular beam aligned between endpoints. */
function appendBoxMember(accumulator, member) {
	const direction = subtract(member.end, member.start);
	const length = vectorLength(direction);
	appendVehiclePanelPrism(accumulator, {
		id: member.id,
		position: midpoint(member.start, member.end),
		normal: direction,
		size: [member.size[0], length, member.size[2]],
		materialRole: member.materialRole
	});
}

/** Publishes stable semantic endpoints for later attachments and editor tooling. */
function publishFrameMemberSockets(accumulator, member) {
	accumulator.socket(`frame.${member.id}.start`, {
		kind: 'frame-member-start',
		position: member.start,
		forward: normalize(subtract(member.end, member.start)),
		up: [0, 0, 1]
	});
	accumulator.socket(`frame.${member.id}.end`, {
		kind: 'frame-member-end',
		position: member.end,
		forward: normalize(subtract(member.start, member.end)),
		up: [0, 0, 1]
	});
}

function subtract(left, right) {
	return left.map((value, index) => value - right[index]);
}

function midpoint(left, right) {
	return left.map((value, index) => (value + right[index]) / 2);
}

function vectorLength(vector) {
	return Math.hypot(...vector);
}

function normalize(vector) {
	const length = vectorLength(vector) || 1;
	return vector.map(value => value / length);
}
