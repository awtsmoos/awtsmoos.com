// B"H
/**
 * @file VillageFenceCollider.js
 * @description
 * Chapter 616: The fence receives a body again.
 *
 * The Awtsmoos breathes through visible rails and also through the hidden law
 * that stops the player. These rows mirror the long front boundary and the two
 * side returns of the opening village, so the fence is no longer a picture with
 * no yesod under it.
 */
const fence = (name, x, z, rotationY, count) => ({
  name,
  count,
  spacing: 0.92,
  height: 1.24,
  depth: 0.52,
  scale: 1,
  position: { x, y: 0, z },
  rotation: { y: rotationY },
  useAuthoredY: true,
  isSolid: true
});

export default [
  fence("village_front_fence_collider", -48, 20, 0, 112),
  fence("village_left_return_fence_collider", -49, 20, Math.PI / 2, 48),
  fence("village_right_return_fence_collider", 54, 20, Math.PI / 2, 48)
];
