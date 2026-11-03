//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioStagePieces.js
 * @description Builds procedural set pieces for the native stage from shared render-graph descriptors.
 * The Awtsmoos forms stone, pillar, and figure without any borrowed model file;
 * Awtsmoos.com generates every set piece as real geometry with a soft contact shadow, while chossid.glb remains the only external model.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial
} from '../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js';

const PALETTE = Object.freeze({
	box: '#8a6f4d',
	cylinder: '#7d7468',
	sphere: '#b08945',
	arch: '#8a6f4d',
	figure: '#26232e',
	plane: '#5b7ea6'
});

const SHADOW_RADII = Object.freeze({
	box: 2.6,
	cylinder: 1.8,
	sphere: 2,
	arch: 3.4,
	figure: 1.5,
	plane: 2.4
});

/**
 * Create one native group for a stage descriptor whose form is model, character, billboard, backdrop, or piece.
 * The group stands on groundY; its meshes rise from the ground so descriptors need no height bookkeeping.
 */
export function createStudioStagePiece(descriptor, options = {}) {
	const groundY = Number(options.groundY || 0);
	const group = new Group();
	const position = descriptor?.position || { x: 0, y: 0, z: 0 };
	const scale = descriptor?.scale || { x: 1, y: 1, z: 1 };
	group.position.set(Number(position.x || 0), groundY, Number(position.z || 0));
	group.scale.set(
		Math.max(0.05, Number(scale.x || 1)),
		Math.max(0.05, Number(scale.y || 1)),
		Math.max(0.05, Number(scale.z || 1))
	);
	if (Number(descriptor?.rotation || 0)) {
		group.rotation.set(0, Number(descriptor.rotation || 0), 0);
	}
	const primitive = primitiveFor(descriptor);
	const color = descriptor?.color || PALETTE[primitive] || '#8a6f4d';
	for (const mesh of pieceMeshes(primitive, color)) {
		tagMesh(mesh, descriptor);
		group.add(mesh);
	}
	if (descriptor?.form !== 'backdrop') {
		const shadow = new Mesh(
			discGeometry((SHADOW_RADII[primitive] || 2) * 1.15),
			new MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
		);
		shadow.position.set(0, 0.03, 0);
		tagMesh(shadow, descriptor);
		group.add(shadow);
	}
	group.userData = {
		...(group.userData || {}),
		studioKind: descriptor?.kind || 'model3d',
		studioLayerId: descriptor?.layerId || null,
		studioStageForm: descriptor?.form || 'piece'
	};
	return group;
}

function primitiveFor(descriptor) {
	if (descriptor?.form === 'character') return 'figure';
	if (descriptor?.form === 'billboard' || descriptor?.form === 'backdrop') return 'plane';
	return descriptor?.primitive || 'box';
}

function pieceMeshes(primitive, color) {
	const material = new MeshStandardMaterial({ color });
	const solid = geometry => new Mesh(geometry, material);
	switch (primitive) {
		case 'cylinder':
			return [solid(cylinderGeometry(0.95, 4.6, 18))];
		case 'sphere':
			return [solid(sphereGeometry(1.6, 18, 12))];
		case 'arch': {
			const left = solid(boxGeometry(0.9, 4.4, 1.1));
			left.position.set(-2.05, 0, 0);
			const right = solid(boxGeometry(0.9, 4.4, 1.1));
			right.position.set(2.05, 0, 0);
			const beam = solid(boxGeometry(5, 1, 1.1));
			beam.position.set(0, 4.4, 0);
			return [left, right, beam];
		}
		case 'figure': {
			const body = solid(cylinderGeometry(0.55, 2.1, 14));
			const head = solid(sphereGeometry(0.42, 14, 10));
			head.position.set(0, 2.1, 0);
			const brim = solid(cylinderGeometry(0.78, 0.07, 18));
			brim.position.set(0, 2.62, 0);
			const crown = solid(cylinderGeometry(0.44, 0.52, 14));
			crown.position.set(0, 2.66, 0);
			return [body, head, brim, crown];
		}
		case 'plane': {
			const plane = new Mesh(
				planeGeometry(9, 5),
				new MeshStandardMaterial({ color, doubleSided: true })
			);
			return [plane];
		}
		default:
			return [solid(boxGeometry(3.2, 3, 3.2))];
	}
}

function tagMesh(mesh, descriptor) {
	mesh.userData = {
		...(mesh.userData || {}),
		studioKind: descriptor?.kind || 'model3d',
		studioLayerId: descriptor?.layerId || null
	};
}

/** Box geometry rising from y=0 to y=height, with flat face normals. */
export function boxGeometry(width = 1, height = 1, depth = 1) {
	const x = width / 2;
	const z = depth / 2;
	const faces = [
		quad([[-x, 0, z], [x, 0, z], [x, height, z], [-x, height, z]]),
		quad([[x, 0, -z], [-x, 0, -z], [-x, height, -z], [x, height, -z]]),
		quad([[x, 0, z], [x, 0, -z], [x, height, -z], [x, height, z]]),
		quad([[-x, 0, -z], [-x, 0, z], [-x, height, z], [-x, height, -z]]),
		quad([[-x, height, z], [x, height, z], [x, height, -z], [-x, height, -z]]),
		quad([[x, 0, z], [-x, 0, z], [-x, 0, -z], [x, 0, -z]])
	];
	return geometryFromFaces(faces);
}

/** Cylinder geometry rising from y=0, with side, cap, and base faces. */
export function cylinderGeometry(radius = 1, height = 1, segments = 16) {
	const faces = [];
	for (let index = 0; index < segments; index += 1) {
		const a0 = (index / segments) * Math.PI * 2;
		const a1 = ((index + 1) / segments) * Math.PI * 2;
		const p00 = [Math.cos(a0) * radius, 0, Math.sin(a0) * radius];
		const p01 = [Math.cos(a1) * radius, 0, Math.sin(a1) * radius];
		const p10 = [Math.cos(a0) * radius, height, Math.sin(a0) * radius];
		const p11 = [Math.cos(a1) * radius, height, Math.sin(a1) * radius];
		faces.push(quad([p00, p01, p11, p10]));
		faces.push({ verts: [[0, height, 0], p11, p10] });
		faces.push({ verts: [[0, 0, 0], p00, p01] });
	}
	return geometryFromFaces(faces);
}

/** Sphere geometry centered at y=radius so it rests on the ground. */
export function sphereGeometry(radius = 1, widthSegments = 16, heightSegments = 12) {
	const faces = [];
	const point = (phi, theta) => [
		radius * Math.sin(phi) * Math.cos(theta),
		radius + radius * Math.cos(phi),
		radius * Math.sin(phi) * Math.sin(theta)
	];
	for (let row = 0; row < heightSegments; row += 1) {
		const phi0 = (row / heightSegments) * Math.PI;
		const phi1 = ((row + 1) / heightSegments) * Math.PI;
		for (let column = 0; column < widthSegments; column += 1) {
			const theta0 = (column / widthSegments) * Math.PI * 2;
			const theta1 = ((column + 1) / widthSegments) * Math.PI * 2;
			faces.push(quad([
				point(phi0, theta0), point(phi0, theta1),
				point(phi1, theta1), point(phi1, theta0)
			]));
		}
	}
	return geometryFromFaces(faces);
}

/** Vertical plane geometry rising from y=0, for billboards and stage backdrops. */
export function planeGeometry(width = 1, height = 1) {
	const x = width / 2;
	return geometryFromFaces([
		quad([[-x, 0, 0], [x, 0, 0], [x, height, 0], [-x, height, 0]]),
		quad([[x, 0, 0], [-x, 0, 0], [-x, height, 0], [x, height, 0]])
	]);
}

/** Flat disc geometry in the XZ plane for contact shadows and hat brims. */
export function discGeometry(radius = 1, segments = 20) {
	const faces = [];
	for (let index = 0; index < segments; index += 1) {
		const a0 = (index / segments) * Math.PI * 2;
		const a1 = ((index + 1) / segments) * Math.PI * 2;
		faces.push({
			verts: [
				[0, 0, 0],
				[Math.cos(a0) * radius, 0, Math.sin(a0) * radius],
				[Math.cos(a1) * radius, 0, Math.sin(a1) * radius]
			]
		});
	}
	return geometryFromFaces(faces);
}

function quad(verts) {
	return { verts, quad: true };
}

/** Turn face lists into non-indexed BufferGeometry with computed flat normals. */
export function geometryFromFaces(faces) {
	const positions = [];
	const normals = [];
	const uvs = [];
	for (const face of faces) {
		const triangles = face.quad
			? [[face.verts[0], face.verts[1], face.verts[2]], [face.verts[0], face.verts[2], face.verts[3]]]
			: [[face.verts[0], face.verts[1], face.verts[2]]];
		for (const triangle of triangles) {
			const normal = faceNormal(triangle);
			for (const vertex of triangle) {
				positions.push(vertex[0], vertex[1], vertex[2]);
				normals.push(normal[0], normal[1], normal[2]);
				uvs.push(0, 0);
			}
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
	return geometry;
}

function faceNormal([a, b, c]) {
	const ux = b[0] - a[0];
	const uy = b[1] - a[1];
	const uz = b[2] - a[2];
	const vx = c[0] - a[0];
	const vy = c[1] - a[1];
	const vz = c[2] - a[2];
	const nx = uy * vz - uz * vy;
	const ny = uz * vx - ux * vz;
	const nz = ux * vy - uy * vx;
	const length = Math.hypot(nx, ny, nz) || 1;
	return [nx / length, ny / length, nz / length];
}
