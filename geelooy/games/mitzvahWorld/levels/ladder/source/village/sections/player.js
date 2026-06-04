// B"H
/**
 * @file player.js
 * @description
 * Stabilized movement. The Awtsmoos no longer lets the child crawl or launch
 * like lightning: speed sits in the engine's real scale, but softened.
 */
export default {
  Chossid: [{
    name: "Village Player Stable Speed Spawn",
    path: "https://models-3122d.web.app/chossid.glb?k=1",
    speed: 10,
    speedScale: 1,
    runModeScale: 0.82,
    walkModeScale: 0.45,
    autoGround: true,
    groundLift: 0,
    position: { x: -10.8, y: 0, z: 16.2 },
    rotation: { y: 2.75 },
    cameraPreset: "guide-visible-low-third-person"
  }]
};
