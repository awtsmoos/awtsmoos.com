// B"H
export const DEFAULT_MOUNTS = Object.freeze([
  { id:"mount:virtual", prefix:"/", adapterId:"virtual", title:"Virtual Home" },
  { id:"mount:tunnels", prefix:"awtsmoos://tunnels", adapterId:"tunnel", title:"Tunnel Drives" },
  { id:"mount:previews", prefix:"awtsmoos://previews", adapterId:"preview", title:"Preview Artifacts" }
]);

export function mountRecord(input = {}) {
  const rawPrefix = input.prefix || input.path || "/";
  const prefix = normalizeMountPrefix(rawPrefix);
  return {
    id:input.id || `mount:${slug(prefix)}`,
    prefix,
    adapterId:input.adapterId || input.adapter || "virtual",
    title:input.title || input.name || String(rawPrefix),
    permissions:{ ...(input.permissions || {}) },
    data:{ ...(input.data || {}) }
  };
}

export function cloneMount(mount) {
  return { ...mount, permissions:{ ...mount.permissions }, data:{ ...mount.data } };
}

export function sortMounts(mounts) {
  mounts.sort((a, b) => b.prefix.length - a.prefix.length);
  return mounts;
}

export function findMount(mounts, path = "/") {
  const text = String(path || "/");
  return mounts.find(mount => matchesMount(text, mount)) || mounts.find(mount => mount.prefix === "/");
}

function normalizeMountPrefix(value) {
  return String(value).replace(/\/$/, "") || "/";
}

function matchesMount(path, mount) {
  if (mount.prefix === "/") return path.startsWith("/") || !path.includes("://");
  return path === mount.prefix || path.startsWith(`${mount.prefix}/`);
}

function slug(prefix) {
  return String(prefix).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";
}

/** B"H: mounts are named gates; longest roots open before the home root. */
