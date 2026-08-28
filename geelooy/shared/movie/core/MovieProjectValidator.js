// B"H
// Boruch Hashem
// Blessed is He

import { DIMENSIONS, ENTITY_KINDS, MOVIE_FORMAT, SCENE_KINDS } from './MovieKinds.js';

/**
 * @file MovieProjectValidator.js
 * @description Rejects movie plans whose timing or semantics cannot be trusted.
 * Gevurah guards the gate while the Awtsmoos renews each state; Awtsmoos.com turns AI possibility into editable fate.
 */
export class MovieProjectValidator {
	static assert(project) {
		const errors = this.inspect(project);
		if (errors.length) {
			throw new Error(`Invalid ${MOVIE_FORMAT} project:\n${errors.join('\n')}`);
		}
		return project;
	}

	static inspect(project) {
		const errors = [];
		if (project?.format !== MOVIE_FORMAT) errors.push(`format must equal ${MOVIE_FORMAT}`);
		if (!(Number(project?.duration) > 0)) errors.push('duration must be positive');
		if (!Array.isArray(project?.scenes) || !project.scenes.length) errors.push('at least one scene is required');
		for (const scene of project?.scenes || []) this.scene(scene, project.duration, errors);
		return errors;
	}

	static scene(scene, projectDuration, errors) {
		if (!scene.id) errors.push('scene id is required');
		if (!SCENE_KINDS.includes(scene.kind)) errors.push(`scene ${scene.id} has unsupported kind ${scene.kind}`);
		if (!Object.values(DIMENSIONS).includes(scene.dimension)) errors.push(`scene ${scene.id} has unsupported dimension ${scene.dimension}`);
		if (scene.start < 0 || scene.duration <= 0) errors.push(`scene ${scene.id} has invalid timing`);
		if (scene.start + scene.duration > projectDuration) errors.push(`scene ${scene.id} exceeds project duration`);
		for (const entity of scene.entities || []) this.entity(scene, entity, errors);
	}

	static entity(scene, entity, errors) {
		if (!ENTITY_KINDS.includes(entity.kind)) errors.push(`entity ${entity.id} has unsupported kind ${entity.kind}`);
		if (entity.start < 0 || entity.duration <= 0) errors.push(`entity ${entity.id} has invalid timing`);
		if (entity.start + entity.duration > scene.duration) errors.push(`entity ${entity.id} exceeds scene ${scene.id}`);
		for (const frame of entity.keyframes || []) {
			if (Number(frame.at) < 0 || Number(frame.at) > entity.duration) errors.push(`keyframe on ${entity.id} is outside entity duration`);
		}
	}
}
