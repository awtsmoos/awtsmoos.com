// B"H
/**
 * @file guide.js
 * @description
 * Chapter 554: Guides stand in open air now. The level guide is moved away from
 * the wall/box, and a new egg-village ferryman opens a direct travel button.
 */
export default {
  InteractiveNpc: [
    {
      name: "OPEN_VISIBLE_CHOOSE_LEVELS_GUIDE",
      title: "Village Guide",
      opensLevelSelect: true,
      hasShop: true,
      selectorTitle: "Choose Levels",
      proximity: 10,
      talkDistance: 10,
      height: 1.9,
      visualHeight: 1.9,
      radius: 0.58,
      visualGroundBiasY: 0,
      groundLift: 0.02,
      beacon: true,
      beaconColor: 0xffcc44,
      guideCyan: 0x00ddff,
      beaconHeight: 4.8,
      path: "https://models-3122d.web.app/chossid.glb?k=1",
      position: { x: -2.8, y: 0, z: 14.8 },
      rotation: { y: 2.9 },
      dialogue: ["Shalom! I guard the challenge path.", "Tap Choose Levels to see all available challenges.", "The guide is no longer stuck by the wall."]
    },
    {
      name: "Egg Village Travel Guide",
      title: "Egg Village Guide",
      opensLevelSelect: false,
      hasShop: false,
      travelOnly: true,
      travelPath: "egg-village.json",
      travelLabel: "GO TO EGG VILLAGE",
      proximity: 9,
      talkDistance: 9,
      height: 1.75,
      visualHeight: 1.75,
      radius: 0.52,
      groundLift: 0.02,
      beacon: true,
      beaconColor: 0xfff0a0,
      beaconHeight: 4.2,
      path: "https://models-3122d.web.app/chossid.glb?k=3",
      position: { x: -14.5, y: 0, z: 6.5 },
      rotation: { y: 1.15 },
      dialogue: ["I can take you to Egg Village.", "Tap the travel button and I will open that path.", "You can return from the guide there."]
    }
  ]
};
