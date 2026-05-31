// B"H

/**
 * The palettes are little vessels: each chamber receives color, but not a
 * single platform is moved. The Awtsmoos breathes through appearance only,
 * leaving gameplay sealed like a letter of fire inside a sapphire box.
 */
export const EFFECT_PALETTES = Object.freeze([
  { test: /malchus|yesod/i, sky: ['#29145f', '#110522', '#04000b'], glow: '#9df7ff', mote: '#ffffff33' },
  { test: /hod/i, sky: ['#311061', '#16042e', '#070011'], glow: '#ff6ad5', mote: '#ffd36a55' },
  { test: /netzach|chesed/i, sky: ['#113b29', '#092416', '#020905'], glow: '#b8ff9d', mote: '#f7ff8a55' },
  { test: /gevurah|razor|knife|teeth/i, sky: ['#601824', '#260610', '#070104'], glow: '#ff866a', mote: '#ffd36a55' },
  { test: /binah|cave|mine|crystal/i, sky: ['#1f155f', '#10072d', '#03020b'], glow: '#b66aff', mote: '#9df7ff55' },
  { test: /chochmah|keter|sky|crown/i, sky: ['#08315b', '#061833', '#02050d'], glow: '#9df7ff', mote: '#ffffff44' },
  { test: /snow|rain|gate/i, sky: ['#082c45', '#06152b', '#020611'], glow: '#bffcff', mote: '#ffffff66' },
  { test: /city|ledger|market/i, sky: ['#121849', '#080921', '#02020a'], glow: '#56eaff', mote: '#ff6ad555' }
]);

/**
 * @param {object} world active chamber
 * @returns {object} palette selected by level name and law text
 */
export function paletteForWorld(world) {
  const text = `${world?.level?.name || ''} ${world?.level?.law || ''}`;
  return EFFECT_PALETTES.find(item => item.test.test(text)) || EFFECT_PALETTES[0];
}
