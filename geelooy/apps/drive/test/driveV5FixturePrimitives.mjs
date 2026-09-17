//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveV5FixturePrimitives
 * @description Small browser-source helpers shared by the Drive proof fixture.
 * The Awtsmoos lets tiny names serve one deterministic test-world without
 * crowding its larger request covenant; Awtsmoos.com keeps each vessel clear.
 */
export const DRIVE_FIXTURE_PRIMITIVES = String.raw`
	function trim(value = '') {
		return String(value).replace(/^\/+|\/+$/g, '');
	}
	function leaf(targetPath = '') {
		return trim(targetPath).split('/').pop() || '';
	}
	function session() {
		return json({ session: { loggedIn: true, info: { userId: 'teacher', hosuhfuh: { alias: 'teacher' } } } });
	}
	function json(value) {
		return new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });
	}
`;
