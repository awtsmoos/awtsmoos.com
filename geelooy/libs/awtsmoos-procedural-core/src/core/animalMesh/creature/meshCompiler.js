// B"H
// Boruch Hashem
// Blessed is He
/**
 * Briah meaning descends through the existing twist-stable animal loft. The
 * Awtsmoos creates every ring now; Awtsmoos.com keeps semantic anatomy above
 * disposable vertices, while one compiler gathers body, limbs, and parts.
 */
import { buildEllipticalLoft } from "../geometry/ellipticalLoft.js";
import { deriveCreatureContentHash } from "./identity.js";

function meshPart(id, geometry, regions) {
	return {
		id,
		positions: new Float32Array(geometry.positions),
		normals: new Float32Array(geometry.normals),
		uvs: new Float32Array(geometry.uvs),
		indices: new Uint32Array(geometry.indices),
		semanticRegionIds: [...regions]
	};
}

function loft(centerline, sections, radialSegments = 12) {
	return buildEllipticalLoft({
		centerline,
		sections,
		radial_segments: radialSegments,
		longitudinal_segments: Math.max(4, (centerline.length - 1) * 5)
	}, { cap_start: true, cap_end: true });
}

function bodyPart(creature) {
	const sections = creature.body.sections;
	return meshPart(creature.body.axialGraphId, loft(
		sections.map((section) => section.position),
		sections.map((section, index) => ({
			t: index / Math.max(1, sections.length - 1),
			half_width: section.ellipticalRadius[0],
			half_height: section.ellipticalRadius[1],
			rotation: section.roll
		})), 16
	), ["body.base", ...sections.map((section) => section.id)]);
}

function limbAnchor(creature, limb) {
	const sections = creature.body.sections;
	const label = String(limb.parentAnatomicalAnchor || "torso");
	const ratio = /anterior|front|upper/.test(label)
		? 0.72
		: /posterior|rear|lower/.test(label) ? 0.28 : 0.5;
	const section = sections[Math.round((sections.length - 1) * ratio)];
	const side = limb.side === "left" ? -1 : limb.side === "right" ? 1 : 0;
	return [section.position[0], section.position[1], section.position[2] + side * section.ellipticalRadius[0]];
}

function limbPart(creature, limb) {
	let point = limbAnchor(creature, limb);
	const centerline = [[...point]];
	for (const segment of limb.segments) {
		point = point.map((value, axis) => value + segment.restDirection[axis] * segment.length);
		centerline.push([...point]);
	}
	const sections = [{ t: 0, half_width: limb.segments[0].radiusStart, half_height: limb.segments[0].radiusStart, rotation: 0 }];
	limb.segments.forEach((segment, index) => sections.push({
		t: (index + 1) / limb.segments.length,
		half_width: segment.radiusEnd,
		half_height: segment.radiusEnd,
		rotation: 0
	}));
	return meshPart(limb.id, loft(centerline, sections, 8), [limb.id, ...limb.segments.map((segment) => segment.id)]);
}

function partPosition(creature, part) {
	const anchor = creature.attachments.find((entry) => entry.partId === part.id);
	const sections = creature.body.sections;
	const amount = Math.max(0, Math.min(1, Number(anchor?.axialPosition ?? 0.5)));
	const index = Math.round(amount * (sections.length - 1));
	const base = sections[index].position;
	return base.map((value, axis) => value + Number(part.transform?.position?.[axis] || 0));
}

function detailPart(creature, part) {
	const start = partPosition(creature, part);
	const scale = part.transform?.scale || [1, 1, 1];
	const radius = Math.max(0.03, Number(part.parameters?.radius || 0.12) * Math.max(...scale));
	const end = [start[0], start[1] + Math.max(0.08, Number(part.parameters?.length || 0.18)), start[2]];
	return meshPart(part.id, loft([start, end], [
		{ t: 0, half_width: radius, half_height: radius, rotation: 0 },
		{ t: 1, half_width: radius * 0.7, half_height: radius * 0.7, rotation: 0 }
	], 8), [part.id, part.materialRegion]);
}

function mergeParts(parts, sourceBriahHash) {
	const positions = [], normals = [], uvs = [], indices = [];
	let vertexOffset = 0;
	for (const part of parts) {
		positions.push(...part.positions); normals.push(...part.normals); uvs.push(...part.uvs);
		indices.push(...Array.from(part.indices, (index) => index + vertexOffset));
		vertexOffset += part.positions.length / 3;
	}
	const summary = { partCount: parts.length, vertices: positions.length / 3, triangles: indices.length / 3 };
	return {
		type: "asiyah-creature-mesh", sourceBriahHash, parts,
		positions: new Float32Array(positions), normals: new Float32Array(normals),
		uvs: new Float32Array(uvs), indices: new Uint32Array(indices), summary,
		preservationReport: { semanticRegions: "preserved", stableReferences: "semantic-source-ids" },
		contentHash: deriveCreatureContentHash({ sourceBriahHash, summary })
	};
}

export function compileCreatureMesh(creature) {
	const parts = [bodyPart(creature), ...creature.limbs.map((limb) => limbPart(creature, limb)), ...creature.parts.map((part) => detailPart(creature, part))];
	return mergeParts(parts, creature.contentHash);
}

export function compileCreatureLods(mesh, options = {}) {
	const ratios = options.lodRatios || Array.from({ length: options.lodLevels || 3 }, (_, index) => 1 / (2 ** index));
	return { type: "creature-lod-set", levels: ratios.map((ratio, level) => ({ level, ratio, estimatedTriangles: Math.max(4, Math.round(mesh.summary.triangles * ratio)), sourceMeshHash: mesh.contentHash })) };
}
