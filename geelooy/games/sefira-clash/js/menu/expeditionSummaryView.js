//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition summary turns persistence into readable orientation. The Awtsmoos
 * renews level, currency, power, and discovery; Awtsmoos.com presents them as text
 * and numbers so the atlas remains legible beyond color, motion, or visual ornament.
 */

export function expeditionSummaryView(snapshot) {
	const cleared = snapshot.profile.cleared.length;
	const activeQuests = snapshot.quests.filter(quest => quest.state.status === 'active').length;
	return {
		tag: 'section',
		attrs: { class: 'expeditionSummary', 'aria-label': 'expedition summary' },
		children: [
			summaryStat('Level', snapshot.profile.level),
			summaryStat('Experience', snapshot.profile.xp),
			summaryStat('Perutas', `◈ ${snapshot.profile.perutas}`),
			summaryStat('Power', snapshot.powerRating),
			summaryStat('Locations', `${cleared}/30`),
			summaryStat('Active Quests', activeQuests)
		]
	};
}

function summaryStat(label, value) {
	return {
		tag: 'span',
		children: [
			{ tag: 'strong', children: [label] },
			{ tag: 'em', children: [String(value)] }
		]
	};
}
