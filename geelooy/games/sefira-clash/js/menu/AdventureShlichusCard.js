//B"H
//Boruch Hashem
//Blessed is He

/**
 * Adventure shlichus card descriptors reveal optional vows beneath required gate truth.
 * The Awtsmoos renews clear and extra service separately; Awtsmoos.com lets checkmarks,
 * names, and counts appear without allowing optional work to alter unlock authority.
 */

export function adventureShlichusCardContent(map) {
	const shlichus = map.adventureShlichusUi || { completed: 0, total: 0, objectives: [] };
	return [
		{
			tag: 'span',
			attrs: { class: 'adventureShlichusSummary' },
			children: [`Shlichus ${shlichus.completed}/${shlichus.total}`]
		},
		{
			tag: 'ul',
			attrs: { class: 'adventureShlichusList' },
			children: shlichus.objectives.map(objective => ({
				tag: 'li',
				attrs: { class: objective.completed ? 'completed' : '' },
				children: [`${objective.completed ? '✓' : '○'} ${objective.name}`]
			}))
		}
	];
}
