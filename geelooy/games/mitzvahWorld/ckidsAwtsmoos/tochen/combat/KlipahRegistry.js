/**
 * B\"H
 * @file KlipahRegistry.js
 * @description
 * Mazikim and kelipos are concealments, not just monsters.
 */

export const KLIPAH_REGISTRY = [
  {
    id: "klipah_doubt",
    name: "Shadow of Doubt",
    level: 5,
    maxHp: 80,
    damage: 12,
    exp: 40,
    sparkDrop: 3,
    weaknesses: ["shema_yisrael", "tehillim_pulse"],
    description: "A cloud of inner confusion that feeds on hesitation."
  },
  {
    id: "klipah_pride",
    name: "Serpent of Pride",
    level: 10,
    maxHp: 160,
    damage: 22,
    exp: 80,
    sparkDrop: 6,
    weaknesses: ["sing_of_torah", "shema_yisrael"],
    description: "This klipah tricks souls into self-importance."
  },
  {
    id: "klipah_despair",
    name: "Void of Despair",
    level: 20,
    maxHp: 500,
    damage: 45,
    exp: 300,
    sparkDrop: 20,
    weaknesses: ["shema_yisrael", "tehillim_pulse", "sing_of_torah"],
    description: "A devouring void that whispers that light will never return."
  }
];
