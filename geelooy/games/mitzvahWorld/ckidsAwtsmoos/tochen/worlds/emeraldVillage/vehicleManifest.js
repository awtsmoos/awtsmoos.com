/**
 * B\"H
 * @file vehicleManifest.js
 * @description
 * Vehicle data for Emerald Village. The builders already expect
 * HotAirBalloon and MagicalChariot nivrayim types.
 */

export const VEHICLE_MANIFEST = {
  HotAirBalloon: {
    balloon_village_to_mountain: {
      name: "Balloon of Ascent",
      position: { x: -20, y: 2, z: 20 },
      destinations: [
        { name: "Emerald Village", position: { x: 0, y: 2, z: 0 } },
        { name: "Mountain of Torah", position: { x: 400, y: 120, z: 400 } }
      ],
      interactable: true
    }
  },
  MagicalChariot: {
    chariot_emerald_ring: {
      name: "Chariot of Shlichus",
      position: { x: 18, y: 0.5, z: -22 },
      patrolPath: [[0, 0], [80, 0], [80, 80], [0, 80], [0, 0]],
      interactable: true
    }
  }
};
