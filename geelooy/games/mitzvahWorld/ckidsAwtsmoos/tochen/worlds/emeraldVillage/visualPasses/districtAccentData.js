// B"H
/**
 * @file districtAccentData.js
 * @description Chapter 237: Thirty-five district motifs become data, so the
 * Awtsmoos is not trapped in cloned source files. Each accent is a small banner
 * breath that can scale without new code.
 */
const COLORS = ['#274f88', '#8c3329', '#3c6f43', '#8a6b2f', '#5a3e8e'];
export const DISTRICT_ACCENTS = Object.freeze(Array.from({ length: 35 }, (_, i) => {
  const index = i + 1;
  return Object.freeze({
    id: `district_accent_${String(index).padStart(2, '0')}`,
    propertyOffset: index,
    label: `District accent banner ${index}`,
    color: COLORS[index % COLORS.length],
    local: { x: (index % 7) - 3, y: 2 + (index % 5) * 0.5, z: (index % 9) - 4 },
    size: [0.35, 1.6, 0.12]
  });
}));
