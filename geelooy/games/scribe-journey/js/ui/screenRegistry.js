// B"H

const SCREEN_IDS = [
	'main-menu', 'gameMenu', 'battle-screen', 'inventory-screen',
	'quest-log-screen', 'shem-screen', 'crafting-screen', 'bestiary-screen',
	'mitzvah-screen', 'gemach-screen', 'gates-screen', 'gates37-screen',
	'dreidel-screen', 'otzar-screen', 'player-quest-screen', 'features-screen'
];

function createMissingScreen(id, container) {
	const screen = document.createElement('section');
	screen.id = id;
	screen.className = 'menu-screen';
	container.appendChild(screen);
	return screen;
}

/** Creates the complete screen registry while preserving legacy element IDs. */
export function createScreenRegistry() {
	const container = document.getElementById('gameContainer');
	const screens = {};
	for (const id of SCREEN_IDS) {
		screens[id] = document.getElementById(id) || createMissingScreen(id, container);
	}
	screens.game = document.getElementById('gameCanvas');
	screens.battle = screens['battle-screen'];

	return {
		screens,
		show(name) {
			for (const screen of new Set(Object.values(screens))) screen?.classList.remove('is-visible');
			const target = name === 'game' ? screens.game : screens[name] || screens.game;
			target?.classList.add('is-visible');
		}
	};
}
