// B"H
// Boruch Hashem
// Blessed is He

const MECHANICS = Object.freeze([
	'chain-current',
	'moving-feast',
	'fragile-streets',
	'landmark-awakening',
	'orb-harvest'
]);
const HAZARDS = Object.freeze(['traffic-surge', 'rival-hunt', 'spark-storm', 'gravity-well']);
const EVENTS = Object.freeze(['market-rush', 'letter-rain', 'tower-awakening', 'garden-bloom']);
const MASTERY = Object.freeze(['bonus', 'rank', 'chain', 'captures', 'time']);

/** Awtsmoos.com rotates campaign pressure without introducing hidden randomness. */
export function campaignModifiers(chapter, localIndex) {
	const nodeType = resolveNodeType(localIndex);
	const bonusCategory = chapter.bonusPool[localIndex % chapter.bonusPool.length];
	return Object.freeze({
		nodeType,
		mechanic: MECHANICS[(chapter.index + localIndex) % MECHANICS.length],
		hazard: HAZARDS[(chapter.index * 2 + localIndex) % HAZARDS.length],
		event: EVENTS[(chapter.index + localIndex * 2) % EVENTS.length],
		mastery: mastery(MASTERY[(chapter.index + localIndex) % MASTERY.length], localIndex),
		bonusCategory,
		shop: localIndex === 4 || localIndex === 14,
		secret: localIndex % 5 === 2,
		boss: nodeType === 'boss'
	});
}

function resolveNodeType(localIndex) {
	if (localIndex === 19) return 'boss';
	if (localIndex === 9) return 'event';
	if (localIndex === 4 || localIndex === 14) return 'shop';
	return 'district';
}

function mastery(type, localIndex) {
	const scale = 1 + Math.floor(localIndex / 5);
	if (type === 'rank') return Object.freeze({ type, target: localIndex < 10 ? 2 : 1, label: 'Finish near the top of the city ranking' });
	if (type === 'chain') return Object.freeze({ type, target: 10 + scale * 5, label: `Build a district chain of ${10 + scale * 5}` });
	if (type === 'captures') return Object.freeze({ type, target: 30 + scale * 10, label: `Consume ${30 + scale * 10} vessels` });
	if (type === 'time') return Object.freeze({ type, target: 8 + scale * 2, label: `Finish with ${8 + scale * 2} seconds remaining` });
	return Object.freeze({ type: 'bonus', target: 1, label: 'Complete the district bonus objective' });
}
