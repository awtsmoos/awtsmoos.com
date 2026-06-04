// B"H
/**
 * @file guide.js
 * @description
 * Chapter 124: The guide wears the same Chossid vessel as the player.
 * He stands in open space, but he does not open menus by gaze alone. The UI is
 * now explicit tap-only from InteractiveNpc itself.
 */
export default {
  InteractiveNpc: [{
    name: "OPEN_VISIBLE_CHOOSE_LEVELS_GUIDE",
    opensLevelSelect: true,
    hasShop: true,
    selectorTitle: "Choose Levels",
    proximity: 12,
    talkDistance: 12,
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
    position: { x: -8.2, y: 0, z: 10.6 },
    rotation: { y: 2.75 },
    dialogue: [
      "Shalom! I guard the challenge path.",
      "Tap Choose Levels to see all available challenges.",
      "The village is only the beginning."
    ]
  }]
};
