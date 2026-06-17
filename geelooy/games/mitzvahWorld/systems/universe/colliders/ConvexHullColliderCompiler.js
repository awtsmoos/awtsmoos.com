// B"H
export function compileConvexHullCollider(object = {}) { return { shape:"convex_hull", points:object.collider?.points || [] }; }
