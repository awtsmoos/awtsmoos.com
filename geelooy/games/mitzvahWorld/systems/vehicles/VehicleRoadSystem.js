// B"H
/** Roads stretch the starter zone into promise. */
export const FAST_TRAVEL_SPEEDS = { walking: 1, horse: 2, cart: 2.5, chariot: 3, car: 4 };
export const ROUTES = [
  { from: "Village", to: "Market", points: [[0,0,0],[8,0,-10]] },
  { from: "Village", to: "Farm", points: [[0,0,0],[18,0,14]] },
  { from: "Village", to: "Outpost", points: [[0,0,0],[0,0,-30]] }
];

export function buildRoads(THREE, scene) {
  if (!THREE || !scene) return [];
  const mat = new THREE.MeshStandardMaterial({ color: 0x6b5b45, roughness: .9 });
  const made = [];
  for (const r of ROUTES) {
    for (let i = 1; i < r.points.length; i++) made.push(segment(THREE, scene, mat, r.points[i-1], r.points[i]));
  }
  return made;
}

function segment(THREE, scene, mat, a, b) {
  const dx = b[0]-a[0], dz = b[2]-a[2], len = Math.hypot(dx, dz);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(3, .04, len), mat);
  mesh.position.set((a[0]+b[0])/2, .03, (a[2]+b[2])/2);
  mesh.rotation.y = Math.atan2(dx, dz);
  mesh.name = "Mitzvah Road";
  scene.add(mesh);
  return mesh;
}
