// B"H

/**
 * A fence is a covenant between posts, and every post must know the actual
 * earth beneath it. No guessed plane survives here: each peg is sampled, each
 * rail inherits both endpoint heights, and one merged mesh carries the result.
 */
export function createFenceAlongPath({ id, path, groundSampler, postSpacing = 2, height = 1.45, railCount = 3, material = {} }) {
  if (!groundSampler?.heightAt) throw new TypeError('groundSampler is required');
  const posts = resampleClosedPath(path, postSpacing).map(point => {
    const sample = groundSampler.heightAt(point.x, point.z);
    return { ...point, groundY: sample.y, sample };
  });
  const vertices = [], faces = [], uvs = [], postSize = .24, railSize = .14;
  for (const post of posts) addBox(vertices, faces, uvs, post.x, post.groundY + height / 2, post.z, postSize, height, postSize);
  for (let i = 0; i < posts.length; i++) {
    const a = posts[i], b = posts[(i + 1) % posts.length];
    for (let rail = 1; rail <= railCount; rail++) addRail(vertices, faces, uvs, a, b, height * rail / (railCount + 1), railSize);
  }
  return {
    id, shape: 'manual', solid: true, walkable: false, noEdge: true,
    ...material, position: { x: 0, y: 0, z: 0 }, rotation: { y: 0 },
    vertices, faces, uvs,
    userData: { AwtsmoosFence: { posts: posts.length, railCount, groundSources: [...new Set(posts.map(p => p.sample.source))] } }
  };
}

function resampleClosedPath(path, spacing) {
  const out = [];
  for (let i = 0; i < path.length; i++) {
    const a = path[i], b = path[(i + 1) % path.length], length = Math.hypot(b.x - a.x, b.z - a.z);
    const count = Math.max(1, Math.ceil(length / spacing));
    for (let j = 0; j < count; j++) {
      const t = j / count;
      out.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    }
  }
  return out;
}

function addRail(vertices, faces, uvs, a, b, aboveGround, size) {
  const dx = b.x - a.x, dz = b.z - a.z, length = Math.hypot(dx, dz), yaw = Math.atan2(dx, dz);
  const x = (a.x + b.x) / 2, z = (a.z + b.z) / 2;
  const y = ((a.groundY + aboveGround) + (b.groundY + aboveGround)) / 2;
  addBox(vertices, faces, uvs, x, y, z, size, size, length + .08, yaw);
}

function addBox(vertices, faces, uvs, x, y, z, sx, sy, sz, yaw = 0) {
  const hx = sx / 2, hy = sy / 2, hz = sz / 2, c = Math.cos(yaw), s = Math.sin(yaw);
  const rotate = ([px, py, pz]) => [x + px * c + pz * s, y + py, z - px * s + pz * c];
  const sides = [
    [[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]], [[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]],
    [[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz]], [[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz]],
    [[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz],[-hx,hy,-hz]], [[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz],[-hx,-hy,hz]]
  ];
  for (const side of sides) addFace(vertices, faces, uvs, side.map(rotate));
}

function addFace(vertices, faces, uvs, points) {
  const offset = vertices.length;
  vertices.push(...points); faces.push([offset, offset + 1, offset + 2, offset + 3]);
  uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
}
