//B"H
//Boruch Hashem
//Blessed is He

/**
 * Dialogue view reveals a nearby citizen's role, present activity, relationship, and
 * authored lines. The Awtsmoos renews voice and attention; Awtsmoos.com offers one
 * explicit Speak action whose consequence remains guarded by current domain presence.
 */

export function openWorldDialogueSection(snapshot, onSpeak) {
	const dialogue = snapshot.dialogue;
	if (!dialogue) return missingCitizen();
	return {
		tag: 'section',
		attrs: { class: 'openWorldServiceSection openWorldDialogue' },
		children: [
			{ tag: 'span', attrs: { class: 'openWorldTag' }, children: [dialogue.role] },
			{ tag: 'h3', children: [dialogue.name] },
			{
				tag: 'p',
				children: [`Currently ${dialogue.activity} · relationship ${dialogue.relationship}`]
			},
			{
				tag: 'div',
				attrs: { class: 'openWorldDialogueLines' },
				children: dialogue.lines.map(line => ({ tag: 'p', children: [line] }))
			},
			{
				tag: 'button',
				attrs: { type: 'button' },
				on: { click: () => onSpeak(dialogue.citizenId) },
				children: ['Speak and Remember']
			}
		]
	};
}

function missingCitizen() {
	return {
		tag: 'section',
		attrs: { class: 'openWorldServiceSection' },
		children: [{ tag: 'p', children: ['The citizen has continued along the daily schedule.'] }]
	};
}
