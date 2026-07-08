// B"H
/** AnimalProfile.js — species proportions, colors, hostility, and ground lift. */
import { SIZE, TINT } from "../RegionWildlifeData.js?compact=true&v=mitzvah-aggressive-split-20260703-bh1";

const ACCENT = Object.freeze({
  rabbit: 0xf3e6d2,
  fox: 0xfff0cf,
  deer: 0xe7c38e,
  goat: 0xf4f4df,
  cow: 0x2f2a27,
  frog: 0xd6f48f,
  bird: 0xffe680
});

export function animalScale(species = "rabbit") {
  const size = SIZE[species] || [1.5, 1.2, 1.8];
  return Math.max(0.42, Math.min(1.18, Math.max(size[0], size[2]) * 0.34));
}

export function animalProfile(species = "rabbit") {
  return {
    species,
    baseColor: TINT[species] || 0x9c8a67,
    accentColor: ACCENT[species] || 0xf2dfb5,
    hoofColor: species === "bird" ? 0xffb100 : 0x3a2c22,
    hornColor: 0xded2a0,
    speed: species === "fox" ? 1.1 : species === "bird" ? 0.95 : 0.78,
    faction: species === "fox" ? "hostile" : "neutral"
  };
}
