/**
 * B"H
 * Power-up definitions.
 *
 * Chapter 14: the Awtsmoos places small suns in the arena. Each one changes
 * one readable rule for a short time, never hidden, never vague: jump higher,
 * move faster, heal, shield, or strike harder.
 */
export const POWERUP_DEFINITIONS = {
  doubleJump: { id: 'doubleJump', name: 'Double Jump Orb', letter: 'ק', color: '#8af7ff', duration: 900 },
  gevurahFist: { id: 'gevurahFist', name: 'Gevurah Fist', letter: 'ג', color: '#ff776a', duration: 540 },
  chesedHeal: { id: 'chesedHeal', name: 'Chesed Heal', letter: 'ח', color: '#9dffb1', duration: 1 },
  netzachBoots: { id: 'netzachBoots', name: 'Netzach Boots', letter: 'נ', color: '#d6ff75', duration: 600 },
  ohrShield: { id: 'ohrShield', name: 'Ohr Shield', letter: 'א', color: '#fff1a6', duration: 720 }
};

export const POWERUP_IDS = Object.keys(POWERUP_DEFINITIONS);
