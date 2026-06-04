// B"H
/**
 * @file player.js
 * @description
 * Chapter 92: The player begins with the guide in sight.
 * The spawn is pulled closer to the house/guide cluster so the first frame has
 * a clear purpose even before final camera code fully obeys the preset.
 */
export default {
  Chossid: [{
    name: "Village Player Guide Visible Spawn",
    path: "https://models-3122d.web.app/chossid.glb?k=1",
    speed: 0.19,
    position: { x: -11.8, y: 0.24, z: 18.4 },
    rotation: { y: 2.75 },
    cameraPreset: "guide-visible-low-third-person"
  }]
};
