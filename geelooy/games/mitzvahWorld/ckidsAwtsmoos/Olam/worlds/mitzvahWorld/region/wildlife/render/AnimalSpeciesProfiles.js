// B"H
/**
 * @file AnimalSpeciesProfiles.js
 * @description
 * Chapter 443: every animal receives its own silhouette covenant.
 * The Awtsmoos measures fox, rabbit, deer, goat, frog, and bird as living forms:
 * torso, hips, chest, neck, head, snout, legs, ears, tail, and fur markings.
 */
export const ANIMAL_SPECIES_PROFILES = Object.freeze({
  fox: {
    fur: "foxfur", speed: 1.05, height: .62,
    body: { torso: [.72, .34, 1.18], chest: [.55, .42, .56], hips: [.58, .34, .52], neck: [.22, .28, .3], head: [.36, .3, .43], snout: [.18, .16, .36] },
    legs: { length: .55, thickness: .075, stanceX: .38, stanceZ: .42, foot: [.14, .055, .28], sock: true },
    ears: { shape: "pointed", height: .38, width: .13 }, tail: { kind: "bushy", length: .95, radius: .18, tip: true },
    markings: { muzzle: true, chest: true, socks: true, tailTip: true }, colors: { eye: 0x1b1308 }
  },
  rabbit: {
    fur: "rabbitfur", speed: 1.18, height: .42,
    body: { torso: [.48, .29, .7], chest: [.38, .31, .36], hips: [.54, .34, .46], neck: [.16, .18, .16], head: [.28, .25, .32], snout: [.14, .1, .18] },
    legs: { length: .34, thickness: .07, stanceX: .28, stanceZ: .28, foot: [.13, .045, .34], hindScale: 1.55 },
    ears: { shape: "long", height: .56, width: .105 }, tail: { kind: "puff", length: .18, radius: .13 },
    markings: { belly: true, muzzle: true }, colors: { eye: 0x090606 }
  },
  deer: {
    fur: "deerfur", speed: .95, height: 1.22,
    body: { torso: [.72, .55, 1.18], chest: [.58, .64, .5], hips: [.6, .52, .55], neck: [.24, .78, .25], head: [.32, .28, .46], snout: [.16, .13, .34] },
    legs: { length: 1.05, thickness: .07, stanceX: .38, stanceZ: .43, foot: [.1, .04, .25] },
    ears: { shape: "alert", height: .32, width: .13 }, tail: { kind: "flag", length: .28, radius: .11 },
    markings: { spots: true, belly: true }, colors: { eye: 0x120a05 }
  },
  goat: {
    fur: "goatfur", speed: .78, height: .82,
    body: { torso: [.7, .46, .95], chest: [.58, .54, .5], hips: [.58, .45, .46], neck: [.25, .45, .25], head: [.34, .3, .4], snout: [.17, .14, .28] },
    legs: { length: .72, thickness: .08, stanceX: .34, stanceZ: .34, foot: [.12, .05, .2] },
    ears: { shape: "side", height: .22, width: .12 }, tail: { kind: "short", length: .22, radius: .08 },
    markings: { beard: true, horns: true }, colors: { eye: 0x100b06 }
  },
  frog: {
    fur: "frogskin", speed: .65, height: .22,
    body: { torso: [.36, .18, .36], chest: [.3, .16, .22], hips: [.42, .16, .32], neck: [.08, .08, .08], head: [.34, .18, .28], snout: [.08, .05, .08] },
    legs: { length: .22, thickness: .055, stanceX: .3, stanceZ: .23, foot: [.17, .035, .25], hindScale: 1.8 },
    ears: { shape: "none", height: 0, width: 0 }, tail: { kind: "none", length: 0, radius: 0 },
    markings: { belly: true, spots: true }, colors: { eye: 0x050503 }
  },
  bird: {
    fur: "birdfeather", speed: 1.35, height: .28,
    body: { torso: [.32, .22, .46], chest: [.3, .25, .24], hips: [.25, .2, .22], neck: [.1, .16, .1], head: [.2, .18, .2], snout: [.08, .05, .16] },
    legs: { length: .2, thickness: .025, stanceX: .12, stanceZ: .1, foot: [.08, .025, .12] },
    ears: { shape: "none", height: 0, width: 0 }, tail: { kind: "fan", length: .34, radius: .12 }, wings: true,
    markings: { featherBands: true }, colors: { eye: 0x050505 }
  }
});
export function speciesProfile(species = "rabbit") { return ANIMAL_SPECIES_PROFILES[species] || ANIMAL_SPECIES_PROFILES.rabbit; }
