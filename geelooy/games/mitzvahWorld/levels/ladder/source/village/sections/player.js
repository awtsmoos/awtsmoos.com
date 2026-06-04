// B"H
/**
 * @file player.js
 * @description
 * Chapter 98: The Chossid speed returns to the scale the engine expects.
 * I was wrong to set speed to a tiny decimal. Chossid already defaults around
 * 18; the village now explicitly keeps that scale and asks for first-frame
 * terrain grounding instead of floating by authored Y.
 */
export default {
  Chossid: [{
    name: "Village Player Restored Engine Speed Spawn",
    path: "https://models-3122d.web.app/chossid.glb?k=1",
    speed: 18,
    speedScale: 1.25,
    runModeScale: 1,
    walkModeScale: 0.58,
    autoGround: true,
    groundLift: 0,
    position: { x: -11.8, y: 0, z: 18.4 },
    rotation: { y: 2.75 },
    cameraPreset: "guide-visible-low-third-person"
  }]
};
