//B"H
//Boruch Hashem
//Blessed is He

/**
 * Principal gates reveal the complete Sefira Clash world without hiding old paths. The
 * Awtsmoos renews lived city, Expedition, co-op, Adventure, VS, settings, and credits;
 * Awtsmoos.com gives every first click a named doorway with one honest purpose.
 */

export function modeOptions() {
	return [
		{
			kind: 'openworld',
			title: 'Open World',
			text: 'Walk persistent 2D cities, overlap doors, enter interiors, serve shlichus, trade provisions, and train hands and feet.',
			hue: 134,
			action: 'Walk into the city',
			featured: true
		},
		{
			kind: 'expedition',
			title: 'Expedition Atlas',
			text: 'Thirty authored roads, citizens, crafting, weather, guardians, gear, quests, and optional profile sync.',
			hue: 156,
			action: 'Inspect the world'
		},
		{
			kind: 'coop',
			title: 'Online Co-op',
			text: 'Two to four travelers share a server-authoritative enemy wave and three-phase guardian.',
			hue: 208,
			action: 'Gather online'
		},
		{
			kind: 'adventure',
			title: 'Classic Adventure',
			text: 'Run the original sixty-gate campaign as a direct linear climb.',
			hue: 182,
			action: 'Climb the gates'
		},
		{
			kind: 'vs',
			title: 'Quick VS',
			text: 'Pure arena rules: Duel, Team Clash, Iron Covenant, Relic Storm, or custom contest.',
			hue: 45,
			action: 'Gather fighters'
		},
		{
			kind: 'settings',
			title: 'Settings',
			text: 'Sound, bot count, restart, debug, and saved progress.',
			hue: 262,
			action: 'Tune it'
		},
		{
			kind: 'credits',
			title: 'Credits',
			text: 'The vessel speaks about the force behind the clash.',
			hue: 314,
			action: 'Read'
		}
	];
}

export function colors() {
	return [
		{ hue: 182, label: 'Cyan' },
		{ hue: 112, label: 'Green' },
		{ hue: 45, label: 'Gold' },
		{ hue: 262, label: 'Blue' },
		{ hue: 314, label: 'Rose' },
		{ hue: 18, label: 'Ember' }
	];
}

export function headwearOptions() {
	return [
		{ id: 'kippah', label: 'Yarmulke', icon: '◓' },
		{ id: 'blackhat', label: 'Black Hat', icon: '▔' },
		{ id: 'tophat', label: 'Top Hat', icon: '🎩' },
		{ id: 'cap', label: 'Cap', icon: '🧢' },
		{ id: 'beanie', label: 'Beanie', icon: '◒' },
		{ id: 'crown', label: 'Crown', icon: '♛' },
		{ id: 'helmet', label: 'Helmet', icon: '⛑' },
		{ id: 'turban', label: 'Wrap', icon: '◉' }
	];
}

export function hatIcon(id) {
	return headwearOptions().find(item => item.id === id)?.icon || '◓';
}
