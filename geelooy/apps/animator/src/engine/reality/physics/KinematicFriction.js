// B"H
export class KinematicFriction {
  static apply(data, env) {
    if (!data.velocity) data.velocity = { x: 0, y: 0 };
    const friction = env?.friction ?? 0.85;
    data.velocity.x *= friction;
    data.velocity.y *= friction;
    if (!data.position) data.position = { x: 0, y: 0 };
    data.position.x += data.velocity.x;
    data.position.y += data.velocity.y;
  }
}