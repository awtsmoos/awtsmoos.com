// B"H
import { blocks, boundsIntersect, circleIntersectsBody, circleQueryBounds, collisionBody } from "./CollisionBody2D.js";

const floor = Math.floor;
const CONTACT_EPSILON = 1e-6;
const keyOf = (x, z) => `${x},${z}`;

export class CollisionWorld2D {
  constructor(options = {}) {
    this.cellSize = Math.max(1, Number(options.cellSize || 4));
    this.bodies = new Map();
    this.grid = new Map();
    this.metrics = { lastCandidates:0, maxCandidates:0, queries:0 };
    for (const body of options.bodies || []) this.addBody(body);
  }

  keysFor(bounds) {
    const keys = [];
    for (let x = floor(bounds.minX / this.cellSize); x <= floor(bounds.maxX / this.cellSize); x++) {
      for (let z = floor(bounds.minZ / this.cellSize); z <= floor(bounds.maxZ / this.cellSize); z++) keys.push(keyOf(x, z));
    }
    return keys;
  }

  addBody(input) {
    const body = collisionBody(input);
    body.__keys = this.keysFor(body.bounds);
    this.bodies.set(body.id, body);
    for (const key of body.__keys) {
      if (!this.grid.has(key)) this.grid.set(key, new Set());
      this.grid.get(key).add(body.id);
    }
    return body;
  }

  setDoorOpen(id, open) {
    const body = this.bodies.get(id);
    if (body?.kind === "door") body.open = Boolean(open);
    return body || null;
  }

  queryBounds(bounds, predicate = null) {
    const ids = new Set();
    for (const key of this.keysFor(bounds)) for (const id of this.grid.get(key) || []) ids.add(id);
    const out = [];
    for (const id of ids) {
      const body = this.bodies.get(id);
      if (boundsIntersect(bounds, body?.bounds) && (!predicate || predicate(body))) out.push(body);
    }
    this.metrics.lastCandidates = out.length;
    this.metrics.maxCandidates = Math.max(this.metrics.maxCandidates, out.length);
    this.metrics.queries++;
    return out;
  }

  queryCircle(point, radius, predicate = null) {
    const bounds = circleQueryBounds(point, radius);
    return this.queryBounds(bounds, body => circleIntersectsBody(point, radius, body) && (!predicate || predicate(body)));
  }

  blockingAt(point, radius) {
    return this.queryCircle(point, radius, blocks);
  }

  isSpawnSafe(point, radius = 0.55) {
    return this.blockingAt(point, radius).length === 0;
  }

  moveCircle(start, delta, radius = 0.55) {
    const pos = { x:Number(start.x) || 0, z:Number(start.z) || 0 };
    const dx = Number(delta.x) || 0, dz = Number(delta.z) || 0;
    const stepSize = Math.max(0.2, radius * 0.6);
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dz)) / stepSize));
    const hits = new Set();
    let blocked = false;
    for (let i = 0; i < steps; i++) {
      blocked = this.#axis(pos, "x", dx / steps, radius, hits) || blocked;
      blocked = this.#axis(pos, "z", dz / steps, radius, hits) || blocked;
    }
    return { position:pos, blocked, hits:[...hits], steps, metrics:{ ...this.metrics } };
  }

  #axis(pos, axis, amount, radius, hits) {
    if (!amount) return false;
    const next = { x:pos.x, z:pos.z };
    next[axis] += amount;
    let blocked = false;
    const contactRadius = Math.max(0, radius - CONTACT_EPSILON);
    for (const body of this.queryCircle(next, contactRadius, blocks)) {
      hits.add(body.id);
      blocked = true;
      const b = body.bounds;
      next[axis] = amount > 0 ? b[axis === "x" ? "minX" : "minZ"] - radius : b[axis === "x" ? "maxX" : "maxZ"] + radius;
    }
    pos[axis] = next[axis];
    return blocked;
  }
}

export default CollisionWorld2D;
