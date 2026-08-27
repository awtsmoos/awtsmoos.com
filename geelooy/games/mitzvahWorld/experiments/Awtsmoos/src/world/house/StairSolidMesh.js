// B"H
/** Builds one watertight landing-and-stair prism with no internal faces. */
export function buildStairSolidMesh(layout, tileWorld) {
	const mesh = { vertices: [], faces: [], uvs: [], topFaces: [] };
	const first = layout.steps[0];
	const last = layout.steps.at(-1);
	const x0 = layout.lowerLanding.centerX - layout.width / 2;
	const x1 = layout.lowerLanding.centerX + layout.width / 2;
	const baseY = layout.fromY - 0.22;
	const landingFront = layout.lowerLanding.centerZ + layout.lowerLanding.depth / 2;
	const stairStart = first.centerZ + first.depth / 2;
	const stairEnd = last.centerZ - last.depth / 2;
	appendTop(mesh, x0, x1, landingFront, stairStart, layout.fromY, tileWorld);
	appendFront(mesh, x0, x1, landingFront, baseY, layout.fromY, tileWorld);
	appendSides(mesh, x0, x1, landingFront, stairStart, baseY, layout.fromY, tileWorld);
	let previousTop = layout.fromY;
	for (const step of layout.steps) {
		const front = step.centerZ + step.depth / 2;
		const back = step.centerZ - step.depth / 2;
		appendRiser(mesh, x0, x1, front, previousTop, step.topY, tileWorld);
		appendTop(mesh, x0, x1, front, back, step.topY, tileWorld);
		appendSides(mesh, x0, x1, front, back, baseY, step.topY, tileWorld);
		previousTop = step.topY;
	}
	appendBack(mesh, x0, x1, stairEnd, baseY, layout.toY, tileWorld);
	appendBottom(mesh, x0, x1, stairEnd, landingFront, baseY, tileWorld);
	return mesh;
}

export function stairGeometrySignature(definition) {
	return definition.vertices
		.map((point) => point.map((value) => value.toFixed(4)).join(','))
		.join('|');
}

function appendTop(mesh, x0, x1, front, back, y, tile) {
	mesh.topFaces.push(mesh.faces.length);
	quad(mesh, [
		[x0, y, front], [x1, y, front],
		[x1, y, back], [x0, y, back]
	], x1 - x0, front - back, tile);
}

function appendRiser(mesh, x0, x1, z, low, high, tile) {
	quad(mesh, [
		[x0, low, z], [x1, low, z],
		[x1, high, z], [x0, high, z]
	], x1 - x0, high - low, tile);
}

function appendFront(mesh, x0, x1, z, low, high, tile) {
	appendRiser(mesh, x0, x1, z, low, high, tile);
}

function appendBack(mesh, x0, x1, z, low, high, tile) {
	quad(mesh, [
		[x1, low, z], [x0, low, z],
		[x0, high, z], [x1, high, z]
	], x1 - x0, high - low, tile);
}

function appendSides(mesh, x0, x1, front, back, low, high, tile) {
	quad(mesh, [
		[x0, low, back], [x0, low, front],
		[x0, high, front], [x0, high, back]
	], front - back, high - low, tile);
	quad(mesh, [
		[x1, low, front], [x1, low, back],
		[x1, high, back], [x1, high, front]
	], front - back, high - low, tile);
}

function appendBottom(mesh, x0, x1, back, front, y, tile) {
	quad(mesh, [
		[x0, y, back], [x1, y, back],
		[x1, y, front], [x0, y, front]
	], x1 - x0, front - back, tile);
}

function quad(mesh, points, width, height, tile) {
	const start = mesh.vertices.length;
	mesh.vertices.push(...points);
	mesh.faces.push([start, start + 1, start + 2, start + 3]);
	mesh.uvs.push(
		0, 0,
		width / tile, 0,
		width / tile, height / tile,
		0, height / tile
	);
}
