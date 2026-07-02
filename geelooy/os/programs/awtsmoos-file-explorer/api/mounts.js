// B"H
import { providerCapabilities } from "../../../providers/capabilities.js";

export function classForMount(mountOrAdapter = "") { return `mount-${providerOf(mountOrAdapter)}`; }
export function iconForMount(mount = {}) { return mount.icon || ({ virtual:"א", memory:"🧠", tunnel:"💻", ssh:"🛰️", git:"🌿", zip:"🗜️", api:"🔌", preview:"🔭", receipt:"🧾", local:"💾" }[providerOf(mount)] || "◌"); }
export function labelForMount(mount = {}) { return mount.title || mount.name || mount.providerId || mount.adapterId || "Awtsmoos Object"; }

export function mountBadge(mount = {}, permission = {}) {
  const provider = providerOf(mount); const caps = providerCapabilities({ ...mount, provider }).slice(0, 4).join(" · ");
  const p = permission.permission || mount.permissionState || (mount.writable ? "read-write" : "read-only");
  return `${iconForMount(mount)} ${provider} · ${p} · ${caps}`;
}

export function resolveMount(os, path = "/") { const resolved = os?.vfs?.resolve?.(path) || os?.drives?.resolve?.(path); return resolved?.mount || resolved?.drive || os?.vfs?.mounts?.()?.[0] || {}; }
export function mountData(os, path = "/", permission = {}) { const mount = resolveMount(os, path); return { ...mount, provider:providerOf(mount), className:classForMount(mount), icon:iconForMount(mount), label:labelForMount(mount), badge:mountBadge(mount, permission) }; }

function providerOf(input) { if (typeof input === "string") return input.replace(/^mount-/, "") || "virtual"; return input.provider || input.providerKind || input.adapterType || input.kind || "virtual"; }

/** B"H: UI reads provider truth. The old local/remote fog dissolves. */
