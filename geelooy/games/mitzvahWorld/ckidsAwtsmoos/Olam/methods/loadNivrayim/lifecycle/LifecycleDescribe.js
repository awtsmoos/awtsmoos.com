// B"H
/** LifecycleDescribe.js — when a vessel resists, name the vessel. */
export function describeNivra(nivra, error) {
  return { name:nivra?.name, type:nivra?.type, constructor:nivra?.constructor?.name, size:nivra?.size, dimensions:nivra?.dimensions, assetSize:nivra?.assetSize, width:nivra?.width, height:nivra?.height, depth:nivra?.depth, hasMesh:Boolean(nivra?.mesh), meshName:nivra?.mesh?.name, meshChildren:nivra?.mesh?.children?.length, errorName:error?.name, message:error?.message || String(error), stack:String(error?.stack || "no stack").split("\n").slice(0, 9).join(" | ") };
}
