// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TanachMissionsBereishis.js
 * @description Tanach mission pack A: Bereishis — Creation through Yosef in Mitzrayim.
 * Every mission is completable through the AdventureStore event flow:
 * accept -> recordEvent({type, target, count}) -> completed -> reward.
 */

export const BEREISHIS_MISSIONS = Object.freeze([
Object.freeze({
  id: "breishis-first-light",
  name: "First Light", title: "First Light",
  description: "Adam asks you to study how Elokim called the light good on the first day of Creation.",
  giver: Object.freeze({ id: "adam", name: "Adam", position: Object.freeze({ x: 40, y: 0, z: -120 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages about the first light.", marker: Object.freeze({ x: 42, y: 0, z: -118 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "breishis-name-the-beasts",
  name: "Naming the Beasts", title: "Naming the Beasts",
  description: "Adam needs help watching the beasts of the field as he calls each by its true name.",
  giver: Object.freeze({ id: "adam", name: "Adam", position: Object.freeze({ x: 42, y: 0, z: -118 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 4,
      description: "Tend four beasts while Adam names them.", marker: Object.freeze({ x: 39, y: 0, z: -114 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "breishis-garden-rows",
  name: "Rows in the Garden", title: "Rows in the Garden",
  description: "Chavah is planting the garden rows of Gan Eden and needs seed carried to every bed.",
  giver: Object.freeze({ id: "chavah", name: "Chavah", position: Object.freeze({ x: 48, y: 0, z: -128 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "garden-seed", count: 6,
      description: "Gather six pouches of garden seed.", marker: Object.freeze({ x: 51, y: 0, z: -130 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "breishis-tend-the-garden",
  name: "Tending Gan Eden", title: "Tending Gan Eden",
  description: "Adam was placed in Gan Eden to work it and to guard it; join him in the tending.",
  giver: Object.freeze({ id: "adam", name: "Adam", position: Object.freeze({ x: 38, y: 0, z: -122 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "activity", target: "herb-gathering", count: 2,
      description: "Gather herbs twice in the garden.", marker: Object.freeze({ x: 42, y: 0, z: -121 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "breishis-shabbos-rest",
  name: "The Shabbos Rest", title: "The Shabbos Rest",
  description: "On the seventh day Elokim rested; Adam teaches you the rest of Shabbos.",
  giver: Object.freeze({ id: "adam", name: "Adam", position: Object.freeze({ x: 40, y: 0, z: -120 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the seventh day.", marker: Object.freeze({ x: 41, y: 0, z: -119 }) }),
    Object.freeze({ eventType: "talk", target: "adam", count: 1,
      description: "Speak with Adam about the Shabbos rest.", marker: Object.freeze({ x: 40, y: 0, z: -120 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "breishis-fruit-of-trees",
  name: "Fruit of the Trees", title: "Fruit of the Trees",
  description: "Of every tree of the garden you may eat; Chavah gathers the permitted fruit.",
  giver: Object.freeze({ id: "chavah", name: "Chavah", position: Object.freeze({ x: 50, y: 0, z: -126 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "orchard-fruit", count: 8,
      description: "Gather eight orchard fruits.", marker: Object.freeze({ x: 46, y: 0, z: -123 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "breishis-rivers-of-eden",
  name: "Rivers of Eden", title: "Rivers of Eden",
  description: "Four heads of rivers water Gan Eden; Adam sends you to walk their banks.",
  giver: Object.freeze({ id: "adam", name: "Adam", position: Object.freeze({ x: 44, y: 0, z: -116 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "gan-eden-rivers", count: 1,
      description: "Walk the banks of the rivers of Eden.", marker: Object.freeze({ x: 50, y: 0, z: -122 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "breishis-garden-lanterns",
  name: "Lanterns for the Garden", title: "Lanterns for the Garden",
  description: "Light is precious in the garden; set lanterns along its paths for the evening.",
  giver: Object.freeze({ id: "adam", name: "Adam", position: Object.freeze({ x: 36, y: 0, z: -124 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "lantern", count: 3,
      description: "Raise three lanterns on the garden paths.", marker: Object.freeze({ x: 34, y: 0, z: -128 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "breishis-garden-herbs",
  name: "Herbs of the Field", title: "Herbs of the Field",
  description: "Chavah gathers the herbs of the field for healing; learn which leaves are kind.",
  giver: Object.freeze({ id: "chavah", name: "Chavah", position: Object.freeze({ x: 52, y: 0, z: -130 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "activity", target: "herb-gathering", count: 3,
      description: "Gather healing herbs three times.", marker: Object.freeze({ x: 54, y: 0, z: -127 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "kayin-first-fruits",
  name: "Kayin’s First Fruits", title: "Kayin’s First Fruits",
  description: "Kayin brings an offering from the fruit of the ground; help him gather the first and finest.",
  giver: Object.freeze({ id: "kayin", name: "Kayin", position: Object.freeze({ x: 70, y: 0, z: -135 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "first-fruit", count: 5,
      description: "Gather five first-fruits for the offering.", marker: Object.freeze({ x: 73, y: 0, z: -133 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "hevel-choicest-flock",
  name: "Hevel’s Choicest Flock", title: "Hevel’s Choicest Flock",
  description: "Hevel keeps flocks; tend his choicest sheep with a gentle hand before the offering.",
  giver: Object.freeze({ id: "hevel", name: "Hevel", position: Object.freeze({ x: 74, y: 0, z: -138 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 5,
      description: "Tend five of Hevel’s choicest sheep.", marker: Object.freeze({ x: 71, y: 0, z: -137 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "hevel-offering",
  name: "Hevel’s Offering", title: "Hevel’s Offering",
  description: "Hevel offers the firstborn of his flock; prepare one lamb fit for the altar of Havayah.",
  giver: Object.freeze({ id: "hevel", name: "Hevel", position: Object.freeze({ x: 74, y: 0, z: -138 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "harvest", target: "kosher-animal", count: 1,
      description: "Prepare one lamb for Hevel’s offering.", marker: Object.freeze({ x: 76, y: 0, z: -140 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "kayin-anger-cooled",
  name: "Cooling Kayin’s Anger", title: "Cooling Kayin’s Anger",
  description: "Kayin’s face has fallen; Chavah asks you to speak with him and learn the warning: sin crouches at the door.",
  giver: Object.freeze({ id: "chavah", name: "Chavah", position: Object.freeze({ x: 68, y: 0, z: -132 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "kayin", count: 1,
      description: "Speak with Kayin about his fallen face.", marker: Object.freeze({ x: 70, y: 0, z: -129 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage: sin crouches at the door.", marker: Object.freeze({ x: 67, y: 0, z: -133 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "kayin-mark-of-mercy",
  name: "The Mark of Mercy", title: "The Mark of Mercy",
  description: "Though Kayin is exiled, Havayah sets a mark of mercy upon him; study its meaning.",
  giver: Object.freeze({ id: "chavah", name: "Chavah", position: Object.freeze({ x: 68, y: 0, z: -132 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages about Kayin’s mark.", marker: Object.freeze({ x: 69, y: 0, z: -134 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "eden-east-gate",
  name: "The East Gate", title: "The East Gate",
  description: "The cherubim guard the way to the Tree of Life; face their warden and stand firm.",
  giver: Object.freeze({ id: "adam", name: "Adam", position: Object.freeze({ x: 62, y: 0, z: -142 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "elite", target: "eden-gate-warden", count: 1,
      description: "Stand before the warden of the east gate.", marker: Object.freeze({ x: 56, y: 0, z: -146 }) }),
  ]),
  reward: Object.freeze({ xp: 320, mitzvahPoints: 10 }),
  multiplayer: true
}),
Object.freeze({
  id: "kayin-city-walls",
  name: "Kayin’s City Walls", title: "Kayin’s City Walls",
  description: "Kayin builds the first city and names it Chanoch; raise its walls with him.",
  giver: Object.freeze({ id: "kayin", name: "Kayin", position: Object.freeze({ x: 72, y: 0, z: -133 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "fence", count: 4,
      description: "Raise four wall segments of Kayin’s city.", marker: Object.freeze({ x: 76, y: 0, z: -134 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "chavah-children-taught",
  name: "Chavah Teaches Her Children", title: "Chavah Teaches Her Children",
  description: "Chavah teaches Sheis the ways of Elokim; bring the boy to her and listen.",
  giver: Object.freeze({ id: "chavah", name: "Chavah", position: Object.freeze({ x: 66, y: 0, z: -130 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "sheis", count: 1,
      description: "Bring Sheis to hear his mother’s teaching.", marker: Object.freeze({ x: 64, y: 0, z: -128 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn one passage with the children.", marker: Object.freeze({ x: 67, y: 0, z: -129 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "sheis-appointed",
  name: "Sheis Is Appointed", title: "Sheis Is Appointed",
  description: "Elokim has appointed another seed instead of Hevel; study the line of Sheis and refine its sparks.",
  giver: Object.freeze({ id: "chavah", name: "Chavah", position: Object.freeze({ x: 66, y: 0, z: -130 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of Sheis’ birth.", marker: Object.freeze({ x: 66, y: 0, z: -128 }) }),
    Object.freeze({ eventType: "refine", target: "spark", count: 2,
      description: "Refine two sparks of the new line.", marker: Object.freeze({ x: 69, y: 0, z: -131 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "chanoch-walk",
  name: "Chanoch Walked with Elokim", title: "Chanoch Walked with Elokim",
  description: "Chanoch walked with Elokim and was no more; follow his path and gather its light.",
  giver: Object.freeze({ id: "chanoch", name: "Chanoch", position: Object.freeze({ x: 58, y: 0, z: -144 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "gan-eden-rivers", count: 1,
      description: "Walk the path where Chanoch walked.", marker: Object.freeze({ x: 62, y: 0, z: -142 }) }),
    Object.freeze({ eventType: "refine", target: "spark", count: 2,
      description: "Refine two sparks of Chanoch’s walk.", marker: Object.freeze({ x: 56, y: 0, z: -147 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-gopher-wood",
  name: "Gopher Wood for the Ark", title: "Gopher Wood for the Ark",
  description: "Noach needs gopher logs for the ark that Havayah commanded him to build.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -40, y: 0, z: 60 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "chop", target: "fallen-wood", count: 8,
      description: "Chop eight fallen gopher logs.", marker: Object.freeze({ x: -38, y: 0, z: 58 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-ark-pitch",
  name: "Pitch for the Ark", title: "Pitch for the Ark",
  description: "The ark must be pitched within and without; gather pitch for Noach’s builders.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -42, y: 0, z: 62 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "pitch-lump", count: 6,
      description: "Gather six lumps of pitch.", marker: Object.freeze({ x: -45, y: 0, z: 65 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-cubit-measure",
  name: "The Cubit Measure", title: "The Cubit Measure",
  description: "Three hundred cubits long, fifty wide, thirty high; learn the ark’s measures by heart.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -38, y: 0, z: 58 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 3,
      description: "Learn three passages of the ark’s measures.", marker: Object.freeze({ x: -37, y: 0, z: 59 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-rooms-within",
  name: "Rooms Within the Ark", title: "Rooms Within the Ark",
  description: "The ark holds rooms within rooms; chop the timber for its inner chambers.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -44, y: 0, z: 64 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "chop", target: "fallen-wood", count: 6,
      description: "Chop six logs for the inner rooms.", marker: Object.freeze({ x: -41, y: 0, z: 63 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-pairs-of-beasts",
  name: "Pairs of Beasts", title: "Pairs of Beasts",
  description: "Two of every kind come to Noach; tend seven pairs before they enter the ark.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -36, y: 0, z: 56 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 7,
      description: "Tend seven pairs of beasts.", marker: Object.freeze({ x: -32, y: 0, z: 58 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-ark-provisions",
  name: "Provisions for the Ark", title: "Provisions for the Ark",
  description: "Food must be gathered for every living thing in the ark; stock the holds.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -40, y: 0, z: 60 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "ark-provision", count: 12,
      description: "Gather twelve bundles of provisions.", marker: Object.freeze({ x: -44, y: 0, z: 57 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-into-the-ark",
  name: "Into the Ark", title: "Into the Ark",
  description: "Havayah says: come into the ark, you and all your house; lead the way through its gate.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -40, y: 0, z: 66 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "tevah-gate", count: 1,
      description: "Pass through the gate of the ark.", marker: Object.freeze({ x: -40, y: 0, z: 70 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-forty-days",
  name: "Forty Days of Rain", title: "Forty Days of Rain",
  description: "Forty days and forty nights the rain falls; study what the waters covered and spared.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -42, y: 0, z: 58 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 4,
      description: "Learn four passages of the flood.", marker: Object.freeze({ x: -40, y: 0, z: 60 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-send-the-raven",
  name: "Send the Raven", title: "Send the Raven",
  description: "Noach sends the raven from the ark’s window; report what the bird finds.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -38, y: 0, z: 62 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "noach", count: 1,
      description: "Tell Noach what the raven found.", marker: Object.freeze({ x: -38, y: 0, z: 62 }) }),
  ]),
  reward: Object.freeze({ xp: 80, mitzvahPoints: 2 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-dove-olive-leaf",
  name: "The Dove’s Olive Leaf", title: "The Dove’s Olive Leaf",
  description: "At evening the dove returns with a torn olive leaf; find such a leaf as a sign.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -38, y: 0, z: 62 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "olive-leaf", count: 1,
      description: "Find one torn olive leaf.", marker: Object.freeze({ x: -33, y: 0, z: 63 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-dry-ground",
  name: "Dry Ground", title: "Dry Ground",
  description: "The dove finds no rest no more, for the waters are gone; climb to the peaks of Ararat.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -40, y: 0, z: 60 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "ararat-peaks", count: 1,
      description: "Climb to the peaks of Ararat.", marker: Object.freeze({ x: -46, y: 0, z: 66 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-altar-of-thanks",
  name: "Altar of Thanks", title: "Altar of Thanks",
  description: "Noach builds an altar to Havayah and offers thanks; prepare the offering and raise the bench of stone.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -36, y: 0, z: 64 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "harvest", target: "kosher-animal", count: 1,
      description: "Prepare one clean beast for the altar.", marker: Object.freeze({ x: -34, y: 0, z: 66 }) }),
    Object.freeze({ eventType: "build", target: "bench", count: 1,
      description: "Raise one stone bench for the altar.", marker: Object.freeze({ x: -38, y: 0, z: 62 }) }),
  ]),
  reward: Object.freeze({ xp: 200, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-rainbow-sign",
  name: "The Rainbow Sign", title: "The Rainbow Sign",
  description: "Havayah sets His bow in the cloud as a covenant; learn its words and refine its light.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -40, y: 0, z: 60 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of the covenant.", marker: Object.freeze({ x: -39, y: 0, z: 59 }) }),
    Object.freeze({ eventType: "refine", target: "spark", count: 2,
      description: "Refine two sparks of the rainbow covenant.", marker: Object.freeze({ x: -43, y: 0, z: 62 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-vineyard-rows",
  name: "Noach’s Vineyard", title: "Noach’s Vineyard",
  description: "Noach plants a vineyard after the flood; gather its first clusters.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -44, y: 0, z: 56 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "grape-cluster", count: 6,
      description: "Gather six clusters from the vineyard.", marker: Object.freeze({ x: -41, y: 0, z: 59 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-covering-shame",
  name: "Covering Shame", title: "Covering Shame",
  description: "Shem and Yefes walk backward to cover their father; join them in the deed.",
  giver: Object.freeze({ id: "shem", name: "Shem", position: Object.freeze({ x: -38, y: 0, z: 62 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "shem", count: 1,
      description: "Walk with Shem to cover Noach.", marker: Object.freeze({ x: -40, y: 0, z: 60 }) }),
    Object.freeze({ eventType: "talk", target: "yefes", count: 1,
      description: "Walk with Yefes to cover Noach.", marker: Object.freeze({ x: -36, y: 0, z: 60 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-blessing-of-shem",
  name: "The Blessing of Shem", title: "The Blessing of Shem",
  description: "Blessed be Havayah, the Elokim of Shem; carry Noach’s blessing to his son.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -40, y: 0, z: 60 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "shem", count: 2,
      description: "Speak Noach’s blessing to Shem twice.", marker: Object.freeze({ x: -43, y: 0, z: 61 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "noach-comfort",
  name: "Noach the Comforter", title: "Noach the Comforter",
  description: "Noach was named for the comfort he would bring; speak with him and refine the comfort’s sparks.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -40, y: 0, z: 60 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "noach", count: 1,
      description: "Speak with Noach of comfort.", marker: Object.freeze({ x: -40, y: 0, z: 60 }) }),
    Object.freeze({ eventType: "refine", target: "spark", count: 3,
      description: "Refine three sparks of comfort.", marker: Object.freeze({ x: -38, y: 0, z: 63 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mesushelach-years",
  name: "The Years of Mesushelach", title: "The Years of Mesushelach",
  description: "Mesushelach lived nine hundred sixty-nine years, longest of men; learn his days.",
  giver: Object.freeze({ id: "noach", name: "Noach", position: Object.freeze({ x: -42, y: 0, z: 58 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of the long generations.", marker: Object.freeze({ x: -41, y: 0, z: 60 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "bavel-brick-moulds",
  name: "Brick Moulds", title: "Brick Moulds",
  description: "At Bavel they say: come, let us make brick; mould the bricks for Nimrod’s builders.",
  giver: Object.freeze({ id: "nimrod", name: "Nimrod", position: Object.freeze({ x: -120, y: 0, z: -40 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "clay-brick", count: 10,
      description: "Mould ten clay bricks.", marker: Object.freeze({ x: -117, y: 0, z: -38 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "bavel-straw-for-mortar",
  name: "Straw for Mortar", title: "Straw for Mortar",
  description: "Brick needs straw and slime for mortar; gather straw bundles on the plain of Shinar.",
  giver: Object.freeze({ id: "nimrod", name: "Nimrod", position: Object.freeze({ x: -118, y: 0, z: -42 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "straw-bundle", count: 8,
      description: "Gather eight bundles of straw.", marker: Object.freeze({ x: -121, y: 0, z: -39 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "bavel-bitumen-pits",
  name: "Bitumen Pits", title: "Bitumen Pits",
  description: "Slime was their mortar; draw bitumen from the pits for the tower’s courses.",
  giver: Object.freeze({ id: "nimrod", name: "Nimrod", position: Object.freeze({ x: -122, y: 0, z: -38 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "pitch-lump", count: 6,
      description: "Draw six lumps of bitumen.", marker: Object.freeze({ x: -120, y: 0, z: -41 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "bavel-tower-course",
  name: "A Course of the Tower", title: "A Course of the Tower",
  description: "Whose top may reach to heaven; raise six scaffold tiers of the tower.",
  giver: Object.freeze({ id: "nimrod", name: "Nimrod", position: Object.freeze({ x: -120, y: 0, z: -40 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "fence", count: 6,
      description: "Raise six scaffold tiers.", marker: Object.freeze({ x: -124, y: 0, z: -39 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "bavel-one-tongue",
  name: "One Tongue", title: "One Tongue",
  description: "The whole earth was of one language; Ever teaches the holy tongue before it is confounded.",
  giver: Object.freeze({ id: "ever", name: "Ever", position: Object.freeze({ x: -114, y: 0, z: -46 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 3,
      description: "Learn three passages in the holy tongue.", marker: Object.freeze({ x: -113, y: 0, z: -45 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "bavel-confusion",
  name: "The Confusion", title: "The Confusion",
  description: "Havayah confounds their language; warn Nimrod, then leave the plain of Shinar.",
  giver: Object.freeze({ id: "ever", name: "Ever", position: Object.freeze({ x: -114, y: 0, z: -46 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "nimrod", count: 1,
      description: "Warn Nimrod of the confusion.", marker: Object.freeze({ x: -120, y: 0, z: -40 }) }),
    Object.freeze({ eventType: "travel", target: "shinar-plain", count: 1,
      description: "Leave across the plain of Shinar.", marker: Object.freeze({ x: -110, y: 0, z: -50 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "bavel-taskmaster-round",
  name: "The Taskmaster’s Round", title: "The Taskmaster’s Round",
  description: "The tower’s taskmasters drive the builders without mercy; drive them off.",
  giver: Object.freeze({ id: "ever", name: "Ever", position: Object.freeze({ x: -116, y: 0, z: -44 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "bavel-taskmaster", count: 3,
      description: "Drive off three cruel taskmasters.", marker: Object.freeze({ x: -121, y: 0, z: -41 }) }),
  ]),
  reward: Object.freeze({ xp: 220, mitzvahPoints: 7 }),
  multiplayer: true
}),
Object.freeze({
  id: "bavel-scattered",
  name: "Scattered Abroad", title: "Scattered Abroad",
  description: "Havayah scatters them over the face of the earth; walk the road of the scattered.",
  giver: Object.freeze({ id: "ever", name: "Ever", position: Object.freeze({ x: -112, y: 0, z: -48 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "four-winds", count: 1,
      description: "Walk the road of the scattered.", marker: Object.freeze({ x: -106, y: 0, z: -46 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "bavel-watchers-height",
  name: "Watchers on the Height", title: "Watchers on the Height",
  description: "A warden of the tower’s height still demands bricks for heaven; bring him down.",
  giver: Object.freeze({ id: "ever", name: "Ever", position: Object.freeze({ x: -118, y: 0, z: -36 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "elite", target: "bavel-ziggurat-warden", count: 1,
      description: "Defeat the warden of the tower’s height.", marker: Object.freeze({ x: -121, y: 0, z: -42 }) }),
  ]),
  reward: Object.freeze({ xp: 340, mitzvahPoints: 10 }),
  multiplayer: true
}),
Object.freeze({
  id: "bavel-ashur-leaves",
  name: "Ashur Leaves", title: "Ashur Leaves",
  description: "Ashur goes out and builds Nineveh; follow Ever’s counsel and leave Shinar behind.",
  giver: Object.freeze({ id: "ever", name: "Ever", position: Object.freeze({ x: -114, y: 0, z: -46 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "shinar-plain", count: 1,
      description: "Travel out of the plain of Shinar.", marker: Object.freeze({ x: -118, y: 0, z: -42 }) }),
    Object.freeze({ eventType: "talk", target: "ever", count: 1,
      description: "Hear Ever’s counsel on the road.", marker: Object.freeze({ x: -114, y: 0, z: -46 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "avraham-ur-road",
  name: "The Road from Ur", title: "The Road from Ur",
  description: "Avraham leaves Ur of the Kasdim with Terach his father; walk the first road with him.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "ur-road", count: 1,
      description: "Walk the road out of Ur.", marker: Object.freeze({ x: 16, y: 0, z: 16 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "lech-lecha-call",
  name: "Lech Lecha", title: "Lech Lecha",
  description: "Havayah says to Avram: go for yourself from your land; walk the road of the call.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "charan-road", count: 1,
      description: "Walk the road of Lech Lecha.", marker: Object.freeze({ x: 24, y: 0, z: 24 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "avraham-altar-at-shechem",
  name: "An Altar at Shechem", title: "An Altar at Shechem",
  description: "Avraham builds an altar to Havayah who appeared to him at Shechem.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 22, y: 0, z: 18 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "bench", count: 1,
      description: "Raise one stone bench for the altar.", marker: Object.freeze({ x: 24, y: 0, z: 16 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "avraham-famine-descent",
  name: "Descent in Famine", title: "Descent in Famine",
  description: "A famine grips the land; Avraham goes down to Mitzrayim to sojourn.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "mitzrayim-road", count: 1,
      description: "Descend the road to Mitzrayim.", marker: Object.freeze({ x: 14, y: 0, z: 26 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "avraham-wealth-of-flocks",
  name: "Wealth of Flocks", title: "Wealth of Flocks",
  description: "Avraham is very rich in cattle; tend eight head of his great flocks.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 24, y: 0, z: 24 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 8,
      description: "Tend eight head of Avraham’s cattle.", marker: Object.freeze({ x: 27, y: 0, z: 21 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "avraham-lot-parting",
  name: "Parting from Lot", title: "Parting from Lot",
  description: "Let there be no strife between us; tell Lot of the parting, then climb the hills of Canaan.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "lot", count: 1,
      description: "Tell Lot of the peaceful parting.", marker: Object.freeze({ x: 17, y: 0, z: 22 }) }),
    Object.freeze({ eventType: "travel", target: "canaan-hills", count: 1,
      description: "Climb into the hills of Canaan.", marker: Object.freeze({ x: 25, y: 0, z: 17 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "avraham-four-kings",
  name: "The Four Kings", title: "The Four Kings",
  description: "The four kings take Lot captive; ride out with Avraham’s trained men and free him.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 18, y: 0, z: 16 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "kedem-raider", count: 4,
      description: "Defeat four raiders of the kings.", marker: Object.freeze({ x: 12, y: 0, z: 10 }) }),
  ]),
  reward: Object.freeze({ xp: 260, mitzvahPoints: 8 }),
  multiplayer: true
}),
Object.freeze({
  id: "avraham-melchizedek-bread",
  name: "Bread and Wine", title: "Bread and Wine",
  description: "Malki-Tzedek king of Shalem brings bread and wine; buy provisions for the returning men.",
  giver: Object.freeze({ id: "malki-tzedek", name: "Malki-Tzedek", position: Object.freeze({ x: 26, y: 0, z: 22 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "purchase", target: "travel-bread", count: 2,
      description: "Buy two loaves of travel bread.", marker: Object.freeze({ x: 28, y: 0, z: 24 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "avraham-covenant-pieces",
  name: "The Covenant of the Pieces", title: "The Covenant of the Pieces",
  description: "Take a heifer, a goat, and a ram; prepare the pieces of the covenant between the parts.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "harvest", target: "kosher-animal", count: 3,
      description: "Prepare three beasts for the covenant.", marker: Object.freeze({ x: 18, y: 0, z: 23 }) }),
  ]),
  reward: Object.freeze({ xp: 180, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "avraham-stars-of-heaven",
  name: "Stars of Heaven", title: "Stars of Heaven",
  description: "Look now toward heaven and count the stars; learn the promise of the seed.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of the starry promise.", marker: Object.freeze({ x: 21, y: 0, z: 18 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "hagar-spring-water",
  name: "Hagar’s Spring Water", title: "Hagar’s Spring Water",
  description: "Hagar flees to the wilderness spring; carry water-skins to her on the road to Shur.",
  giver: Object.freeze({ id: "hagar", name: "Hagar", position: Object.freeze({ x: 28, y: 0, z: 28 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "water-skin", count: 4,
      description: "Fill four water-skins at the spring.", marker: Object.freeze({ x: 31, y: 0, z: 26 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "hagar-well-of-sight",
  name: "The Well of Sight", title: "The Well of Sight",
  description: "She calls the well Beer-Lahai-Roi, the well of the Living One who sees me; find it.",
  giver: Object.freeze({ id: "hagar", name: "Hagar", position: Object.freeze({ x: 30, y: 0, z: 26 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "beer-lahai-roi", count: 1,
      description: "Reach the well of Beer-Lahai-Roi.", marker: Object.freeze({ x: 26, y: 0, z: 30 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "hagar-desert-herbs",
  name: "Herbs of the Desert", title: "Herbs of the Desert",
  description: "In the wilderness Hagar learns the desert herbs; gather them with her.",
  giver: Object.freeze({ id: "hagar", name: "Hagar", position: Object.freeze({ x: 28, y: 0, z: 28 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "activity", target: "herb-gathering", count: 2,
      description: "Gather desert herbs twice.", marker: Object.freeze({ x: 30, y: 0, z: 30 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "yishmael-raised",
  name: "Yishmael Is Raised", title: "Yishmael Is Raised",
  description: "Hagar bears Yishmael to Avraham; sit with her and hear of the wild-ass of a man.",
  giver: Object.freeze({ id: "hagar", name: "Hagar", position: Object.freeze({ x: 28, y: 0, z: 28 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "hagar", count: 2,
      description: "Hear Hagar tell of Yishmael twice.", marker: Object.freeze({ x: 28, y: 0, z: 28 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "bris-milah-sign",
  name: "The Sign of the Bris", title: "The Sign of the Bris",
  description: "Every male among you shall be circumcised at eight days; learn the covenant of the flesh.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 3,
      description: "Learn three passages of the bris.", marker: Object.freeze({ x: 19, y: 0, z: 22 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "avraham-three-visitors",
  name: "Three Visitors", title: "Three Visitors",
  description: "Three men stand by Avraham at Mamre; water their feet and hasten the calf.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 22, y: 0, z: 22 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 1,
      description: "Tend the tender calf for the guests.", marker: Object.freeze({ x: 25, y: 0, z: 23 }) }),
    Object.freeze({ eventType: "collect", target: "water-skin", count: 2,
      description: "Draw two skins of water for their feet.", marker: Object.freeze({ x: 19, y: 0, z: 20 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "sarah-laughter",
  name: "Sarah’s Laughter", title: "Sarah’s Laughter",
  description: "Sarah laughs within herself at the promise of a son; speak with her gently, twice.",
  giver: Object.freeze({ id: "sarah", name: "Sarah", position: Object.freeze({ x: 24, y: 0, z: 26 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "sarah", count: 2,
      description: "Speak gently with Sarah twice.", marker: Object.freeze({ x: 24, y: 0, z: 26 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "sedom-intercession",
  name: "Intercession for Sedom", title: "Intercession for Sedom",
  description: "Shall not the Judge of all the earth do right? Plead with Avraham for the city.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "avraham", count: 3,
      description: "Plead with Avraham three times.", marker: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "akeidah-wood",
  name: "Wood for the Akeidah", title: "Wood for the Akeidah",
  description: "Avraham cleaves the wood for the burnt offering; chop the logs for Moriah.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "chop", target: "fallen-wood", count: 5,
      description: "Chop five logs for the offering.", marker: Object.freeze({ x: 17, y: 0, z: 17 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "akeidah-moriah-road",
  name: "The Road to Moriah", title: "The Road to Moriah",
  description: "On the third day Avraham lifts his eyes to the place afar; walk the road with him.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "moriah-road", count: 1,
      description: "Walk the three-day road to Moriah.", marker: Object.freeze({ x: 26, y: 0, z: 26 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "akeidah-ram-thicket",
  name: "The Ram in the Thicket", title: "The Ram in the Thicket",
  description: "Behold the ram caught in the thicket by its horns; prepare it for the offering.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 24, y: 0, z: 24 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "harvest", target: "kosher-animal", count: 1,
      description: "Prepare the ram from the thicket.", marker: Object.freeze({ x: 26, y: 0, z: 22 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "akeidah-havayah-yireh",
  name: "Havayah Yireh", title: "Havayah Yireh",
  description: "Avraham calls the place Havayah Yireh; learn its words and tell Avraham what you saw.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of Havayah Yireh.", marker: Object.freeze({ x: 21, y: 0, z: 21 }) }),
    Object.freeze({ eventType: "talk", target: "avraham", count: 1,
      description: "Tell Avraham what you saw on Moriah.", marker: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "sarah-cave-purchase",
  name: "The Cave of Machpelah", title: "The Cave of Machpelah",
  description: "Avraham buys the cave of Machpelah from Ephron for four hundred shekels; seal the purchase.",
  giver: Object.freeze({ id: "avraham", name: "Avraham", position: Object.freeze({ x: 20, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "purchase", target: "burial-cave", count: 1,
      description: "Purchase the cave of Machpelah.", marker: Object.freeze({ x: 24, y: 0, z: 16 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "eliezer-oath",
  name: "Eliezer’s Oath", title: "Eliezer’s Oath",
  description: "Eliezer puts his hand under Avraham’s thigh and swears; learn the oath of the servant.",
  giver: Object.freeze({ id: "eliezer", name: "Eliezer", position: Object.freeze({ x: 26, y: 0, z: 18 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "eliezer", count: 1,
      description: "Hear Eliezer’s oath.", marker: Object.freeze({ x: 26, y: 0, z: 18 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the oath.", marker: Object.freeze({ x: 28, y: 0, z: 19 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "rivkah-at-the-well",
  name: "Rivkah at the Well", title: "Rivkah at the Well",
  description: "Eliezer prays at the well of Nachor’s city; raise a well and draw for the sign.",
  giver: Object.freeze({ id: "eliezer", name: "Eliezer", position: Object.freeze({ x: 28, y: 0, z: 16 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "well", count: 1,
      description: "Raise a well at Nachor’s city.", marker: Object.freeze({ x: 26, y: 0, z: 19 }) }),
    Object.freeze({ eventType: "collect", target: "water-skin", count: 3,
      description: "Draw three skins as the sign.", marker: Object.freeze({ x: 31, y: 0, z: 15 }) }),
  ]),
  reward: Object.freeze({ xp: 180, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "rivkah-camels-watered",
  name: "Watering the Camels", title: "Watering the Camels",
  description: "Rivkah hastens to water all ten camels; help her tend the great thirsty beasts.",
  giver: Object.freeze({ id: "rivkah", name: "Rivkah", position: Object.freeze({ x: 30, y: 0, z: 18 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 10,
      description: "Water ten camels with Rivkah.", marker: Object.freeze({ x: 26, y: 0, z: 20 }) }),
  ]),
  reward: Object.freeze({ xp: 170, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "rivkah-bracelets",
  name: "Bracelets of Gold", title: "Bracelets of Gold",
  description: "A golden nose-ring and two bracelets for her hands; buy the gold for Rivkah.",
  giver: Object.freeze({ id: "eliezer", name: "Eliezer", position: Object.freeze({ x: 28, y: 0, z: 16 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "purchase", target: "gold-band", count: 2,
      description: "Buy two golden bracelets.", marker: Object.freeze({ x: 30, y: 0, z: 14 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yitzchak-field-prayer",
  name: "Prayer in the Field", title: "Prayer in the Field",
  description: "Yitzchak goes out to meditate in the field at evening; speak with him and walk the hills.",
  giver: Object.freeze({ id: "yitzchak", name: "Yitzchak", position: Object.freeze({ x: 32, y: 0, z: 20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yitzchak", count: 1,
      description: "Speak with Yitzchak in the field.", marker: Object.freeze({ x: 32, y: 0, z: 20 }) }),
    Object.freeze({ eventType: "travel", target: "canaan-hills", count: 1,
      description: "Walk the evening hills of Canaan.", marker: Object.freeze({ x: 36, y: 0, z: 16 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yitzchak-esek-well",
  name: "The Well of Esek", title: "The Well of Esek",
  description: "Yitzchak digs the well of Esek, contention; raise its stones with him.",
  giver: Object.freeze({ id: "yitzchak", name: "Yitzchak", position: Object.freeze({ x: 55, y: 0, z: 45 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "well", count: 1,
      description: "Raise the well of Esek.", marker: Object.freeze({ x: 57, y: 0, z: 47 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yitzchak-sitnah-strife",
  name: "Strife at Sitnah", title: "Strife at Sitnah",
  description: "The herdsmen of Gerar strive over Sitnah; drive the raiders from the well.",
  giver: Object.freeze({ id: "yitzchak", name: "Yitzchak", position: Object.freeze({ x: 57, y: 0, z: 43 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "well-raider", count: 2,
      description: "Drive two raiders from Sitnah.", marker: Object.freeze({ x: 53, y: 0, z: 40 }) }),
  ]),
  reward: Object.freeze({ xp: 200, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "yitzchak-rechovot-room",
  name: "Room at Rechovot", title: "Room at Rechovot",
  description: "Now Havayah has made room for us; raise the well of Rechovot and learn its words.",
  giver: Object.freeze({ id: "yitzchak", name: "Yitzchak", position: Object.freeze({ x: 55, y: 0, z: 45 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "well", count: 1,
      description: "Raise the well of Rechovot.", marker: Object.freeze({ x: 58, y: 0, z: 43 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of Rechovot.", marker: Object.freeze({ x: 54, y: 0, z: 46 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yitzchak-gerar-famine",
  name: "Famine in Gerar", title: "Famine in Gerar",
  description: "Havayah tells Yitzchak: go not down to Mitzrayim; sojourn in Gerar instead.",
  giver: Object.freeze({ id: "yitzchak", name: "Yitzchak", position: Object.freeze({ x: 55, y: 0, z: 45 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "gerar-fields", count: 1,
      description: "Sojourn in the fields of Gerar.", marker: Object.freeze({ x: 49, y: 0, z: 49 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "yitzchak-hundredfold",
  name: "A Hundredfold", title: "A Hundredfold",
  description: "Yitzchak sows in that land and reaps a hundredfold; gather the blessed sheaves.",
  giver: Object.freeze({ id: "yitzchak", name: "Yitzchak", position: Object.freeze({ x: 53, y: 0, z: 47 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "grain-sheaf", count: 10,
      description: "Gather ten sheaves of the hundredfold.", marker: Object.freeze({ x: 57, y: 0, z: 46 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yitzchak-blessing",
  name: "The Blessing", title: "The Blessing",
  description: "Rivkah prepares the savory meat; bring Yitzchak’s blessing to Yackov and prepare the kid.",
  giver: Object.freeze({ id: "rivkah", name: "Rivkah", position: Object.freeze({ x: 57, y: 0, z: 47 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yitzchak", count: 2,
      description: "Carry word of the blessing twice.", marker: Object.freeze({ x: 55, y: 0, z: 45 }) }),
    Object.freeze({ eventType: "harvest", target: "kosher-animal", count: 1,
      description: "Prepare one kid for the savory meat.", marker: Object.freeze({ x: 59, y: 0, z: 49 }) }),
  ]),
  reward: Object.freeze({ xp: 180, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "esav-lentil-stew",
  name: "The Lentil Stew", title: "The Lentil Stew",
  description: "Esav comes faint from the field; fill two bowls of the red lentil stew.",
  giver: Object.freeze({ id: "esav", name: "Esav", position: Object.freeze({ x: 59, y: 0, z: 41 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "stew-bowl", count: 2,
      description: "Fill two bowls of lentil stew.", marker: Object.freeze({ x: 57, y: 0, z: 44 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "esav-birthright-sale",
  name: "Sale of the Birthright", title: "Sale of the Birthright",
  description: "Behold, I am going to die; of what use is the birthright? Witness the sale.",
  giver: Object.freeze({ id: "yitzchak", name: "Yitzchak", position: Object.freeze({ x: 55, y: 0, z: 45 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "esav", count: 1,
      description: "Hear Esav sell the birthright.", marker: Object.freeze({ x: 58, y: 0, z: 46 }) }),
    Object.freeze({ eventType: "talk", target: "yackov", count: 1,
      description: "Hear Yackov buy the birthright.", marker: Object.freeze({ x: 52, y: 0, z: 46 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yitzchak-akeidah-memory",
  name: "Memory of the Akeidah", title: "Memory of the Akeidah",
  description: "Yitzchak was bound on the altar of Moriah; learn what he remembers of that day.",
  giver: Object.freeze({ id: "yitzchak", name: "Yitzchak", position: Object.freeze({ x: 55, y: 0, z: 45 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of the Akeidah’s memory.", marker: Object.freeze({ x: 56, y: 0, z: 43 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-ladder-dream",
  name: "The Ladder Dream", title: "The Ladder Dream",
  description: "A ladder set on the earth with its top reaching heaven; learn the dream of Bethel.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 3,
      description: "Learn three passages of the ladder dream.", marker: Object.freeze({ x: 86, y: 0, z: -14 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-bethel-stone",
  name: "The Stone at Bethel", title: "The Stone at Bethel",
  description: "Yackov sets the stone as a pillar and pours oil on its top; raise the bench and bring oil.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 87, y: 0, z: -13 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "bench", count: 1,
      description: "Raise one stone pillar at Bethel.", marker: Object.freeze({ x: 85, y: 0, z: -11 }) }),
    Object.freeze({ eventType: "collect", target: "oil-flask", count: 1,
      description: "Bring one flask of oil.", marker: Object.freeze({ x: 89, y: 0, z: -15 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-charan-road",
  name: "The Road to Charan", title: "The Road to Charan",
  description: "Yackov flees Esav’s anger toward Charan; walk the exile road with him.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "charan-road", count: 1,
      description: "Walk the road to Charan.", marker: Object.freeze({ x: 91, y: 0, z: -21 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-rachel-at-well",
  name: "Rachel at the Well", title: "Rachel at the Well",
  description: "Rachel comes with her father’s sheep; draw water with her and speak.",
  giver: Object.freeze({ id: "rachel", name: "Rachel", position: Object.freeze({ x: 92, y: 0, z: -18 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "water-skin", count: 3,
      description: "Draw three skins for the flock.", marker: Object.freeze({ x: 89, y: 0, z: -16 }) }),
    Object.freeze({ eventType: "talk", target: "rachel", count: 1,
      description: "Speak with Rachel at the well.", marker: Object.freeze({ x: 92, y: 0, z: -18 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-seven-years",
  name: "Seven Years for Rachel", title: "Seven Years for Rachel",
  description: "Yackov serves seven years for Rachel, and they seem but days; tend Lavan’s flocks.",
  giver: Object.freeze({ id: "lavan", name: "Lavan", position: Object.freeze({ x: 115, y: 0, z: -55 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 7,
      description: "Tend seven head of Lavan’s flocks.", marker: Object.freeze({ x: 118, y: 0, z: -57 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-speckled-flocks",
  name: "The Speckled Flocks", title: "The Speckled Flocks",
  description: "The speckled and spotted shall be my wages; tend them and set one aside.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 88, y: 0, z: -12 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 6,
      description: "Tend six speckled sheep.", marker: Object.freeze({ x: 85, y: 0, z: -9 }) }),
    Object.freeze({ eventType: "harvest", target: "kosher-animal", count: 1,
      description: "Set aside one spotted lamb.", marker: Object.freeze({ x: 90, y: 0, z: -14 }) }),
  ]),
  reward: Object.freeze({ xp: 190, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "rachel-dudaim",
  name: "The Dudaim", title: "The Dudaim",
  description: "Reuven finds dudaim in the wheat harvest; gather the fragrant herbs with Rachel.",
  giver: Object.freeze({ id: "rachel", name: "Rachel", position: Object.freeze({ x: 92, y: 0, z: -18 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "activity", target: "herb-gathering", count: 2,
      description: "Gather dudaim herbs twice.", marker: Object.freeze({ x: 94, y: 0, z: -15 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-wages-ten-times",
  name: "Wages Changed Ten Times", title: "Wages Changed Ten Times",
  description: "Lavan changes Yackov’s wages ten times; confront Lavan about the deceit.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "lavan", count: 2,
      description: "Confront Lavan twice about the wages.", marker: Object.freeze({ x: 81, y: 0, z: -19 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-flight-from-lavan",
  name: "Flight from Lavan", title: "Flight from Lavan",
  description: "Yackov steals away with all he has and crosses toward Gilad; flee the road with him.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 90, y: 0, z: -20 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "gilad-road", count: 1,
      description: "Flee the road toward Gilad.", marker: Object.freeze({ x: 95, y: 0, z: -15 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-galeed-heap",
  name: "The Heap of Galeed", title: "The Heap of Galeed",
  description: "They gather stones into a heap of witness; pile the field stones.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 93, y: 0, z: -23 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "field-stone", count: 5,
      description: "Pile five stones of witness.", marker: Object.freeze({ x: 91, y: 0, z: -26 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-machanayim-angels",
  name: "Angels at Machanayim", title: "Angels at Machanayim",
  description: "This is the camp of Elokim; speak with Yackov of the angels he met.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yackov", count: 2,
      description: "Hear of Machanayim twice.", marker: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-night-wrestling",
  name: "Wrestling at Night", title: "Wrestling at Night",
  description: "A man wrestles with Yackov until dawn at the ford of Yabok; face him and endure.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 82, y: 0, z: -18 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "elite", target: "penuel-wrestler", count: 1,
      description: "Wrestle the stranger until dawn.", marker: Object.freeze({ x: 77, y: 0, z: -15 }) }),
  ]),
  reward: Object.freeze({ xp: 380, mitzvahPoints: 12 }),
  multiplayer: true
}),
Object.freeze({
  id: "yackov-face-of-elokim",
  name: "The Face of Elokim", title: "The Face of Elokim",
  description: "I have seen Elokim face to face, and my life is spared; learn Penuel’s words.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of Penuel.", marker: Object.freeze({ x: 86, y: 0, z: -16 }) }),
    Object.freeze({ eventType: "talk", target: "yackov", count: 1,
      description: "Ask Yackov of the wrestling.", marker: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-esav-embrace",
  name: "Esav’s Embrace", title: "Esav’s Embrace",
  description: "Esav runs to meet him and embraces him; bring the peace-gift and witness the kiss.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "esav", count: 1,
      description: "Greet Esav at the meeting.", marker: Object.freeze({ x: 89, y: 0, z: -13 }) }),
    Object.freeze({ eventType: "purchase", target: "peace-gift", count: 1,
      description: "Buy the peace-gift for Esav.", marker: Object.freeze({ x: 83, y: 0, z: -17 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "leah-sons",
  name: "Leah’s Sons", title: "Leah’s Sons",
  description: "Leah bears Reuven, Shimon, Levi, and Yehudah; hear her name each son.",
  giver: Object.freeze({ id: "leah", name: "Leah", position: Object.freeze({ x: 80, y: 0, z: -10 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "leah", count: 3,
      description: "Hear Leah name her sons thrice.", marker: Object.freeze({ x: 80, y: 0, z: -10 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "rachel-yosef-born",
  name: "Yosef Is Born", title: "Yosef Is Born",
  description: "Elokim remembers Rachel and she bears Yosef; rejoice with her and tend the flock.",
  giver: Object.freeze({ id: "rachel", name: "Rachel", position: Object.freeze({ x: 92, y: 0, z: -18 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "rachel", count: 1,
      description: "Rejoice with Rachel.", marker: Object.freeze({ x: 92, y: 0, z: -18 }) }),
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 2,
      description: "Tend two lambs of the rejoicing.", marker: Object.freeze({ x: 95, y: 0, z: -17 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-succos-booths",
  name: "Booths at Succos", title: "Booths at Succos",
  description: "Yackov journeys to Succos and builds booths for his cattle; raise two booths.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "sukkah", count: 2,
      description: "Raise two booths at Succos.", marker: Object.freeze({ x: 82, y: 0, z: -18 }) }),
  ]),
  reward: Object.freeze({ xp: 170, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "dinah-shechem",
  name: "Dinah at Shechem", title: "Dinah at Shechem",
  description: "The men of Shechem wrong Dinah; drive their raiders from the city gate.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 83, y: 0, z: -17 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "shechem-raider", count: 3,
      description: "Drive three raiders from Shechem.", marker: Object.freeze({ x: 78, y: 0, z: -22 }) }),
  ]),
  reward: Object.freeze({ xp: 240, mitzvahPoints: 7 }),
  multiplayer: true
}),
Object.freeze({
  id: "yackov-bethel-return",
  name: "Return to Bethel", title: "Return to Bethel",
  description: "Arise, go up to Bethel; return to the house of Elokim and raise its pillar again.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "bethel-road", count: 1,
      description: "Go up the road to Bethel.", marker: Object.freeze({ x: 88, y: 0, z: -12 }) }),
    Object.freeze({ eventType: "build", target: "bench", count: 1,
      description: "Raise the pillar at Bethel again.", marker: Object.freeze({ x: 83, y: 0, z: -17 }) }),
  ]),
  reward: Object.freeze({ xp: 170, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "binyamin-born",
  name: "Binyamin Is Born", title: "Binyamin Is Born",
  description: "Rachel dies bearing Binyamin on the road to Ephras; stand with Yackov in his grief.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yackov", count: 1,
      description: "Stand with Yackov in his grief.", marker: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-coat-of-colors",
  name: "The Coat of Colors", title: "The Coat of Colors",
  description: "Yisrael loves Yosef and makes him a coat of colors; buy the dyed wool.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "purchase", target: "dyed-wool", count: 3,
      description: "Buy three skeins of dyed wool.", marker: Object.freeze({ x: 87, y: 0, z: -13 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-sheaf-dream",
  name: "The Dream of Sheaves", title: "The Dream of Sheaves",
  description: "Behold, your sheaves bow to my sheaf; learn the first dream of Yosef.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: 100, y: 0, z: 40 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of the sheaf dream.", marker: Object.freeze({ x: 101, y: 0, z: 41 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-stars-bow",
  name: "Sun, Moon, and Stars", title: "Sun, Moon, and Stars",
  description: "The sun, moon, and eleven stars bow to me; tell Yackov and learn its rebuke.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: 100, y: 0, z: 40 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yackov", count: 1,
      description: "Tell Yackov the second dream.", marker: Object.freeze({ x: 96, y: 0, z: 36 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the rebuke.", marker: Object.freeze({ x: 101, y: 0, z: 41 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-dosan-pit",
  name: "The Road to Dosan", title: "The Road to Dosan",
  description: "Go see the welfare of your brothers at Dosan; walk the road Yosef walked.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: 100, y: 0, z: 40 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "dosan-road", count: 1,
      description: "Walk the road to Dosan.", marker: Object.freeze({ x: 106, y: 0, z: 38 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-coat-stripped",
  name: "The Coat Stripped", title: "The Coat Stripped",
  description: "They strip Yosef of his coat and cast him into the pit; hear Reuven’s plan to save him.",
  giver: Object.freeze({ id: "reuven", name: "Reuven", position: Object.freeze({ x: 104, y: 0, z: 44 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "reuven", count: 1,
      description: "Hear Reuven’s plan to save Yosef.", marker: Object.freeze({ x: 104, y: 0, z: 44 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-sold-twenty",
  name: "Sold for Twenty Silver", title: "Sold for Twenty Silver",
  description: "Yishmaelite merchants buy Yosef for twenty silver; speak with them and follow to Mitzrayim.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: 100, y: 0, z: 40 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yishmaelite", count: 1,
      description: "Speak with the Yishmaelite merchants.", marker: Object.freeze({ x: 95, y: 0, z: 43 }) }),
    Object.freeze({ eventType: "travel", target: "mitzrayim-road", count: 1,
      description: "Follow the caravan to Mitzrayim.", marker: Object.freeze({ x: 92, y: 0, z: 48 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yehudah-tamar-pledge",
  name: "Tamar’s Pledge", title: "Tamar’s Pledge",
  description: "Tamar takes Yehudah’s seal, cord, and staff as pledge; buy the cord and witness.",
  giver: Object.freeze({ id: "yehudah", name: "Yehudah", position: Object.freeze({ x: 108, y: 0, z: 48 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "tamar", count: 1,
      description: "Hear Tamar’s demand.", marker: Object.freeze({ x: 110, y: 0, z: 50 }) }),
    Object.freeze({ eventType: "purchase", target: "seal-cord", count: 1,
      description: "Buy the seal-cord for the pledge.", marker: Object.freeze({ x: 106, y: 0, z: 46 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-potiphar-house",
  name: "Steward of the House", title: "Steward of the House",
  description: "Havayah is with Yosef in Potiphar’s house; gather grain for the steward’s stores.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: -60, y: 0, z: 90 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "grain-sheaf", count: 6,
      description: "Gather six sheaves for the house.", marker: Object.freeze({ x: -57, y: 0, z: 88 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-prison-dreams",
  name: "Dreams in Prison", title: "Dreams in Prison",
  description: "The cupbearer and the baker dream in prison; hear both dreams and learn their telling.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: -62, y: 0, z: 88 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "cupbearer", count: 1,
      description: "Hear the cupbearer’s dream.", marker: Object.freeze({ x: -64, y: 0, z: 90 }) }),
    Object.freeze({ eventType: "talk", target: "baker", count: 1,
      description: "Hear the baker’s dream.", marker: Object.freeze({ x: -60, y: 0, z: 90 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the telling of the dreams.", marker: Object.freeze({ x: -62, y: 0, z: 86 }) }),
  ]),
  reward: Object.freeze({ xp: 170, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "paro-seven-cows",
  name: "Seven Cows, Seven Ears", title: "Seven Cows, Seven Ears",
  description: "Paro dreams of seven fat cows and seven thin; learn the dream Yosef will tell.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: -60, y: 0, z: 90 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of Paro’s dream.", marker: Object.freeze({ x: -59, y: 0, z: 91 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-grain-stores",
  name: "Grain in the Store Cities", title: "Grain in the Store Cities",
  description: "Gather food of the seven years of plenty into Paro’s store cities.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: -64, y: 0, z: 92 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "grain-sheaf", count: 12,
      description: "Gather twelve sheaves for the stores.", marker: Object.freeze({ x: -68, y: 0, z: 95 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-egypt-honor",
  name: "Honor in Mitzrayim", title: "Honor in Mitzrayim",
  description: "Paro sets Yosef over all the land of Mitzrayim; bring him Paro’s word.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: -60, y: 0, z: 90 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "paro", count: 1,
      description: "Carry Paro’s word to Yosef.", marker: Object.freeze({ x: -66, y: 0, z: 86 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-brothers-bow",
  name: "The Brothers Bow", title: "The Brothers Bow",
  description: "The brothers bow with their faces to the earth; tell Yehudah what the dreams meant.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: -58, y: 0, z: 94 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yehudah", count: 2,
      description: "Tell Yehudah of the bowed dreams twice.", marker: Object.freeze({ x: -56, y: 0, z: 92 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-silver-cup",
  name: "The Silver Cup", title: "The Silver Cup",
  description: "The silver cup is found in Binyamin’s sack; recover the cup and speak with Binyamin.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: -60, y: 0, z: 90 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "silver-cup", count: 1,
      description: "Recover the silver cup.", marker: Object.freeze({ x: -57, y: 0, z: 92 }) }),
    Object.freeze({ eventType: "talk", target: "binyamin", count: 1,
      description: "Speak with Binyamin.", marker: Object.freeze({ x: -62, y: 0, z: 88 }) }),
  ]),
  reward: Object.freeze({ xp: 170, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "yehudah-plea",
  name: "Yehudah’s Plea", title: "Yehudah’s Plea",
  description: "Let your servant remain instead of the lad; plead with Yehudah’s own words.",
  giver: Object.freeze({ id: "yehudah", name: "Yehudah", position: Object.freeze({ x: -56, y: 0, z: 96 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yehudah", count: 3,
      description: "Plead Yehudah’s plea thrice.", marker: Object.freeze({ x: -56, y: 0, z: 96 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-ani-yosef",
  name: "Ani Yosef", title: "Ani Yosef",
  description: "I am Yosef; is my father yet alive? Tell Yosef’s brothers and tell Yackov.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: -60, y: 0, z: 90 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yosef", count: 2,
      description: "Hear Yosef reveal himself twice.", marker: Object.freeze({ x: -60, y: 0, z: 90 }) }),
    Object.freeze({ eventType: "talk", target: "yackov", count: 1,
      description: "Carry the news to Yackov.", marker: Object.freeze({ x: -56, y: 0, z: 94 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-goshen-wagons",
  name: "Wagons to Goshen", title: "Wagons to Goshen",
  description: "Paro sends wagons to carry Yackov to Goshen; ride the road and tell Yosef.",
  giver: Object.freeze({ id: "yackov", name: "Yackov", position: Object.freeze({ x: 85, y: 0, z: -15 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "goshen-road", count: 1,
      description: "Ride the wagons to Goshen.", marker: Object.freeze({ x: 77, y: 0, z: -7 }) }),
    Object.freeze({ eventType: "talk", target: "yosef", count: 1,
      description: "Tell Yosef his father comes.", marker: Object.freeze({ x: 79, y: 0, z: -9 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yackov-blesses-ephraim",
  name: "The Blessing of Ephraim", title: "The Blessing of Ephraim",
  description: "Yackov crosses his hands over Ephraim and Menasheh; hear the blessing and learn it.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: 100, y: 0, z: 40 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yackov", count: 2,
      description: "Hear Yackov’s blessing twice.", marker: Object.freeze({ x: 97, y: 0, z: 37 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the crossed hands.", marker: Object.freeze({ x: 101, y: 0, z: 41 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yosef-bones-oath",
  name: "The Oath of the Bones", title: "The Oath of the Bones",
  description: "Elokim will surely remember you; swear with Yosef over his bones and learn the oath.",
  giver: Object.freeze({ id: "yosef", name: "Yosef", position: Object.freeze({ x: 100, y: 0, z: 40 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the oath.", marker: Object.freeze({ x: 99, y: 0, z: 41 }) }),
    Object.freeze({ eventType: "talk", target: "yosef", count: 1,
      description: "Swear the oath with Yosef.", marker: Object.freeze({ x: 100, y: 0, z: 40 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
})
]);
