// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file courseSchema.js
 * @description Frozen validator for Mitzvah World obstacle-course definitions.
 * The Awtsmoos keeps the course covenant exact before any runner may enter;
 * Awtsmoos.com freezes the schema so authored worlds stay honest forever.
 */

export const COURSE_SCHEMA_VERSION = 'mitzvah-world.course/1';

export const COURSE_SURFACES = Object.freeze(['grass', 'stone', 'wood', 'ice']);
export const COURSE_DIFFICULTIES = Object.freeze(['easy', 'medium', 'hard']);

function isFiniteNumber(value) {
	return typeof value === 'number' && Number.isFinite(value);
}

function checkPoint(errors, point, path) {
	if (!point || typeof point !== 'object') {
		errors.push(`${path} must be an object`);
		return;
	}
	for (const key of ['x', 'z']) {
		if (!isFiniteNumber(point[key])) errors.push(`${path}.${key} must be a finite number`);
	}
	if (point.y !== undefined && !isFiniteNumber(point.y)) {
		errors.push(`${path}.y must be a finite number`);
	}
}

function checkBox(errors, box, path, { needsSurface = true } = {}) {
	if (!box || typeof box !== 'object') {
		errors.push(`${path} must be an object`);
		return;
	}
	for (const key of ['x', 'z', 'w', 'd']) {
		if (!isFiniteNumber(box[key])) errors.push(`${path}.${key} must be a finite number`);
	}
	if (!isFiniteNumber(box.top)) errors.push(`${path}.top must be a finite number`);
	if (box.w <= 0 || box.d <= 0) errors.push(`${path}.w and .d must be positive`);
	if (box.thickness !== undefined && (!isFiniteNumber(box.thickness) || box.thickness <= 0)) {
		errors.push(`${path}.thickness must be a positive number`);
	}
	if (box.visualOnly !== undefined && typeof box.visualOnly !== 'boolean') {
		errors.push(`${path}.visualOnly must be a boolean`);
	}
	if (needsSurface && !COURSE_SURFACES.includes(box.surface)) {
		errors.push(`${path}.surface must be one of ${COURSE_SURFACES.join(', ')}`);
	}
}

/**
 * Validates a course definition against the frozen schema.
 * @param {object} def Course definition candidate.
 * @returns {{valid: boolean, errors: string[]}} Validation receipt.
 */
export function validateCourse(def) {
	const errors = [];
	if (!def || typeof def !== 'object') return { valid: false, errors: ['course must be an object'] };
	if (def.schema !== COURSE_SCHEMA_VERSION) {
		errors.push(`schema must be ${COURSE_SCHEMA_VERSION}`);
	}
	if (typeof def.id !== 'string' || !/^[a-z0-9-]+$/.test(def.id)) {
		errors.push('id must be a lowercase URL-safe slug');
	}
	if (typeof def.name !== 'string' || !def.name.trim()) errors.push('name must be a non-empty string');
	if (!COURSE_DIFFICULTIES.includes(def.difficulty)) {
		errors.push(`difficulty must be one of ${COURSE_DIFFICULTIES.join(', ')}`);
	}
	if (typeof def.description !== 'string' || !def.description.trim()) {
		errors.push('description must be a non-empty string');
	}
	if (!isFiniteNumber(def.parSeconds) || def.parSeconds <= 0) {
		errors.push('parSeconds must be a positive number');
	}
	if (!def.spawn || typeof def.spawn !== 'object') {
		errors.push('spawn must be an object');
	} else {
		checkPoint(errors, def.spawn, 'spawn');
		if (!isFiniteNumber(def.spawn.facing)) errors.push('spawn.facing must be a finite number');
	}
	if (!isFiniteNumber(def.killY)) errors.push('killY must be a finite number');
	if (!def.region || typeof def.region !== 'object') {
		errors.push('region must be an object');
	} else {
		for (const key of ['minX', 'maxX', 'minZ', 'maxZ']) {
			if (!isFiniteNumber(def.region[key])) errors.push(`region.${key} must be a finite number`);
		}
		if (def.region.minX >= def.region.maxX || def.region.minZ >= def.region.maxZ) {
			errors.push('region min must be strictly less than max');
		}
	}
	for (const key of ['checkpoints', 'platforms', 'movers', 'hazards', 'coins']) {
		if (!Array.isArray(def[key])) errors.push(`${key} must be an array`);
	}
	if (errors.length) return { valid: false, errors };
	def.checkpoints.forEach((cp, i) => {
		checkPoint(errors, cp, `checkpoints[${i}]`);
		if (!isFiniteNumber(cp.radius) || cp.radius <= 0) {
			errors.push(`checkpoints[${i}].radius must be a positive number`);
		}
	});
	if (!def.finish || typeof def.finish !== 'object') {
		errors.push('finish must be an object');
	} else {
		checkPoint(errors, def.finish, 'finish');
		if (!isFiniteNumber(def.finish.radius) || def.finish.radius <= 0) {
			errors.push('finish.radius must be a positive number');
		}
	}
	def.platforms.forEach((p, i) => checkBox(errors, p, `platforms[${i}]`));
	const moverIds = new Set();
	def.movers.forEach((m, i) => {
		const path = `movers[${i}]`;
		if (!m || typeof m !== 'object') { errors.push(`${path} must be an object`); return; }
		if (typeof m.id !== 'string' || !m.id) errors.push(`${path}.id must be a non-empty string`);
		else if (moverIds.has(m.id)) errors.push(`${path}.id duplicates ${m.id}`);
		else moverIds.add(m.id);
		if (!isFiniteNumber(m.w) || m.w <= 0 || !isFiniteNumber(m.d) || m.d <= 0) {
			errors.push(`${path}.w and .d must be positive numbers`);
		}
		if (!COURSE_SURFACES.includes(m.surface)) {
			errors.push(`${path}.surface must be one of ${COURSE_SURFACES.join(', ')}`);
		}
		if (!isFiniteNumber(m.period) || m.period <= 0) errors.push(`${path}.period must be positive`);
		if (m.phase !== undefined && !isFiniteNumber(m.phase)) errors.push(`${path}.phase must be a number`);
		if (m.kind === 'sinusoid') {
			if (!['x', 'y', 'z'].includes(m.axis)) errors.push(`${path}.axis must be x, y, or z`);
			checkPoint(errors, m.base, `${path}.base`);
			if (!isFiniteNumber(m.base?.top)) errors.push(`${path}.base.top must be a finite number`);
			if (!isFiniteNumber(m.amplitude) || m.amplitude < 0) {
				errors.push(`${path}.amplitude must be a non-negative number`);
			}
		} else if (m.kind === 'path') {
			if (!Array.isArray(m.path) || m.path.length < 2) {
				errors.push(`${path}.path must be an array of at least 2 waypoints`);
			} else {
				m.path.forEach((wp, j) => {
					if (!Array.isArray(wp) || wp.length !== 3 || !wp.every(isFiniteNumber)) {
						errors.push(`${path}.path[${j}] must be [x, z, top] numbers`);
					}
				});
			}
		} else {
			errors.push(`${path}.kind must be 'sinusoid' or 'path'`);
		}
	});
	def.hazards.forEach((h, i) => {
		const path = `hazards[${i}]`;
		if (!h || typeof h !== 'object') { errors.push(`${path} must be an object`); return; }
		if (h.kind !== 'sweeper') errors.push(`${path}.kind must be 'sweeper'`);
		checkPoint(errors, h.center, `${path}.center`);
		for (const key of ['armLength', 'armWidth', 'armHeight']) {
			if (!isFiniteNumber(h[key]) || h[key] <= 0) errors.push(`${path}.${key} must be positive`);
		}
		if (!isFiniteNumber(h.period) || h.period <= 0) errors.push(`${path}.period must be positive`);
		if (h.phase !== undefined && !isFiniteNumber(h.phase)) errors.push(`${path}.phase must be a number`);
	});
	def.coins.forEach((c, i) => checkPoint(errors, c, `coins[${i}]`));
	return { valid: errors.length === 0, errors };
}
