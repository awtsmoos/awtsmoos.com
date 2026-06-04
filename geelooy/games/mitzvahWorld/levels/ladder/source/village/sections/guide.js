// B"H
/**
 * @file guide.js
 * @description
 * Stabilized guide placement. The NPC is now in open space directly ahead of
 * spawn, away from overlapping houses, with an obvious but not blinding beacon.
 */
export default {
  InteractiveNpc: [{
    name: "OPEN_VISIBLE_CHOOSE_LEVELS_GUIDE",
    opensLevelSelect: true,
    hasShop: true,
    selectorTitle: "Choose Levels",
    proximity: 22,
    talkDistance: 22,
    height: 1.9,
    visualHeight: 1.9,
    radius: 0.58,
    visualGroundBiasY: 0,
    groundLift: 0.02,
    beacon: true,
    beaconColor: 0xffcc44,
    guideCyan: 0x00ddff,
    beaconHeight: 5.2,
    path: "https://models-3122d.web.app/chossid.glb?k=2",
    position: { x: -8.2, y: 0, z: 10.6 },
    rotation: { y: 2.75 },
    dialogue: [
      "Shalom! I guard the challenge path.",
      "Tap Choose Levels to see all available challenges.",
      "The village is only the beginning."
    ]
  }]
};
