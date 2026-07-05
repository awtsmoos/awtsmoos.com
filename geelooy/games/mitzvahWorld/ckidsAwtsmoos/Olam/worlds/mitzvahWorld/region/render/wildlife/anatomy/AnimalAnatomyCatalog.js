// B"H
/**
 * B"H
 *
 * The Animal Anatomy Catalog is the quiet scroll beneath the field:
 * before a fox runs, before a deer startles, before a cow lowers its head
 * to graze, each creature receives a remembered body.
 *
 * This file does not animate the animal. It gives the animal a truthful
 * silhouette: spine, chest, head, legs, tail, ears, horn, color, and posture.
 * The motion systems may then breathe upon it without rebuilding the world
 * every frame.
 */
export const ANIMAL_ANATOMY = Object.freeze({
  fox:Object.freeze({
    color:0xd66b22, accent:0xf7ead1, dark:0x1e1309, posture:"predatory",
    body:[.48,.25,.82], chest:[.38,.3,.32], head:[.2,.16,.26], snout:[.11,.08,.22],
    legs:{ count:4, scale:[.055,.34,.055], stanceX:.28, stanceZ:.29, foot:[.09,.035,.16] },
    ears:{ kind:"triangle", scale:[.07,.22,.04] }, tail:{ kind:"bushy", scale:[.48,.12,.14], lift:.08 },
    marks:["whiteChest","tailTip","blackSocks"], score:9
  }),
  cow:Object.freeze({
    color:0x3f352d, accent:0xf2ead8, dark:0x19120d, posture:"grazing",
    body:[.74,.42,.98], chest:[.62,.46,.38], head:[.3,.23,.3], snout:[.2,.1,.22],
    legs:{ count:4, scale:[.085,.46,.075], stanceX:.38, stanceZ:.42, foot:[.13,.045,.15] },
    ears:{ kind:"side", scale:[.13,.1,.035] }, horns:{ kind:"short", scale:[.06,.16,.04] },
    tail:{ kind:"tuft", scale:[.25,.045,.08], lift:-.08 }, marks:["hidePatches","broadMuzzle","dewlap"], score:9
  }),
  deer:Object.freeze({
    color:0x9b6a37, accent:0xf0dfbf, dark:0x2d1a0d, posture:"alert",
    body:[.54,.32,.82], chest:[.43,.42,.3], head:[.2,.18,.28], snout:[.1,.08,.2],
    neck:[.12,.44,.12], legs:{ count:4, scale:[.052,.6,.045], stanceX:.28, stanceZ:.33, foot:[.08,.03,.15] },
    ears:{ kind:"alert", scale:[.08,.2,.035] }, horns:{ kind:"antlers", scale:[.045,.32,.035] },
    tail:{ kind:"flag", scale:[.16,.06,.07], lift:.08 }, marks:["spots","whiteBelly","flagTail"], score:9
  }),
  goat:Object.freeze({
    color:0xc8b28c, accent:0xf1e7d3, dark:0x3a2d1e, posture:"lively",
    body:[.48,.3,.7], chest:[.4,.36,.28], head:[.22,.18,.24], snout:[.1,.08,.17],
    legs:{ count:4, scale:[.06,.42,.052], stanceX:.27, stanceZ:.29, foot:[.09,.035,.13] },
    ears:{ kind:"side", scale:[.1,.09,.035] }, horns:{ kind:"swept", scale:[.045,.22,.035] },
    tail:{ kind:"short", scale:[.12,.05,.05], lift:.12 }, marks:["beard","horns","smallHooves"], score:9
  }),
  rabbit:Object.freeze({
    color:0xb8aa96, accent:0xf4eadc, dark:0x201915, posture:"hopping",
    body:[.3,.2,.42], chest:[.22,.2,.22], head:[.16,.14,.17], snout:[.075,.055,.1],
    legs:{ count:4, scale:[.045,.18,.04], stanceX:.17, stanceZ:.17, foot:[.11,.03,.18], hindScale:1.55 },
    ears:{ kind:"long", scale:[.045,.34,.032] }, tail:{ kind:"puff", scale:[.1,.08,.08], lift:.02 },
    marks:["longEars","softBelly","puffTail"], score:9
  }),
  frog:Object.freeze({
    color:0x4ba34d, accent:0xd6dfa0, dark:0x183b18, posture:"crouched",
    body:[.28,.11,.28], chest:[.22,.1,.18], head:[.22,.1,.18], snout:[.04,.025,.05],
    legs:{ count:4, scale:[.045,.12,.04], stanceX:.24, stanceZ:.18, foot:[.16,.025,.18], splayed:true },
    eyes:{ kind:"raised", scale:[.055,.04,.055] }, tail:null, marks:["wideMouth","webbedFeet","frogSpots"], score:9
  }),
  bird:Object.freeze({
    color:0x5c78aa, accent:0xd7cf94, dark:0x222a3f, posture:"winged",
    body:[.22,.13,.28], chest:[.18,.16,.15], head:[.12,.1,.12], snout:[.04,.03,.12],
    legs:{ count:2, scale:[.025,.16,.025], stanceX:.07, stanceZ:.06, foot:[.07,.018,.09] },
    wings:{ scale:[.38,.03,.16] }, tail:{ kind:"fan", scale:[.16,.035,.16], lift:.02 },
    marks:["beak","wings","tailFeathers"], score:9
  })
});

export function animalAnatomy(species = "rabbit") {
  return ANIMAL_ANATOMY[species] || ANIMAL_ANATOMY.rabbit;
}

export function estimateAnimalAnatomyScore(speciesCounts = {}) {
  const species = Object.keys(speciesCounts).filter(key => speciesCounts[key] > 0);
  if (!species.length) return 0;
  const total = species.reduce((sum, key) => sum + animalAnatomy(key).score, 0);
  return Math.round(total / species.length);
}

export default animalAnatomy;
