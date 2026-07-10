// B"H
/** PathRoadSystem: bendable fork-ready road strips from plain points. */
export function roadStripDef({ id = 'Awtsmoos-road-strip', points = [], width = 2, texture, color = '#e4c447', yOffset = .055, heightAt = () => 0, repeatScale = 2.5 }) {
  const vertices = [], faces = [];
  if (points.length < 2) return emptyRoad(id, texture, color);
  const normals = pointNormals(points);
  for (let i = 0; i < points.length; i++) {
    const p = points[i], n = normals[i], y = (p.y ?? heightAt(p.x, p.z)) + yOffset;
    vertices.push([p.x + n.x * width / 2, y, p.z + n.z * width / 2], [p.x - n.x * width / 2, y, p.z - n.z * width / 2]);
  }
  for (let i = 0; i < points.length - 1; i++) faces.push([i * 2, i * 2 + 2, i * 2 + 3, i * 2 + 1]);
  return { id, shape: 'manual', solid: false, walkable: false, color, position: { x: 0, y: 0, z: 0 }, vertices, faces, rotation: { y: 0 }, mapImage: texture || null, textureUrl: texture?.dataset?.url || texture?.src || null, mapRepeat: [repeatScale, Math.max(1, points.length * .75)] };
}
export function houseToMiddleRoad(assets, heightAt) {
  return roadStripDef({
    id: 'Awtsmoos-yellow-brick-road-house-to-middle',
    texture: assets.yellowBrickImage,
    color: '#ffd85a',
    width: 2.18,
    heightAt,
    repeatScale: 2.8,
    points: [
      { x: 18, z: -14.68 },
      { x: 16.2, z: -12.1 },
      { x: 11.5, z: -9.6 },
      { x: 6.4, z: -6.2 },
      { x: 2.3, z: -2.6 },
      { x: 0.3, z: 0.7 }
    ]
  });
}
function emptyRoad(id, texture, color) { return { id, shape: 'manual', solid: false, color, position: { x: 0, y: 0, z: 0 }, vertices: [], faces: [], rotation: { y: 0 }, mapImage: texture || null }; }
function pointNormals(points) {
  return points.map((p, i) => { const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)], dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1; return { x: -dz / l, z: dx / l }; });
}
