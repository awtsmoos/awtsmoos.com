// B"H
// Boruch Hashem
// Blessed is He

const ROLE_MOVES = Object.freeze({
	balanced: ['Pummel', 'Shift', 'Analyze', 'Endure'],
	tank: ['Pummel', 'Harden', 'Endure', 'Propel_Stones'],
	support: ['Soothing_Mist', 'Analyze', 'Mirror_Image', 'Echo_Blast'],
	speed: ['Sway', 'Shift', 'Peck', 'Chokhmah_Flash'],
	control: ['Root_Bind', 'Adhere', 'Circular_Logic', 'Ethereal_Strike'],
	boss: ['Ethereal_Strike', 'Gematria', 'Endure', 'Soothing_Mist']
});

const ROLE_STATS = Object.freeze({
	balanced: { hp: 72, attack: 16, defense: 14, diligence: 15 },
	tank: { hp: 92, attack: 13, defense: 20, diligence: 8 },
	support: { hp: 74, attack: 10, defense: 14, diligence: 17 },
	speed: { hp: 62, attack: 18, defense: 9, diligence: 22 },
	control: { hp: 70, attack: 14, defense: 12, diligence: 18 },
	boss: { hp: 140, attack: 23, defense: 21, diligence: 18 }
});

/** Reveals one Musag as a complete tactical, ecological, and narrative vessel. */
export function createCampaignMusag(definition) {
	const elevation = definition.elevation || null;
	return [definition.id, {
		id: definition.id,
		name: definition.name,
		emoji: definition.emoji,
		type: definition.region,
		essenceTypes: [definition.region, definition.role],
		role: definition.role,
		habitat: definition.habitat,
		rarity: definition.rarity,
		description: definition.description || `${definition.name} is a living concept shaped where ${definition.region} and the material world overlap.`,
		baseStats: ROLE_STATS[definition.role] || ROLE_STATS.balanced,
		statGrowth: { hp: 6, attack: 2, defense: 2, diligence: 2 },
		moves: definition.moves || ROLE_MOVES[definition.role] || ROLE_MOVES.balanced,
		passiveTrait: {
			id: `${definition.id}_trait`,
			name: `${definition.name} Resonance`,
			description: `Strengthens its ${definition.role} purpose when allies act in relationship.`
		},
		temperament: definition.role === 'boss' ? 'fractured' : 'curious',
		elevations: elevation ? [{ toId: elevation, requirements: { level: 18, bond: 40 }, hint: 'Grow through bond and regional repair.' }] : [],
		evolution: elevation ? { to: elevation, level: 18 } : null,
		bossPhases: definition.bossPhases || [],
		bestiaryText: `The Chronicle records ${definition.name} not as property, but as a pattern encountered and understood.`,
		encounterConditions: { region: definition.region, time: 'any' },
		recruitmentConditions: { healthBelow: 35, knowledge: 1, offering: `${definition.region}_offering` },
		drops: [{ itemId: 'echo_shard', chance: 0.35 }],
		questRelevance: [`campaign_${definition.region}`],
		soundIdentity: definition.role === 'support' ? 'chime' : 'echo',
		xpYield: definition.role === 'boss' ? 500 : 80,
		moneyYield: definition.role === 'boss' ? 120 : 18
	}];
}

export function createCampaignRoster(definitions) {
	return Object.freeze(Object.fromEntries(definitions.map(createCampaignMusag)));
}
