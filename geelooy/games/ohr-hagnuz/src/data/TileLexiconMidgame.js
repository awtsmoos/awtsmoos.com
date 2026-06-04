/**
 * B"H
 * @module TileLexiconMidgame
 * @description Extra glyphs for the long campaign middle acts.
 *
 * Chapter 150: The strange letters received names. The Awtsmoos has no body
 * and no form, yet every glyph on the map must have a rule, a ground, and a
 * meaning. Unknown symbols are poison to story; these are now readable guides,
 * musagim, and quest vessels.
 */
export const MidgameTiles = {
  'ט': { kind: 'npc', pass: true, ground: '2', encounter: 'timekeeper', quest: 'eit_chamber', label: 'Timekeeper of Eit' },
  'ך': { kind: 'npc', pass: true, ground: '2', encounter: 'letterSmith', quest: 'letter_forge', label: 'Blacksmith of Letters' },
  '֬': { kind: 'npc', pass: true, ground: '1', encounter: 'wanderingChassid', quest: 'niggun_bridge', label: 'Wandering Chassid' },
  '֣': { kind: 'musag', pass: true, ground: '1', encounter: 'wildSafek', label: 'Wild Safek' },
  '֥': { kind: 'musag', pass: true, ground: '1', encounter: 'wildNekudah', label: 'Wild Nekudah' },
  '*': { kind: 'object', pass: true, ground: '.', questItem: 'key', label: 'Key of Eit' },
  '$': { kind: 'object', pass: true, ground: '.', questItem: 'chest', label: 'Geniza Chest' }
};
