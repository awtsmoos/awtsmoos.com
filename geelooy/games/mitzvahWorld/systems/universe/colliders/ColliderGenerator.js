// B"H
import { resolveColliderShape } from "./ColliderShapeResolver.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { mirrorColliderTransform } from "./ColliderTransformMirror.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileBoxCollider } from "./BoxColliderCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileSphereCollider } from "./SphereColliderCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileCapsuleCollider } from "./CapsuleColliderCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileConvexHullCollider } from "./ConvexHullColliderCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileMeshCollider } from "./MeshColliderCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
function dataFor(shape, object, transform) { return shape === "sphere" ? compileSphereCollider(object, transform) : shape === "capsule" ? compileCapsuleCollider(object, transform) : shape === "convex_hull" ? compileConvexHullCollider(object, transform) : shape === "mesh" ? compileMeshCollider(object, transform) : compileBoxCollider(object, transform); }
export function colliderForObject(object = {}) { const transform = mirrorColliderTransform(object), shape = resolveColliderShape(object); return { id:`${object.id}_collider`, targetId:object.id, shape, transform, exactTransformMirror:true, collider:dataFor(shape, object, transform), tags:object.collider?.tags || [object.type || "object"] }; }
export function collidersForObjects(objects = []) { return objects.map(colliderForObject); }
