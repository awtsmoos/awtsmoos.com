// B"H

const SCREEN_IDS = [
	'main-menu', 'gameMenu', 'battle-screen', 'inventory-screen',
	'quest-log-screen', 'shem-screen', 'crafting-screen', 'bestiary-screen',
	'mitzvah-screen', 'gemach-screen', 'gates-screen', 'gates37-screen',
	'dreidel-screen', 'otzar-screen', 'player-quest-screen', 'features-screen',
	'settings-screen'
];

function createMissingScreen(id, container) {
	const screen = document.createElement('section');
	screen.id = id;
	screen.className = 'menu-screen';
	container.appendChild(screen);
	return screen;
}

function focusFirstControl(screen) {
	const control = screen?.querySelector('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]');
	control?.focus({ preventScroll: true });
}

/** Owns visible screen, return path, and focus restoration for modal journeys. */
export function createScreenRegistry() {
	const container = document.getElementById('gameContainer');
	const screens = {};
	for (const id of SCREEN_IDS) screens[id] = document.getElementById(id) || createMissingScreen(id, container);
	screens.game = document.getElementById('gameCanvas');
	screens.battle = screens['battle-screen'];
	let current = 'main-menu';
	let settingsReturn = 'main-menu';
	let settingsOpener = null;

	function show(name, { focus = false } = {}) {
		const resolved = name === 'game' ? 'game' : (screens[name] ? name : 'game');
		for (const screen of new Set(Object.values(screens))) {
			screen?.classList.remove('is-visible');
			screen?.setAttribute?.('aria-hidden', 'true');
		}
		const target = screens[resolved];
		target?.classList.add('is-visible');
		target?.setAttribute?.('aria-hidden', 'false');
		current = resolved;
		if (focus && resolved !== 'game') requestAnimationFrame(() => focusFirstControl(target));
		return resolved;
	}

	return {
		screens,
		show,
		current: () => current,
		openSettings() {
			settingsReturn = current;
			settingsOpener = document.activeElement;
			return show('settings-screen', { focus: true });
		},
		closeSettings() {
			const destination = show(settingsReturn || 'main-menu');
			requestAnimationFrame(() => settingsOpener?.focus?.({ preventScroll: true }));
			return destination;
		}
	};
}
