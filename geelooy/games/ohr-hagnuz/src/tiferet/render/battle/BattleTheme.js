/**
 * B"H
 * @module BattleTheme
 *
 * Chapter 27: Midnight learned to carry gold without becoming loud.
 * The Awtsmoos has no body and no form; still every color below is a vessel,
 * a measured garment for the battle screen so the eye enters a polished RPG
 * chamber instead of a programmer's diagnostic cave.
 */
export const BATTLE_THEME = {
  colors: {
    nightTop: '#050714', nightMid: '#130728', nightLow: '#03040a',
    glass: 'rgba(7,10,25,.78)', glassStrong: 'rgba(7,9,20,.91)',
    line: 'rgba(255,255,255,.28)', lineGold: 'rgba(247,213,106,.82)',
    text: '#fff9e8', muted: '#d8d0e5', gold: '#f7d56a',
    green: '#72d07a', red: '#e44336', purple: '#b76cff', blue: '#44a7ff',
    shadow: 'rgba(0,0,0,.55)', grid: 'rgba(157,112,255,.18)'
  },
  fonts: {
    ui: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    display: 'Georgia, Times New Roman, serif'
  },
  glow: {
    player: 'rgba(48,125,255,.72)', enemy: 'rgba(174,65,255,.72)',
    selected: 'rgba(247,213,106,.42)'
  }
};

export const MOVE_SKINS = [
  { icon: '▤', color: '#82d982', title: 'Mishnah Clarity', desc: 'Simple truth cuts through confusion.' },
  { icon: '▣', color: '#9d7cff', title: 'Chassidus Warmth', desc: 'Bring the heart to melt the darkness.' },
  { icon: '♧', color: '#d06cff', title: 'Kabbalah Light', desc: 'Reveal the hidden root above.' },
  { icon: '♫', color: '#ffe05f', title: 'Niggun Joy', desc: 'Sing to elevate and heal.' }
];
