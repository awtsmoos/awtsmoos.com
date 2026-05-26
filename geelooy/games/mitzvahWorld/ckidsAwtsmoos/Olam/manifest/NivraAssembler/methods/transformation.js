// B"H
/**
 * @file transformation.js
 * @description
 * Renderer-neutral spatial transformation for manifest assembly.
 */

function rotateY(pos, angle = 0) {
  if (!angle) return pos;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = pos.x * cos - pos.z * sin;
  const z = pos.x * sin + pos.z * cos;
  pos.x = x;
  pos.z = z;
  return pos;
}

function rotateX(pos, angle = 0) {
  if (!angle) return pos;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const y = pos.y * cos - pos.z * sin;
  const z = pos.y * sin + pos.z * cos;
  pos.y = y;
  pos.z = z;
  return pos;
}

function rotateZ(pos, angle = 0) {
  if (!angle) return pos;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = pos.x * cos - pos.y * sin;
  const y = pos.x * sin + pos.y * cos;
  pos.x = x;
  pos.y = y;
  return pos;
}

export default {
  /**
   * Applies parent rotation and position without depending on Three.js.
   */
  applyParentTransform(childPos, parent) {
    if (!parent) return;

    if (parent.rotation) {
      rotateX(childPos, parent.rotation.x || 0);
      rotateY(childPos, parent.rotation.y || 0);
      rotateZ(childPos, parent.rotation.z || 0);
    }

    const p = parent.position?.vector3 ? parent.position.vector3() : parent.position;
    if (p) {
      childPos.x += Number(p.x) || 0;
      childPos.y += Number(p.y) || 0;
      childPos.z += Number(p.z) || 0;
    }
  },

  /**
   * Combines local and parent rotations.
   */
  resolveRotation(rotNode, parent) {
    const localX = this.evaluate(rotNode?.x || 0);
    const localY = this.evaluate(rotNode?.y || 0);
    const localZ = this.evaluate(rotNode?.z || 0);

    if (!parent || !parent.rotation) {
      return { x: localX, y: localY, z: localZ };
    }

    return {
      x: localX + (parent.rotation.x || 0),
      y: localY + (parent.rotation.y || 0),
      z: localZ + (parent.rotation.z || 0)
    };
  }
};
