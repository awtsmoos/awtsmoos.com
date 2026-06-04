// B"H
/**
 * @file guide.js
 * @description
 * Chapter 41: The guide stands on the right focal line.
 * He is visible beside the cottage and path, carrying the level menu and a
 * modest beacon so gameplay remains readable inside the cinematic composition.
 */
export default {
  InteractiveNpc: [{
    name: "Reference Village Level Guide",
    opensLevelSelect: true,
    hasShop: true,
    selectorTitle: "Choose Levels",
    proximity: 10.5,
    talkDistance: 10.5,
    height: 1.8,
    visualHeight: 1.8,
    radius: 0.5,
    visualGroundBiasY: 0,
    groundLift: 0.05,
    beacon: true,
    beaconColor: 0xffd54a,
    beaconHeight: 4.6,
    path: "https://models-3122d.web.app/chossid.glb?k=2",
    position: { x: 10.8, y: 0.1, z: -4.4 },
    rotation: { y: 0.04 },
    dialogue: [
      "Shalom! I guard the challenge path.",
      "Tap Choose Levels to see all available challenges.",
      "The village is only the beginning."
    ]
  }]
};
