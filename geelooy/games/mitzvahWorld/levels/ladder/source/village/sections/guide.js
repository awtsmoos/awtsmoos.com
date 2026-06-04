// B"H
/**
 * @file guide.js
 * @description
 * Chapter 85: The level guide is placed where the child must see him.
 * He now stands near spawn on the path with a cyan/gold beacon, wide talk range,
 * fallback procedural body, and direct Choose Levels payload.
 */
export default {
  InteractiveNpc: [{
    name: "SPAWN_VISIBLE_CHOOSE_LEVELS_GUIDE",
    opensLevelSelect: true,
    hasShop: true,
    selectorTitle: "Choose Levels",
    proximity: 18,
    talkDistance: 18,
    height: 1.9,
    visualHeight: 1.9,
    radius: 0.58,
    visualGroundBiasY: 0,
    groundLift: 0.08,
    beacon: true,
    beaconColor: 0xffd54a,
    guideCyan: 0x00ffd0,
    beaconHeight: 8.2,
    path: "https://models-3122d.web.app/chossid.glb?k=2",
    position: { x: -6.6, y: 0.14, z: 10.6 },
    rotation: { y: 2.75 },
    dialogue: [
      "Shalom! I guard the challenge path.",
      "Tap Choose Levels to see all available challenges.",
      "The village is only the beginning."
    ]
  }]
};
