//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PersonFactory
 * @description
 * A citizen is not a glowing block but a readable body, face, garment, and gait.
 * The Awtsmoos renews every soul beyond geometry; this Awtsmoos.com silhouette
 * remains intentionally low-poly so many remembered people may share one city.
 */
export function createPerson(parts, options = {}) {
	const skin = options.skinHue ?? 28;
	const cloth = options.hue ?? 202;
	const group = parts.group(options.name || 'citizen', [
		parts.part({ name: 'torso', hue: cloth, position: [0, 1.15, 0], scale: [0.62, 0.82, 0.38] }),
		parts.part({ primitive: 'sphere', name: 'head', hue: skin, lightness: 0.68, position: [0, 2.02, 0], scale: [0.52, 0.58, 0.5] }),
		parts.part({ name: 'left-arm', hue: cloth, position: [-0.48, 1.18, 0], scale: [0.18, 0.75, 0.2] }),
		parts.part({ name: 'right-arm', hue: cloth, position: [0.48, 1.18, 0], scale: [0.18, 0.75, 0.2] }),
		parts.part({ name: 'left-leg', hue: options.legHue ?? 218, position: [-0.2, 0.35, 0], scale: [0.22, 0.72, 0.28] }),
		parts.part({ name: 'right-leg', hue: options.legHue ?? 218, position: [0.2, 0.35, 0], scale: [0.22, 0.72, 0.28] })
	], { semanticType: options.type || 'person', personName: options.personName || options.name || 'Citizen' });
	group.position.set(...(options.position || [0, 0, 0]));
	group.scale.setScalar(options.scale ?? 0.55);
	group.userData.baseY = group.position.y;
	group.userData.phase = options.phase || 0;
	return group;
}

export function animatePerson(person, elapsed, moving = true) {
	const phase = elapsed * (moving ? 4 : 2) + person.userData.phase;
	person.position.y = person.userData.baseY + Math.sin(phase) * (moving ? 0.035 : 0.018);
	const leftArm = person.getObjectByName('left-arm');
	const rightArm = person.getObjectByName('right-arm');
	const leftLeg = person.getObjectByName('left-leg');
	const rightLeg = person.getObjectByName('right-leg');
	const swing = Math.sin(phase) * (moving ? 0.42 : 0.08);
	if (leftArm) leftArm.rotation.x = swing;
	if (rightArm) rightArm.rotation.x = -swing;
	if (leftLeg) leftLeg.rotation.x = -swing * 0.65;
	if (rightLeg) rightLeg.rotation.x = swing * 0.65;
}
