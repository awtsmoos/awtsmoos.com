// B"H
import { resolveColliderShape } from "./ColliderShapeResolver.js";
import { mirrorColliderTransform } from "./ColliderTransformMirror.js";
import { compileBoxCollider } from "./BoxColliderCompiler.js";
import { compileSphereCollider } from "./SphereColliderCompiler.js";
import { compileCapsuleCollider } from "./CapsuleColliderCompiler.js";
import { compileConvexHullCollider } from "./ConvexHullColliderCompiler.js";
import { compileMeshCollider } from "./MeshColliderCompiler.js";
function dataFor(shape, object, transform) { return shape === "sphere" ? compileSphereCollider(object, transform) : shape === "capsule" ? compileCapsuleCollider(object, transform) : shape === "convex_hull" ? compileConvexHullCollider(object, transform) : shape === "mesh" ? compileMeshCollider(object, transform) : compileBoxCollider(object, transform); }
export function colliderForObject(object = {}) { const transform = mirrorColliderTransform(object), shape = resolveColliderShape(object); return { id:`${object.id}_collider`, targetId:object.id, shape, transform, exactTransformMirror:true, collider:dataFor(shape, object, transform), tags:object.collider?.tags || [object.type || "object"] }; }
export function collidersForObjects(objects = []) { return objects.map(colliderForObject); }
