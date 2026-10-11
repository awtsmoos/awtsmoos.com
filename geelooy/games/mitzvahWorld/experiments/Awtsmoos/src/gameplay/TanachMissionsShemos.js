// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TanachMissionsShemos.js
 * @description Tanach mission pack A: Shemos — Moshe, the plagues, Exodus, Sinai, and the Mishkan.
 * Every mission is completable through the AdventureStore event flow:
 * accept -> recordEvent({type, target, count}) -> completed -> reward.
 */

export const SHEMOS_MISSIONS = Object.freeze([
Object.freeze({
  id: "shemos-brick-yoke",
  name: "The Brick Yoke", title: "The Brick Yoke",
  description: "Paro sets taskmasters over Yisrael with the brick yoke; gather straw and bricks for the sufferers.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -70, y: 0, z: 70 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "straw-bundle", count: 8,
      description: "Gather eight bundles of straw.", marker: Object.freeze({ x: -67, y: 0, z: 72 }) }),
    Object.freeze({ eventType: "collect", target: "clay-brick", count: 6,
      description: "Mould six bricks for the yoke.", marker: Object.freeze({ x: -73, y: 0, z: 68 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "shemos-basket-nile",
  name: "The Basket on the Nile", title: "The Basket on the Nile",
  description: "Yocheved weaves a basket of reeds for her son; gather the reeds for her.",
  giver: Object.freeze({ id: "yocheved", name: "Yocheved", position: Object.freeze({ x: -66, y: 0, z: 74 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "reed-bundle", count: 4,
      description: "Gather four bundles of reeds.", marker: Object.freeze({ x: -68, y: 0, z: 77 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "shemos-burning-bush",
  name: "The Burning Bush", title: "The Burning Bush",
  description: "The bush burns with fire yet is not consumed; climb Chorev to see the sight.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -70, y: 0, z: 70 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "chorev-mountain", count: 1,
      description: "Climb the mountain of Chorev.", marker: Object.freeze({ x: -76, y: 0, z: 76 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "shemos-holy-ground",
  name: "Holy Ground", title: "Holy Ground",
  description: "Put off your shoes, for the place is holy; learn the words from the bush.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -72, y: 0, z: 72 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages from the bush.", marker: Object.freeze({ x: -71, y: 0, z: 73 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "shemos-staff-serpent",
  name: "The Staff Becomes a Serpent", title: "The Staff Becomes a Serpent",
  description: "Cast your staff to the ground and it becomes a serpent; learn the sign and tell Moshe.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -70, y: 0, z: 70 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the first sign.", marker: Object.freeze({ x: -71, y: 0, z: 71 }) }),
    Object.freeze({ eventType: "talk", target: "moshe", count: 1,
      description: "Tell Moshe you learned the sign.", marker: Object.freeze({ x: -70, y: 0, z: 70 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "shemos-leprous-hand",
  name: "The Leprous Hand", title: "The Leprous Hand",
  description: "Put your hand into your bosom and it turns leprous as snow; learn the second sign.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -70, y: 0, z: 70 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the second sign.", marker: Object.freeze({ x: -69, y: 0, z: 69 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "shemos-aharon-mouth",
  name: "Aharon Your Mouth", title: "Aharon Your Mouth",
  description: "Aharon shall be your mouth to Paro; speak with him of the mission.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -70, y: 0, z: 70 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "aharon", count: 2,
      description: "Speak with Aharon twice of the mission.", marker: Object.freeze({ x: -68, y: 0, z: 68 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "shemos-return-mitzrayim",
  name: "Return to Mitzrayim", title: "Return to Mitzrayim",
  description: "Havayah says: return to Mitzrayim, for the seekers of your life are dead; walk back.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -70, y: 0, z: 70 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "mitzrayim-road", count: 1,
      description: "Walk the return road to Mitzrayim.", marker: Object.freeze({ x: -66, y: 0, z: 74 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "shemos-night-lodging",
  name: "The Night Lodging", title: "The Night Lodging",
  description: "At the lodging place Havayah seeks to kill him; learn the mystery of the night.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -68, y: 0, z: 68 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the night lodging.", marker: Object.freeze({ x: -69, y: 0, z: 67 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "shemos-elders-gathered",
  name: "The Elders Gathered", title: "The Elders Gathered",
  description: "Moshe gathers the elders of Yisrael and tells them Havayah’s words; call them thrice.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -70, y: 0, z: 70 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yisrael-elder", count: 3,
      description: "Call the elders together thrice.", marker: Object.freeze({ x: -70, y: 0, z: 70 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-blood-nile",
  name: "Blood in the Nile", title: "Blood in the Nile",
  description: "The waters of Mitzrayim turn to blood; draw water-skins before the river changes.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -75, y: 0, z: 85 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "water-skin", count: 4,
      description: "Draw four skins before the change.", marker: Object.freeze({ x: -72, y: 0, z: 83 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-frogs",
  name: "The Frogs", title: "The Frogs",
  description: "Frogs swarm the land of Mitzrayim, into ovens and kneading troughs; drive them out.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -77, y: 0, z: 83 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "frog-swarm", count: 5,
      description: "Drive out five swarms of frogs.", marker: Object.freeze({ x: -81, y: 0, z: 86 }) }),
  ]),
  reward: Object.freeze({ xp: 220, mitzvahPoints: 7 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-lice",
  name: "The Lice", title: "The Lice",
  description: "Aharon strikes the dust and it becomes lice; crush the swarms.",
  giver: Object.freeze({ id: "aharon", name: "Aharon", position: Object.freeze({ x: -73, y: 0, z: 87 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "lice-swarm", count: 4,
      description: "Crush four swarms of lice.", marker: Object.freeze({ x: -71, y: 0, z: 84 }) }),
  ]),
  reward: Object.freeze({ xp: 200, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-wild-beasts",
  name: "The Wild Beasts", title: "The Wild Beasts",
  description: "Swarms of beasts fill the houses of Mitzrayim; drive the packs from the land.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -75, y: 0, z: 85 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "beast-pack", count: 4,
      description: "Drive off four packs of beasts.", marker: Object.freeze({ x: -71, y: 0, z: 87 }) }),
  ]),
  reward: Object.freeze({ xp: 230, mitzvahPoints: 7 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-pestilence",
  name: "The Pestilence", title: "The Pestilence",
  description: "A grievous pestilence strikes the cattle; tend the six surviving herds of Yisrael.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -75, y: 0, z: 85 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 6,
      description: "Tend six surviving herds.", marker: Object.freeze({ x: -78, y: 0, z: 82 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-boils",
  name: "The Boils", title: "The Boils",
  description: "Boils break out on man and beast; scatter the ash-sprites of the furnace.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -77, y: 0, z: 83 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "ash-sprite", count: 3,
      description: "Scatter three ash-sprites.", marker: Object.freeze({ x: -74, y: 0, z: 86 }) }),
  ]),
  reward: Object.freeze({ xp: 200, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-hail",
  name: "The Hail", title: "The Hail",
  description: "Hail mingled with fire rains on Mitzrayim; gather the ice-shards as a sign.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -75, y: 0, z: 85 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "ice-shard", count: 5,
      description: "Gather five hailstones.", marker: Object.freeze({ x: -77, y: 0, z: 89 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-hail-shelter",
  name: "Shelter from Hail", title: "Shelter from Hail",
  description: "Whoever fears Havayah’s word brings his cattle inside; raise fences for shelter.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -73, y: 0, z: 87 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "fence", count: 4,
      description: "Raise four shelter fences.", marker: Object.freeze({ x: -71, y: 0, z: 85 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-locusts",
  name: "The Locusts", title: "The Locusts",
  description: "The locusts cover the eye of the land; drive the swarms from the fields.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -75, y: 0, z: 85 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "locust-swarm", count: 6,
      description: "Drive off six locust swarms.", marker: Object.freeze({ x: -71, y: 0, z: 83 }) }),
  ]),
  reward: Object.freeze({ xp: 240, mitzvahPoints: 7 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-locust-glean",
  name: "Gleaning After Locusts", title: "Gleaning After Locusts",
  description: "After the locusts pass, glean what green remains for the hungry.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -77, y: 0, z: 83 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "grain-sheaf", count: 3,
      description: "Glean three sheaves.", marker: Object.freeze({ x: -80, y: 0, z: 85 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-darkness",
  name: "Darkness Over Mitzrayim", title: "Darkness Over Mitzrayim",
  description: "A darkness that may be felt covers Mitzrayim; raise lanterns for the children of Yisrael.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -75, y: 0, z: 85 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "lantern", count: 5,
      description: "Raise five lanterns in the darkness.", marker: Object.freeze({ x: -77, y: 0, z: 81 }) }),
  ]),
  reward: Object.freeze({ xp: 170, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-darkness-words",
  name: "Words in the Darkness", title: "Words in the Darkness",
  description: "In the thick darkness Havayah still speaks; learn His words by lamplight.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -75, y: 0, z: 85 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages in the darkness.", marker: Object.freeze({ x: -74, y: 0, z: 86 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-firstborn-midnight",
  name: "Midnight of the Firstborn", title: "Midnight of the Firstborn",
  description: "At midnight Havayah strikes the firstborn; learn the words of the final plague.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -75, y: 0, z: 85 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 3,
      description: "Learn three passages of the midnight.", marker: Object.freeze({ x: -76, y: 0, z: 87 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-paro-hardened",
  name: "Paro’s Hardened Heart", title: "Paro’s Hardened Heart",
  description: "Paro’s heart is hardened and he will not let them go; confront him twice.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -78, y: 0, z: 80 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "paro", count: 2,
      description: "Confront Paro twice.", marker: Object.freeze({ x: -81, y: 0, z: 75 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-signs-remembered",
  name: "Signs to Remember", title: "Signs to Remember",
  description: "Tell your son what I did in Mitzrayim; learn the signs and tell the elders.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -75, y: 0, z: 85 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of remembrance.", marker: Object.freeze({ x: -74, y: 0, z: 84 }) }),
    Object.freeze({ eventType: "talk", target: "yisrael-elder", count: 1,
      description: "Tell the elders the signs.", marker: Object.freeze({ x: -75, y: 0, z: 85 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "plague-paro-night",
  name: "Paro by Night", title: "Paro by Night",
  description: "Paro’s crown-guard bars the palace at night; slip past and face him alone.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -78, y: 0, z: 80 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "elite", target: "paro-crown-guard", count: 1,
      description: "Defeat Paro’s crown-guard.", marker: Object.freeze({ x: -80, y: 0, z: 74 }) }),
  ]),
  reward: Object.freeze({ xp: 340, mitzvahPoints: 10 }),
  multiplayer: true
}),
Object.freeze({
  id: "pesach-lamb-chosen",
  name: "The Lamb Chosen", title: "The Lamb Chosen",
  description: "Take a lamb without blemish and keep it till the fourteenth; tend and prepare it.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -60, y: 0, z: 95 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "harvest", target: "kosher-animal", count: 1,
      description: "Prepare one unblemished lamb.", marker: Object.freeze({ x: -58, y: 0, z: 97 }) }),
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 4,
      description: "Tend the lamb four days.", marker: Object.freeze({ x: -62, y: 0, z: 93 }) }),
  ]),
  reward: Object.freeze({ xp: 180, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "pesach-matzah",
  name: "Matzos in Haste", title: "Matzos in Haste",
  description: "They bake unleavened cakes in haste; gather sheaves for Miriam’s kneading.",
  giver: Object.freeze({ id: "miriam", name: "Miriam", position: Object.freeze({ x: -58, y: 0, z: 97 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "grain-sheaf", count: 8,
      description: "Gather eight sheaves for matzah.", marker: Object.freeze({ x: -55, y: 0, z: 95 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "pesach-blood-doorpost",
  name: "Blood on the Doorpost", title: "Blood on the Doorpost",
  description: "Strike the lintel with hyssop dipped in blood; buy the hyssop and learn its law.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -60, y: 0, z: 95 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "purchase", target: "hyssop-bundle", count: 1,
      description: "Buy one bundle of hyssop.", marker: Object.freeze({ x: -58, y: 0, z: 97 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the law of the doorpost.", marker: Object.freeze({ x: -61, y: 0, z: 94 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "exodus-spoils",
  name: "The Spoils of Mitzrayim", title: "The Spoils of Mitzrayim",
  description: "Yisrael asks vessels of silver and gold; buy the vessels for the departing.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -60, y: 0, z: 95 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "purchase", target: "silver-vessel", count: 2,
      description: "Buy two vessels of silver.", marker: Object.freeze({ x: -62, y: 0, z: 98 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "exodus-dough-kneading",
  name: "Kneading the Dough", title: "Kneading the Dough",
  description: "Their dough is thrust out before it is leavened; gather grain for the kneading.",
  giver: Object.freeze({ id: "miriam", name: "Miriam", position: Object.freeze({ x: -58, y: 0, z: 97 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "grain-sheaf", count: 6,
      description: "Gather six sheaves for dough.", marker: Object.freeze({ x: -61, y: 0, z: 99 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "exodus-night-watch",
  name: "The Night Watch", title: "The Night Watch",
  description: "It is a night of watching unto Havayah; learn the words of the going out.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -60, y: 0, z: 95 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of the night.", marker: Object.freeze({ x: -59, y: 0, z: 96 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "exodus-pillar-cloud",
  name: "The Pillar of Cloud", title: "The Pillar of Cloud",
  description: "Havayah goes before them in a pillar of cloud by day; follow to Sukkos.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -60, y: 0, z: 95 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "sukos-road", count: 1,
      description: "Follow the pillar to Sukkos.", marker: Object.freeze({ x: -56, y: 0, z: 99 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "exodus-pillar-fire",
  name: "The Pillar of Fire", title: "The Pillar of Fire",
  description: "By night a pillar of fire gives them light; raise lanterns along the camp.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -62, y: 0, z: 93 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "lantern", count: 3,
      description: "Raise three lanterns in the camp.", marker: Object.freeze({ x: -64, y: 0, z: 91 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "exodus-yosef-bones",
  name: "The Bones of Yosef", title: "The Bones of Yosef",
  description: "Moshe takes the bones of Yosef with him as sworn; learn the oath and tell the elders.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -60, y: 0, z: 95 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the oath.", marker: Object.freeze({ x: -59, y: 0, z: 94 }) }),
    Object.freeze({ eventType: "talk", target: "yisrael-elder", count: 1,
      description: "Tell the elders of the bones.", marker: Object.freeze({ x: -60, y: 0, z: 95 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "exodus-army-order",
  name: "Going Out as an Army", title: "Going Out as an Army",
  description: "The hosts of Havayah go out as armies; muster the elders twice.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -60, y: 0, z: 95 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yisrael-elder", count: 2,
      description: "Muster the elders twice.", marker: Object.freeze({ x: -60, y: 0, z: 95 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "pesach-bitter-herbs",
  name: "Bitter Herbs", title: "Bitter Herbs",
  description: "With bitter herbs they shall eat the Pesach; gather the maror herbs.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -60, y: 0, z: 95 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "activity", target: "herb-gathering", count: 2,
      description: "Gather bitter herbs twice.", marker: Object.freeze({ x: -57, y: 0, z: 98 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "yamsuf-paro-pursues",
  name: "Paro Pursues", title: "Paro Pursues",
  description: "Paro harnesses his chariot and pursues; hold the shore against his charioteers.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -30, y: 0, z: 110 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "mitzri-charioteer", count: 4,
      description: "Defeat four Mitzi charioteers.", marker: Object.freeze({ x: -36, y: 0, z: 114 }) }),
  ]),
  reward: Object.freeze({ xp: 260, mitzvahPoints: 8 }),
  multiplayer: true
}),
Object.freeze({
  id: "yamsuf-night-camp",
  name: "Camp by the Sea", title: "Camp by the Sea",
  description: "They camp by the sea at Pi-Hachiros; raise lanterns for the frightened camp.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -32, y: 0, z: 108 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "lantern", count: 2,
      description: "Raise two lanterns in the camp.", marker: Object.freeze({ x: -30, y: 0, z: 106 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yamsuf-stand-still",
  name: "Stand Still and See", title: "Stand Still and See",
  description: "Fear not; stand still and see the salvation of Havayah; learn the words of courage.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -30, y: 0, z: 110 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of courage.", marker: Object.freeze({ x: -29, y: 0, z: 111 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yamsuf-stretch-hand",
  name: "Stretch Out Your Hand", title: "Stretch Out Your Hand",
  description: "Lift your staff and stretch your hand over the sea; learn the command and tell Moshe.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -30, y: 0, z: 110 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the command of the sea.", marker: Object.freeze({ x: -31, y: 0, z: 111 }) }),
    Object.freeze({ eventType: "talk", target: "moshe", count: 1,
      description: "Tell Moshe you are ready.", marker: Object.freeze({ x: -30, y: 0, z: 110 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yamsuf-walls-water",
  name: "Walls of Water", title: "Walls of Water",
  description: "The waters stand as walls on right and left; walk the dry bed of the sea.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -30, y: 0, z: 110 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "yam-suf-bed", count: 1,
      description: "Walk the dry bed of Yam Suf.", marker: Object.freeze({ x: -30, y: 0, z: 116 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yamsuf-egypt-drowned",
  name: "Mitzrayim in the Sea", title: "Mitzrayim in the Sea",
  description: "The waters return and cover the chariots; drive the last charioteers into the deep.",
  giver: Object.freeze({ id: "miriam", name: "Miriam", position: Object.freeze({ x: -28, y: 0, z: 112 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "mitzri-charioteer", count: 3,
      description: "Defeat three fleeing charioteers.", marker: Object.freeze({ x: -32, y: 0, z: 108 }) }),
  ]),
  reward: Object.freeze({ xp: 240, mitzvahPoints: 7 }),
  multiplayer: true
}),
Object.freeze({
  id: "yamsuf-horse-rider",
  name: "Horse and Rider", title: "Horse and Rider",
  description: "The horse and his rider He has thrown into the sea; face Paro’s war-chief.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -30, y: 0, z: 110 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "elite", target: "paro-war-chief", count: 1,
      description: "Defeat Paro’s war-chief.", marker: Object.freeze({ x: -35, y: 0, z: 105 }) }),
  ]),
  reward: Object.freeze({ xp: 380, mitzvahPoints: 12 }),
  multiplayer: true
}),
Object.freeze({
  id: "yamsuf-song-sea",
  name: "The Song at the Sea", title: "The Song at the Sea",
  description: "Then Moshe and Yisrael sing this song to Havayah; learn its verses.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -30, y: 0, z: 110 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 3,
      description: "Learn three verses of the song.", marker: Object.freeze({ x: -29, y: 0, z: 109 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yamsuf-miriam-timbrel",
  name: "Miriam’s Timbrel", title: "Miriam’s Timbrel",
  description: "Miriam takes the timbrel and the women dance; speak with her and buy a timbrel.",
  giver: Object.freeze({ id: "miriam", name: "Miriam", position: Object.freeze({ x: -28, y: 0, z: 112 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "miriam", count: 2,
      description: "Sing with Miriam twice.", marker: Object.freeze({ x: -28, y: 0, z: 112 }) }),
    Object.freeze({ eventType: "purchase", target: "timbrel", count: 1,
      description: "Buy a timbrel for the dance.", marker: Object.freeze({ x: -26, y: 0, z: 114 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yamsuf-marah-water",
  name: "The Waters of Marah", title: "The Waters of Marah",
  description: "The waters of Marah are bitter; draw skins and refine the sweetness’ sparks.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -26, y: 0, z: 114 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "water-skin", count: 3,
      description: "Draw three skins at Marah.", marker: Object.freeze({ x: -23, y: 0, z: 116 }) }),
    Object.freeze({ eventType: "refine", target: "spark", count: 2,
      description: "Refine two sparks of sweetness.", marker: Object.freeze({ x: -28, y: 0, z: 112 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yamsuf-elim-palms",
  name: "Palms at Elim", title: "Palms at Elim",
  description: "Twelve springs and seventy palms at Elim; travel there and gather dates.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -30, y: 0, z: 110 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "elim-oasis", count: 1,
      description: "Travel to the oasis of Elim.", marker: Object.freeze({ x: -26, y: 0, z: 116 }) }),
    Object.freeze({ eventType: "collect", target: "date-cluster", count: 4,
      description: "Gather four clusters of dates.", marker: Object.freeze({ x: -33, y: 0, z: 107 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yamsuf-tree-sweetens",
  name: "The Tree Sweetens", title: "The Tree Sweetens",
  description: "Havayah shows him a tree and the waters are sweetened; chop such a tree.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -26, y: 0, z: 114 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "chop", target: "fallen-wood", count: 3,
      description: "Chop three sweetening branches.", marker: Object.freeze({ x: -30, y: 0, z: 115 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "manna-morning-dew",
  name: "Manna with the Morning Dew", title: "Manna with the Morning Dew",
  description: "In the morning the dew lies round the camp, and behold the manna; gather it.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "manna-flake", count: 10,
      description: "Gather ten flakes of manna.", marker: Object.freeze({ x: 3, y: 0, z: 107 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "manna-omer-measure",
  name: "The Omer Measure", title: "The Omer Measure",
  description: "An omer for every man, neither too much nor too little; measure with Aharon.",
  giver: Object.freeze({ id: "aharon", name: "Aharon", position: Object.freeze({ x: 2, y: 0, z: 107 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "manna-flake", count: 6,
      description: "Gather six omer-measures.", marker: Object.freeze({ x: 0, y: 0, z: 104 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "manna-shabbos-double",
  name: "A Double Portion", title: "A Double Portion",
  description: "On the sixth day they gather double for Shabbos; gather twelve and learn its law.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "manna-flake", count: 12,
      description: "Gather twelve flakes for Shabbos.", marker: Object.freeze({ x: 4, y: 0, z: 104 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the law of the double portion.", marker: Object.freeze({ x: -1, y: 0, z: 106 }) }),
  ]),
  reward: Object.freeze({ xp: 180, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "manna-no-leftovers",
  name: "No Leftovers Till Morning", title: "No Leftovers Till Morning",
  description: "Let no man leave of it till the morning; learn why the hoarders found worms.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the leftovers.", marker: Object.freeze({ x: 1, y: 0, z: 103 }) }),
  ]),
  reward: Object.freeze({ xp: 90, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "manna-coriander-glean",
  name: "Like Coriander Seed", title: "Like Coriander Seed",
  description: "The manna is like coriander seed, white; glean the desert herbs likened to it.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "activity", target: "herb-gathering", count: 3,
      description: "Glean herbs thrice like manna.", marker: Object.freeze({ x: -3, y: 0, z: 108 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "quail-evening",
  name: "Quail in the Evening", title: "Quail in the Evening",
  description: "At evening the quails come up and cover the camp; prepare four for the eating.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "harvest", target: "kosher-animal", count: 4,
      description: "Prepare four quails.", marker: Object.freeze({ x: 2, y: 0, z: 107 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "quail-plucked",
  name: "Plucking the Quail", title: "Plucking the Quail",
  description: "Aharon teaches the plucking of the quails; prepare two with his guidance.",
  giver: Object.freeze({ id: "aharon", name: "Aharon", position: Object.freeze({ x: 2, y: 0, z: 107 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "harvest", target: "kosher-animal", count: 2,
      description: "Prepare two quails.", marker: Object.freeze({ x: 0, y: 0, z: 109 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "rock-water-massah",
  name: "Water from the Rock", title: "Water from the Rock",
  description: "The people thirst at Massah and Merivah; speak with Moshe and draw skins.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "moshe", count: 1,
      description: "Speak with Moshe at the rock.", marker: Object.freeze({ x: 0, y: 0, z: 105 }) }),
    Object.freeze({ eventType: "collect", target: "water-skin", count: 5,
      description: "Draw five skins from the rock.", marker: Object.freeze({ x: 3, y: 0, z: 103 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "rock-staff-strike",
  name: "Strike the Rock", title: "Strike the Rock",
  description: "Take the staff with which you struck the Nile; learn the command and tell Aharon.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the command of the rock.", marker: Object.freeze({ x: 1, y: 0, z: 106 }) }),
    Object.freeze({ eventType: "talk", target: "aharon", count: 1,
      description: "Tell Aharon of the striking.", marker: Object.freeze({ x: -2, y: 0, z: 103 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "amalek-refidim",
  name: "Amalek at Refidim", title: "Amalek at Refidim",
  description: "Amalek comes to fight Yisrael at Refidim; Yehoshua leads you against the scouts.",
  giver: Object.freeze({ id: "yehoshua", name: "Yehoshua", position: Object.freeze({ x: 4, y: 0, z: 109 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "amalek-scout", count: 5,
      description: "Defeat five Amalek scouts.", marker: Object.freeze({ x: -1, y: 0, z: 112 }) }),
  ]),
  reward: Object.freeze({ xp: 280, mitzvahPoints: 9 }),
  multiplayer: true
}),
Object.freeze({
  id: "amalek-hands-up",
  name: "Hands Raised to Heaven", title: "Hands Raised to Heaven",
  description: "When Moshe lifts his hands Yisrael prevails; face the Amalek war-chief.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "elite", target: "amalek-war-chief", count: 1,
      description: "Defeat the Amalek war-chief.", marker: Object.freeze({ x: -4, y: 0, z: 99 }) }),
  ]),
  reward: Object.freeze({ xp: 400, mitzvahPoints: 13 }),
  multiplayer: true
}),
Object.freeze({
  id: "amalek-hur-hands",
  name: "Aharon and Chur Uphold", title: "Aharon and Chur Uphold",
  description: "Aharon and Chur hold up Moshe’s heavy hands; stand with them both.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "chur", count: 1,
      description: "Stand with Chur.", marker: Object.freeze({ x: 2, y: 0, z: 107 }) }),
    Object.freeze({ eventType: "talk", target: "aharon", count: 1,
      description: "Stand with Aharon.", marker: Object.freeze({ x: -2, y: 0, z: 107 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "yisro-counsel",
  name: "Yisro’s Counsel", title: "Yisro’s Counsel",
  description: "Yisro sees Moshe judging alone and counsels him; hear it and learn.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yisro", count: 2,
      description: "Hear Yisro’s counsel twice.", marker: Object.freeze({ x: 3, y: 0, z: 106 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the counsel.", marker: Object.freeze({ x: -1, y: 0, z: 104 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "yisro-judges",
  name: "Judges Over Thousands", title: "Judges Over Thousands",
  description: "Choose able men for rulers of thousands; muster the elders with Yisro.",
  giver: Object.freeze({ id: "yisro", name: "Yisro", position: Object.freeze({ x: 6, y: 0, z: 103 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yisrael-elder", count: 4,
      description: "Muster the elders four times.", marker: Object.freeze({ x: 6, y: 0, z: 103 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "midbar-cloud-signal",
  name: "The Cloud Signals", title: "The Cloud Signals",
  description: "When the cloud lifts they journey; follow its signal into the wilderness of Sin.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "sin-wilderness", count: 1,
      description: "Journey to the wilderness of Sin.", marker: Object.freeze({ x: 6, y: 0, z: 109 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "midbar-tents-order",
  name: "Tents in Order", title: "Tents in Order",
  description: "Each man by his banner in the ordered camp; raise three booths in their places.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "sukkah", count: 3,
      description: "Raise three ordered booths.", marker: Object.freeze({ x: -3, y: 0, z: 102 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "midbar-fire-night",
  name: "Fire by Night", title: "Fire by Night",
  description: "The pillar of fire lights the camp by night; raise four lanterns.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: -2, y: 0, z: 103 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "lantern", count: 4,
      description: "Raise four night lanterns.", marker: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "midbar-well-miriam",
  name: "Miriam’s Well", title: "Miriam’s Well",
  description: "The well of Miriam follows Yisrael in the desert; raise its stones.",
  giver: Object.freeze({ id: "miriam", name: "Miriam", position: Object.freeze({ x: 2, y: 0, z: 103 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "well", count: 1,
      description: "Raise Miriam’s well.", marker: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "midbar-murmuring",
  name: "The Murmuring", title: "The Murmuring",
  description: "The people murmur against Moshe; hear them out twice and answer with patience.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "moshe", count: 2,
      description: "Hear the murmuring twice.", marker: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "midbar-tamarisk-wood",
  name: "Tamarisk Wood", title: "Tamarisk Wood",
  description: "Betzalel needs acacia for the Mishkan; chop tamarisk logs in the wilderness.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 8, y: 0, z: 111 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "chop", target: "fallen-wood", count: 5,
      description: "Chop five tamarisk logs.", marker: Object.freeze({ x: 11, y: 0, z: 109 }) }),
  ]),
  reward: Object.freeze({ xp: 110, mitzvahPoints: 3 }),
  multiplayer: false
}),
Object.freeze({
  id: "midbar-spark-refining",
  name: "Refining the Sparks", title: "Refining the Sparks",
  description: "The wilderness journey refines holy sparks; gather and refine three.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 0, y: 0, z: 105 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "refine", target: "spark", count: 3,
      description: "Refine three wilderness sparks.", marker: Object.freeze({ x: -3, y: 0, z: 106 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-third-day",
  name: "The Third Day", title: "The Third Day",
  description: "On the third day be ready, for Havayah descends; climb toward Sinai.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "travel", target: "sinai-mountain", count: 1,
      description: "Ascend toward Har Sinai.", marker: Object.freeze({ x: 45, y: 0, z: 150 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-thunder",
  name: "Thunder on the Mountain", title: "Thunder on the Mountain",
  description: "Thunders and lightnings and a thick cloud; learn the words of the trembling.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of the thunder.", marker: Object.freeze({ x: 46, y: 0, z: 146 }) }),
  ]),
  reward: Object.freeze({ xp: 120, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-boundary",
  name: "The Boundary", title: "The Boundary",
  description: "Set bounds about the mountain and sanctify it; raise six fence segments.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 43, y: 0, z: 143 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "fence", count: 6,
      description: "Raise six boundary fences.", marker: Object.freeze({ x: 39, y: 0, z: 141 }) }),
  ]),
  reward: Object.freeze({ xp: 170, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-ten-words",
  name: "The Ten Words", title: "The Ten Words",
  description: "And Elokim spoke all these words; learn the Ten Words by heart.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 10,
      description: "Learn the Ten Words.", marker: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  ]),
  reward: Object.freeze({ xp: 300, mitzvahPoints: 10 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-anochi",
  name: "Anochi", title: "Anochi",
  description: "I am Havayah your Elokim who brought you out of Mitzrayim; learn the first word and tell Moshe.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the first word: Anochi.", marker: Object.freeze({ x: 46, y: 0, z: 144 }) }),
    Object.freeze({ eventType: "talk", target: "moshe", count: 1,
      description: "Tell Moshe you learned it.", marker: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-no-image",
  name: "No Graven Image", title: "No Graven Image",
  description: "You shall not make a graven image; smash the idol-husks at the mountain’s foot.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 47, y: 0, z: 147 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "idol-husk", count: 2,
      description: "Smash two idol-husks.", marker: Object.freeze({ x: 44, y: 0, z: 150 }) }),
  ]),
  reward: Object.freeze({ xp: 220, mitzvahPoints: 7 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-shabbos-word",
  name: "The Shabbos Word", title: "The Shabbos Word",
  description: "Remember the Shabbos day to keep it holy; learn its word and raise a resting bench.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of Shabbos.", marker: Object.freeze({ x: 44, y: 0, z: 146 }) }),
    Object.freeze({ eventType: "build", target: "bench", count: 1,
      description: "Raise one resting bench.", marker: Object.freeze({ x: 47, y: 0, z: 143 }) }),
  ]),
  reward: Object.freeze({ xp: 180, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-covenant-book",
  name: "The Book of the Covenant", title: "The Book of the Covenant",
  description: "Moshe reads the book of the covenant in their hearing; tell the elders and learn.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yisrael-elder", count: 3,
      description: "Tell the elders thrice.", marker: Object.freeze({ x: 47, y: 0, z: 147 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the passage of the covenant.", marker: Object.freeze({ x: 43, y: 0, z: 143 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-seventy-elders",
  name: "Seventy Elders", title: "Seventy Elders",
  description: "Seventy elders ascend and see the Elokim of Yisrael; muster them five times.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yisrael-elder", count: 5,
      description: "Muster the seventy elders.", marker: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-forty-days",
  name: "Forty Days and Nights", title: "Forty Days and Nights",
  description: "Moshe is on the mountain forty days and nights; learn what he received.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 4,
      description: "Learn four passages of the forty days.", marker: Object.freeze({ x: 46, y: 0, z: 147 }) }),
  ]),
  reward: Object.freeze({ xp: 170, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-tablets",
  name: "The Tablets of Stone", title: "The Tablets of Stone",
  description: "Tables of stone written with the finger of Elokim; carry two tablets down.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 47, y: 0, z: 143 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "stone-tablet", count: 2,
      description: "Carry two tablets of stone.", marker: Object.freeze({ x: 45, y: 0, z: 147 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "sinai-golden-calf",
  name: "The Golden Calf", title: "The Golden Calf",
  description: "The people make a molten calf and dance; shatter the revel and its husks.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 45, y: 0, z: 145 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "defeat", target: "calf-idol-husk", count: 3,
      description: "Shatter three calf-idol husks.", marker: Object.freeze({ x: 40, y: 0, z: 142 }) }),
  ]),
  reward: Object.freeze({ xp: 260, mitzvahPoints: 8 }),
  multiplayer: true
}),
Object.freeze({
  id: "mishkan-freewill",
  name: "Freewill Offerings", title: "Freewill Offerings",
  description: "Every willing heart brings gold for the Mishkan; call the elders and gather thread.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 65, y: 0, z: 125 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "yisrael-elder", count: 2,
      description: "Call the willing-hearted twice.", marker: Object.freeze({ x: 65, y: 0, z: 125 }) }),
    Object.freeze({ eventType: "collect", target: "gold-thread", count: 3,
      description: "Gather three spools of gold thread.", marker: Object.freeze({ x: 68, y: 0, z: 123 }) }),
  ]),
  reward: Object.freeze({ xp: 170, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-acacia",
  name: "Acacia Wood", title: "Acacia Wood",
  description: "The boards are of acacia wood standing up; chop eight acacia logs with Betzalel.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 67, y: 0, z: 123 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "chop", target: "fallen-wood", count: 8,
      description: "Chop eight acacia logs.", marker: Object.freeze({ x: 64, y: 0, z: 126 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-curtains",
  name: "Curtains of Linen", title: "Curtains of Linen",
  description: "Ten curtains of fine twined linen; gather six folds for the weavers.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 65, y: 0, z: 125 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "linen-fold", count: 6,
      description: "Gather six folds of linen.", marker: Object.freeze({ x: 67, y: 0, z: 122 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-goat-hair",
  name: "Goats’ Hair", title: "Goats’ Hair",
  description: "Eleven curtains of goats’ hair for the tent; tend five goats with Betzalel.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 63, y: 0, z: 127 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "care", target: "kosher-animal", count: 5,
      description: "Tend five goats for their hair.", marker: Object.freeze({ x: 61, y: 0, z: 129 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-ram-skins",
  name: "Ram Skins Dyed Red", title: "Ram Skins Dyed Red",
  description: "The covering of ram skins dyed red; prepare two rams for the covering.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 67, y: 0, z: 123 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "harvest", target: "kosher-animal", count: 2,
      description: "Prepare two rams for skins.", marker: Object.freeze({ x: 70, y: 0, z: 124 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-boards",
  name: "Boards of the Mishkan", title: "Boards of the Mishkan",
  description: "Forty-eight boards of the Mishkan; haul ten acacia beams.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 65, y: 0, z: 125 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "acacia-beam", count: 10,
      description: "Haul ten acacia beams.", marker: Object.freeze({ x: 61, y: 0, z: 123 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-sockets",
  name: "Sockets of Silver", title: "Sockets of Silver",
  description: "A hundred sockets of silver for the boards; gather eight sockets.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 63, y: 0, z: 125 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "silver-socket", count: 8,
      description: "Gather eight silver sockets.", marker: Object.freeze({ x: 65, y: 0, z: 128 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-menorah",
  name: "The Menorah", title: "The Menorah",
  description: "A menorah of pure beaten gold with seven lamps; raise its lantern and refine its sparks.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 65, y: 0, z: 125 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "lantern", count: 1,
      description: "Raise the menorah’s lantern.", marker: Object.freeze({ x: 65, y: 0, z: 127 }) }),
    Object.freeze({ eventType: "refine", target: "spark", count: 5,
      description: "Refine five sparks of its light.", marker: Object.freeze({ x: 63, y: 0, z: 123 }) }),
  ]),
  reward: Object.freeze({ xp: 220, mitzvahPoints: 7 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-ark-cover",
  name: "The Ark and Its Cover", title: "The Ark and Its Cover",
  description: "The ark of acacia overlaid with pure gold; gather thread and learn its pattern.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 67, y: 0, z: 127 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "gold-thread", count: 4,
      description: "Gather four spools of gold thread.", marker: Object.freeze({ x: 64, y: 0, z: 124 }) }),
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 1,
      description: "Learn the pattern of the ark.", marker: Object.freeze({ x: 68, y: 0, z: 128 }) }),
  ]),
  reward: Object.freeze({ xp: 170, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-table-bread",
  name: "The Table of Bread", title: "The Table of Bread",
  description: "The table and the showbread always before Him; gather grain and raise its bench.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 65, y: 0, z: 125 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "grain-sheaf", count: 6,
      description: "Gather six sheaves for the bread.", marker: Object.freeze({ x: 68, y: 0, z: 127 }) }),
    Object.freeze({ eventType: "build", target: "bench", count: 1,
      description: "Raise the table’s bench.", marker: Object.freeze({ x: 63, y: 0, z: 123 }) }),
  ]),
  reward: Object.freeze({ xp: 180, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-altar-incense",
  name: "The Incense Altar", title: "The Incense Altar",
  description: "Sweet incense morning and evening; refine four sparks for Aharon’s altar.",
  giver: Object.freeze({ id: "aharon", name: "Aharon", position: Object.freeze({ x: 69, y: 0, z: 121 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "refine", target: "spark", count: 4,
      description: "Refine four sparks of incense.", marker: Object.freeze({ x: 71, y: 0, z: 119 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-laver",
  name: "The Laver", title: "The Laver",
  description: "The laver of brass for washing; raise its well of water.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 63, y: 0, z: 123 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "well", count: 1,
      description: "Raise the laver’s well.", marker: Object.freeze({ x: 61, y: 0, z: 126 }) }),
  ]),
  reward: Object.freeze({ xp: 150, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-court-hangings",
  name: "Hangings of the Court", title: "Hangings of the Court",
  description: "A hundred cubits of fine linen hangings; raise eight fence segments.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 65, y: 0, z: 125 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "build", target: "fence", count: 8,
      description: "Raise eight court hangings.", marker: Object.freeze({ x: 69, y: 0, z: 126 }) }),
  ]),
  reward: Object.freeze({ xp: 180, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-priest-coat",
  name: "The Coat of Blue", title: "The Coat of Blue",
  description: "The robe of the ephod all of blue; buy blue thread for Aharon’s weavers.",
  giver: Object.freeze({ id: "aharon", name: "Aharon", position: Object.freeze({ x: 69, y: 0, z: 121 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "purchase", target: "blue-thread", count: 3,
      description: "Buy three skeins of blue thread.", marker: Object.freeze({ x: 67, y: 0, z: 123 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-ephod-stones",
  name: "Stones of the Ephod", title: "Stones of the Ephod",
  description: "Two onyx stones engraved with the names of Yisrael’s sons; find them.",
  giver: Object.freeze({ id: "aharon", name: "Aharon", position: Object.freeze({ x: 69, y: 0, z: 121 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "collect", target: "onyx-stone", count: 2,
      description: "Find two onyx stones.", marker: Object.freeze({ x: 72, y: 0, z: 118 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-anointing-oil",
  name: "The Anointing Oil", title: "The Anointing Oil",
  description: "Holy anointing oil compounded by the perfumer; refine sparks and press olives.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 65, y: 0, z: 125 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "refine", target: "spark", count: 3,
      description: "Refine three sparks of the oil.", marker: Object.freeze({ x: 62, y: 0, z: 127 }) }),
    Object.freeze({ eventType: "collect", target: "olive-flask", count: 2,
      description: "Press two flasks of olive oil.", marker: Object.freeze({ x: 67, y: 0, z: 123 }) }),
  ]),
  reward: Object.freeze({ xp: 180, mitzvahPoints: 6 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-erected",
  name: "The Mishkan Is Erected", title: "The Mishkan Is Erected",
  description: "On the first of Nisan the Mishkan is raised; tell Betzalel and enter its court.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 65, y: 0, z: 125 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "betzalel", count: 1,
      description: "Tell Betzalel the day has come.", marker: Object.freeze({ x: 67, y: 0, z: 127 }) }),
    Object.freeze({ eventType: "travel", target: "mishkan-court", count: 1,
      description: "Enter the court of the Mishkan.", marker: Object.freeze({ x: 63, y: 0, z: 121 }) }),
  ]),
  reward: Object.freeze({ xp: 160, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-cloud-glory",
  name: "The Cloud of Glory", title: "The Cloud of Glory",
  description: "The cloud covers the Tent and Havayah’s glory fills it; learn its words.",
  giver: Object.freeze({ id: "moshe", name: "Moshe", position: Object.freeze({ x: 65, y: 0, z: 125 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "learn", target: "torah-passage", count: 2,
      description: "Learn two passages of the glory.", marker: Object.freeze({ x: 66, y: 0, z: 126 }) }),
  ]),
  reward: Object.freeze({ xp: 130, mitzvahPoints: 4 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-oholiav-help",
  name: "Oholiav Helps", title: "Oholiav Helps",
  description: "Oholiav of Dan assists Betzalel in the weaving; speak with him and gather linen.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 67, y: 0, z: 123 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "oholiav", count: 1,
      description: "Speak with Oholiav.", marker: Object.freeze({ x: 65, y: 0, z: 121 }) }),
    Object.freeze({ eventType: "collect", target: "linen-fold", count: 4,
      description: "Gather four folds of linen.", marker: Object.freeze({ x: 70, y: 0, z: 125 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "mishkan-women-spinners",
  name: "The Women Spinners", title: "The Women Spinners",
  description: "The wise-hearted women spin the goats’ hair; speak with Miriam and gather.",
  giver: Object.freeze({ id: "miriam", name: "Miriam", position: Object.freeze({ x: 61, y: 0, z: 127 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "talk", target: "miriam", count: 1,
      description: "Speak with Miriam of the spinning.", marker: Object.freeze({ x: 61, y: 0, z: 127 }) }),
    Object.freeze({ eventType: "collect", target: "linen-fold", count: 5,
      description: "Gather five folds from the spinners.", marker: Object.freeze({ x: 58, y: 0, z: 128 }) }),
  ]),
  reward: Object.freeze({ xp: 140, mitzvahPoints: 5 }),
  multiplayer: false
}),
Object.freeze({
  id: "midbar-spice-gather",
  name: "Spices for the Oil", title: "Spices for the Oil",
  description: "Sweet spices for the anointing oil grow wild; gather them for Betzalel.",
  giver: Object.freeze({ id: "betzalel", name: "Betzalel", position: Object.freeze({ x: 8, y: 0, z: 111 }) }),
  objectives: Object.freeze([
    Object.freeze({ eventType: "activity", target: "herb-gathering", count: 2,
      description: "Gather sweet spices twice.", marker: Object.freeze({ x: 6, y: 0, z: 115 }) }),
  ]),
  reward: Object.freeze({ xp: 100, mitzvahPoints: 3 }),
  multiplayer: false
})
]);
