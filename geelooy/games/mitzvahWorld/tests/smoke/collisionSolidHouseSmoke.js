// B"H
import assert from "node:assert/strict";
import CollisionWorld2D from "../../ckidsAwtsmoos/systems/collision/CollisionWorld2D.js";

const world = new CollisionWorld2D({ cellSize:4, bodies:[
  { id:"house_1", kind:"house", x:5, z:0, width:2, depth:8, solid:true }
] });

const blocked = world.moveCircle({ x:0, z:0 }, { x:8, z:0 }, 0.5);
assert(blocked.blocked, "house blocks direct movement");
assert(blocked.position.x <= 3.51, "player stops at house face plus body radius");
assert(blocked.steps > 1, "movement is substepped against tunneling");

const slide = world.moveCircle({ x:3.5, z:-5 }, { x:0, z:10 }, 0.5);
assert.equal(slide.blocked, false, "tangent slide is not pinned as a fresh block");
assert(Math.abs(slide.position.x - 3.5) < 0.01, "slide preserves non-blocked axis");
assert(slide.position.z > 4.4, "player slides along the wall instead of jittering in place");

assert(world.isSpawnSafe({ x:0, z:0 }, 0.5), "open spawn is safe");
assert(!world.isSpawnSafe({ x:5, z:0 }, 0.5), "spawn inside house is rejected");

console.log("B'H collisionSolidHouseSmoke passed", { final:blocked.position, slide:slide.position });
