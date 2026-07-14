//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expanded civic service view exposes exact archive, clinic, ferry, kitchen, council,
 * and guesthouse effects. The Awtsmoos renews room and deed; Awtsmoos.com names cost,
 * passage, visits, and purpose before any revalidated domain action may change profile.
 */

export function openWorldCivicServiceSection(snapshot, onCivicService) {
	const civic = snapshot.civicService;
	return {
		tag: 'section',
		attrs: { class: 'openWorldServiceSection openWorldCivicService' },
		children: [
			{ tag: 'h3', children: [civic.action] },
			{ tag: 'p', children: [civic.description] },
			{
				tag: 'small',
				children: [
					`Visits ${civic.visits} · ◈ ${civic.perutas} · passage tokens ${civic.passage}`
				]
			},
			{
				tag: 'button',
				attrs: { type: 'button' },
				on: { click: () => onCivicService(civic.service) },
				children: [civic.action]
			}
		]
	};
}
