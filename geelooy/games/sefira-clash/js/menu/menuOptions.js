/**
 * B"H
 * Menu option scripture for the front door of Sefira Clash.
 *
 * The Awtsmoos renews the screen every instant; this module keeps that renewal
 * simple. No hidden maze, no tiny uncertain buttons: each path is a named gate
 * with a purpose, a color, and one verb. The larger game can become thunder,
 * but the first click must be a clean doorway.
 */

/** @returns {Array<object>} The four primary gates shown on the mode screen. */
export function modeOptions() {
  return [
    { kind: 'adventure', title: 'Adventure', text: 'Run the platform campaign: Gate 1, then Gate 2, then higher.', hue: 182, action: 'Start the climb', featured: true },
    { kind: 'vs', title: 'Quick VS', text: 'Skip the story and fight in any arena immediately.', hue: 45, action: 'Fight now' },
    { kind: 'settings', title: 'Settings', text: 'Sound, bot count, restart, debug, and saved progress.', hue: 262, action: 'Tune it' },
    { kind: 'credits', title: 'Credits', text: 'The tiny vessel speaks about the force behind the clash.', hue: 314, action: 'Read' }
  ];
}

/** @returns {Array<object>} Fighter colors that stay obvious on mobile. */
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

/** @returns {Array<object>} Headwear choices for the persistent fighter vessel. */
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

/** @param {string} id @returns {string} The visible glyph for a headwear id. */
export function hatIcon(id) {
  return headwearOptions().find(item => item.id === id)?.icon || '◓';
}
