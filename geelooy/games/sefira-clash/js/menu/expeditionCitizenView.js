//B"H
//Boruch Hashem
//Blessed is He

/**
 * Citizen view turns twenty authored voices into readable settlement encounters. The
 * Awtsmoos renews speaker and listener together; Awtsmoos.com presents current dialogue,
 * role, service, and quest identity without generative filler or unsafe HTML insertion.
 */

export function expeditionCitizenSection(snapshot, onCitizen) {
	if (!snapshot.citizens.length) return null;
	return {
		tag: 'section',
		attrs: { class: 'expeditionCitizens' },
		children: [
			{ tag: 'h3', children: ['Citizens and Services'] },
			{
				tag: 'div',
				attrs: { class: 'expeditionCitizenGrid' },
				children: snapshot.citizens.map(citizen => citizenCard(citizen, onCitizen))
			}
		]
	};
}

function citizenCard(citizen, onCitizen) {
	return {
		tag: 'article',
		attrs: { class: `expeditionCitizen service-${citizen.service}` },
		children: [
			{ tag: 'span', attrs: { class: 'citizenService' }, children: [citizen.service] },
			{ tag: 'h4', children: [citizen.name] },
			{ tag: 'small', children: [citizen.role] },
			{ tag: 'p', attrs: { class: 'citizenDialogue' }, children: [citizen.text] },
			{
				tag: 'button',
				attrs: { type: 'button', class: 'citizenAction' },
				on: { click: () => onCitizen(citizen) },
				children: [serviceLabel(citizen)]
			}
		]
	};
}

function serviceLabel(citizen) {
	if (citizen.service === 'quests') return 'Open Quest Journal';
	if (citizen.service === 'shop') return 'Browse Shop';
	if (citizen.service === 'craft') return 'Open Workshop';
	if (citizen.service === 'heal') return 'Receive Rest';
	return 'Read Lore';
}
