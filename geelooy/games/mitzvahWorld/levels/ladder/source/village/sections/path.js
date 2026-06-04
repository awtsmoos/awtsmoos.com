// B"H
/**
 * @file path.js
 * @description
 * Chapter 108: The village road gains beauty and a simple hidden body.
 * Visual path recipes remain grounded picture props. VillageRoadCollider adds
 * cheap walkable slabs aligned to the final visual road after grounding.
 */
export default {
  VillageStonePath: [],
  VillagePictureProp: [
    { name: "main_rich_dirt_road_to_guide", kind: "pictureDirtPath", position: { x: -6.8, z: 12.8 }, scale: 1.08, rotation: { y: -0.24 }, terrainLawGrounded: true, groundLift: 0.01 },
    { name: "house_cobble_arrival_road", kind: "cobbleRoad", position: { x: -4.6, z: 9.4 }, scale: 1.18, rotation: { y: -0.2 }, terrainLawGrounded: true, groundLift: 0.02 },
    { name: "brick_house_grounded_steps", kind: "steps", position: { x: -2.2, z: 9.1 }, scale: 1.1, rotation: { y: -0.35 }, terrainLawGrounded: true, groundLift: 0.02 }
  ],
  VillageRoadCollider: [
    { name: "main_road_simple_walkable_collider", targetName: "main_rich_dirt_road_to_guide", width: 5.0, length: 38, height: 0.16, edgeColliders: false, position: { x: -6.8, y: 0, z: 12.8 }, rotation: { y: -0.24 }, useAuthoredY: true, groundLift: 0.035 },
    { name: "house_cobble_simple_walkable_collider", targetName: "house_cobble_arrival_road", width: 3.6, length: 30, height: 0.14, edgeColliders: false, position: { x: -4.6, y: 0, z: 9.4 }, rotation: { y: -0.2 }, useAuthoredY: true, groundLift: 0.035 }
  ]
};
