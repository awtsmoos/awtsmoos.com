/** B"H * @module TileLexiconMidgame */
export const MidgameTiles = {
  'ט': { kind: 'npc', pass: true, ground: '2', encounter: 'timekeeper', quest: 'eit_chamber', label: 'Timekeeper of Eit' },
  'ך': { kind: 'npc', pass: true, ground: '2', encounter: 'letterSmith', quest: 'letter_forge', label: 'Blacksmith of Letters' },
  '֬': { kind: 'npc', pass: true, ground: '1', encounter: 'wanderingChassid', quest: 'niggun_bridge', label: 'Wandering Chassid' },
  '֣': { kind: 'musag', pass: true, ground: '1', encounter: 'wildSafek', label: 'Wild Safek' },
  '֥': { kind: 'musag', pass: true, ground: '1', encounter: 'wildNekudah', label: 'Wild Nekudah' },
  '*': { kind: 'object', pass: true, ground: '.', questItem: 'key', label: 'Key of Eit' },
  '*$': { kind: 'object', pass: true, ground: '.', questItem: 'chest', label: 'Genza Teivah' }
};
