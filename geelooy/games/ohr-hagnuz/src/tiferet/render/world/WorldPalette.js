/**
 * B"H
 * @module WorldPalette
 *
 * Chapter 39: The field received one language of color.
 * The Awtsmoos has no body and no form; this data is a humble garment, giving
 * grass, stone, roof, path, glow, flower, and water one coherent visual soul.
 */
export const WORLD_COLORS = {
  grass: ['#0d3f2c', '#145637', '#1c6b3d', '#2f8446'],
  darkGrass: '#092c23', leaf: '#47a95b', leafLight: '#76d46b',
  path: '#92705a', pathLight: '#b18a69', pathDark: '#61483b',
  stone: '#d8d0c9', stoneLine: '#a99e98', stoneDark: '#756b68',
  roof: '#4b2f25', roofLight: '#71503a', roofDark: '#2b1916',
  wood: '#3a2219', woodLight: '#7a5134', gold: '#ffd166',
  water: '#0b3144', waterLight: '#3bb7d6', flower: ['#fff6a3', '#f5a3ff', '#ffffff'],
  glow: 'rgba(255,229,116,.72)', shadow: 'rgba(0,0,0,.34)'
};

export const seeded = seed => {
  const n = Math.sin(seed * 12.9898) * 43758.5453;
  return n - Math.floor(n);
};

export const pick = (list, seed) => list[Math.floor(seeded(seed) * list.length) % list.length];
