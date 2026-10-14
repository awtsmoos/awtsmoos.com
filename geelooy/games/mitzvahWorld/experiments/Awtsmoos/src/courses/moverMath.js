// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moverMath.js
 * @description Pure mover kinematics: sinusoidal oscillators and constant-speed
 * path followers. Time is course seconds; positions are world meters.
 * The Awtsmoos moves every platform in its appointed circuit without haste.
 */

const TAU = Math.PI * 2;

function finite(value, fallback = 0) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

/**
 * Position of a mover's CENTER at course time t.
 * @param {object} mover Mover definition.
 * @param {number} t Course time in seconds.
 * @returns {{x:number,y:number,z:number}} Center position (y = box center).
 */
export function moverPositionAt(mover, t) {
	if (mover.kind === 'path') return pathPositionAt(mover, t);
	return sinusoidPositionAt(mover, t);
}

function sinusoidPositionAt(mover, t) {
	const base = mover.base || {};
	const top = finite(base.top);
	const thickness = finite(mover.thickness, 1);
	const center = {
		x: finite(base.x),
		y: top - thickness / 2,
		z: finite(base.z)
	};
	const phase = finite(mover.phase);
	const period = Math.max(0.001, finite(mover.period, 1));
	const offset = finite(mover.amplitude) * Math.sin(TAU * (t / period) + phase);
	if (mover.axis === 'x') center.x += offset;
	else if (mover.axis === 'z') center.z += offset;
	else center.y += offset;
	return center;
}

function pathPositionAt(mover, t) {
	const waypoints = mover.path || [];
	if (waypoints.length === 0) return { x: 0, y: 0, z: 0 };
	if (waypoints.length === 1) return waypointCenter(mover, waypoints[0]);
	const period = Math.max(0.001, finite(mover.period, 1));
	const phase = finite(mover.phase);
	// Constant speed along the loop: total length first.
	const segments = [];
	let total = 0;
	for (let i = 0; i < waypoints.length; i++) {
		const a = waypointCenter(mover, waypoints[i]);
		const b = waypointCenter(mover, waypoints[(i + 1) % waypoints.length]);
		const length = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
		segments.push({ a, b, length });
		total += length;
	}
	if (total <= 0) return { ...segments[0].a };
	let distance = (((t / period) + phase / TAU) % 1 + 1) % 1 * total;
	for (const segment of segments) {
		if (distance <= segment.length || segment === segments[segments.length - 1]) {
			const ratio = segment.length > 0 ? Math.min(1, distance / segment.length) : 0;
			return {
				x: segment.a.x + (segment.b.x - segment.a.x) * ratio,
				y: segment.a.y + (segment.b.y - segment.a.y) * ratio,
				z: segment.a.z + (segment.b.z - segment.a.z) * ratio
			};
		}
		distance -= segment.length;
	}
	return { ...segments[segments.length - 1].b };
}

function waypointCenter(mover, waypoint) {
	const thickness = finite(mover.thickness, 1);
	return {
		x: finite(waypoint[0]),
		y: finite(waypoint[2]) - thickness / 2,
		z: finite(waypoint[1])
	};
}

/**
 * Displacement of a mover's center between two course times.
 * @param {object} mover Mover definition.
 * @param {number} tPrev Earlier course time.
 * @param {number} tNow Later course time.
 * @returns {{x:number,y:number,z:number}} Center delta.
 */
export function moverDelta(mover, tPrev, tNow) {
	const a = moverPositionAt(mover, tPrev);
	const b = moverPositionAt(mover, tNow);
	return { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
}

/**
 * Axis-aligned box of a mover at course time t.
 * @param {object} mover Mover definition.
 * @param {number} t Course time.
 * @returns {{minX:number,maxX:number,minY:number,maxY:number,minZ:number,maxZ:number}} Box.
 */
export function moverBoxAt(mover, t) {
	const center = moverPositionAt(mover, t);
	const halfW = finite(mover.w, 1) / 2;
	const halfD = finite(mover.d, 1) / 2;
	const halfH = finite(mover.thickness, 1) / 2;
	return {
		minX: center.x - halfW,
		maxX: center.x + halfW,
		minY: center.y - halfH,
		maxY: center.y + halfH,
		minZ: center.z - halfD,
		maxZ: center.z + halfD
	};
}

/**
 * Sweeper arm angle (radians) at course time t, measured from +Z toward +X.
 * @param {object} hazard Sweeper definition.
 * @param {number} t Course time.
 * @returns {number} Arm angle.
 */
export function sweeperAngleAt(hazard, t) {
	const period = Math.max(0.001, finite(hazard.period, 1));
	return TAU * (t / period) + finite(hazard.phase);
}
