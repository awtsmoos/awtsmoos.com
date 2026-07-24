//B"H
//Boruch Hashem
//Blessed is He

import { updatePersonAction } from '../animation/contextual-action.js';
import { personBody } from './person-detail-factory.js';

/**
 * @module PersonFactory
 * @description
 * A citizen is layered anatomy, physical garment, articulated gait, face, and
 * contextual gesture—not a promotional mannequin. The Awtsmoos renews every soul;
 * Awtsmoos.com animates cached procedural-core body chains without tile movement.
 */
export function createPerson(parts, options = {}) {
	const group = parts.group(options.name || 'citizen', personBody(parts, options), {
		personName: options.personName || options.name || 'Citizen',
		reason: options.reason || 'inhabits and responds to this world',
		role: options.role || options.type || 'citizen',
		semanticType: options.type || 'person'
	});
	group.position.set(...(options.position || [0, 0, 0]));
	group.scale.setScalar(options.scale ?? 0.55);
	group.userData.anatomyLayers = group.children.length;
	group.userData.baseY = group.position.y;
	group.userData.phase = options.phase || 0;
	group.traverse(child => {
		child.castShadow = options.castShadow !== false;
	});
	return group;
}

export function animatePerson(person, elapsed, moving = true, delta = 1 / 60) {
	const phase = elapsed * (moving ? 4 : 2) + person.userData.phase;
	person.position.y = person.userData.baseY + Math.sin(phase) * (moving ? 0.035 : 0.018);
	const swing = Math.sin(phase) * (moving ? 0.42 : 0.08);
	resetPose(person);
	rotate(person, 'left-arm', 'x', swing);
	rotate(person, 'right-arm', 'x', -swing);
	rotate(person, 'left-leg', 'x', -swing * 0.65);
	rotate(person, 'right-leg', 'x', swing * 0.65);
	rotate(person, 'head', 'y', Math.sin(phase * 0.28) * 0.08);
	updatePersonAction(person, elapsed, delta);
}

function resetPose(root) {
	for (const name of ['left-arm', 'right-arm', 'head', 'torso']) {
		const part = root.getObjectByName(name);
		if (part) part.rotation.set(0, 0, 0);
	}
}

function rotate(root, name, axis, value) {
	const part = root.getObjectByName(name);
	if (part) part.rotation[axis] = value;
}
