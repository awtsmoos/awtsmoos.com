//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmActionClassifier
 * @description
 * A single finite vocabulary classifies mastery, reputation, memory, and account
 * notices. The Awtsmoos joins all consequence; Awtsmoos.com keeps the orchestrator
 * small and prevents new account verbs from scattering hidden meanings across files.
 */
export function skillFor(id, event) {
	if (id.startsWith('gather:')) return 'foraging';
	if (id === 'craft:medicine' || id === 'home:recover') return 'medicine';
	if (id.startsWith('craft:') || id.startsWith('repair:')) return 'crafting';
	if (id.startsWith('trade:') || id.startsWith('bank')) return 'trade';
	if (id.startsWith('bridge:') || id.startsWith('home:')) return 'construction';
	if (id.startsWith('care:')) return 'animalCare';
	if (id.startsWith('travel:')) return 'navigation';
	if (id.startsWith('encounter:') || id.startsWith('equip:') || id.startsWith('unequip:')) return 'defense';
	if (id.startsWith('investigate:') || id.startsWith('talk:') || id.startsWith('quest:')) return 'investigation';
	if (id.startsWith('event:')) return event?.skill || 'rescue';
	return 'construction';
}

export function consequenceFor(id) {
	return id.startsWith('event:') || id.startsWith('encounter:') ? 1.6 : id.startsWith('bridge:') ? 1.35 : 1;
}

export function reputationFor(id) {
	if (id.startsWith('trade:') || id.startsWith('bank')) return 'honest';
	if (id.startsWith('event:') || id.startsWith('care:') || id.startsWith('encounter:')) return 'merciful';
	if (id.startsWith('bridge:') || id.startsWith('home:') || id.startsWith('repair:')) return 'reliable';
	return 'skilled';
}

export function memoryFor(id, summary, state) {
	const type = id.startsWith('trade:') || id.startsWith('bank') ? 'trade'
		: id.startsWith('bridge:') ? 'construction'
		: id.startsWith('event:') || id.startsWith('encounter:') ? 'rescue'
		: id.startsWith('care:') ? 'care'
		: id.startsWith('quest:') ? 'promise' : 'discovery';
	return {
		type,
		sourceId: state.player.id,
		targetId: id.split(':')[1] || 'covenant-crossing',
		summary,
		importance: type === 'rescue' ? 82 : 48
	};
}

export function accountNotice(message, quests, achievements) {
	const parts = [message];
	if (quests.length) parts.push(`Quest complete: ${quests.join(', ')}.`);
	if (achievements.length) parts.push(`Achievement: ${achievements.join(', ')}.`);
	return parts.join(' ');
}
