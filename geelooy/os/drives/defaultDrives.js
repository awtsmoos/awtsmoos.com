// B"H
import { ROOT_MOUNTS } from "../providers/mountTree.js";

export const DEFAULT_DRIVES = Object.freeze(ROOT_MOUNTS.map(mount => ({
  id:mount.id, title:mount.title, root:mount.path, icon:mount.icon,
  kind:mount.provider, provider:mount.provider, providerId:mount.provider,
  writable:!["root", "network", "system"].includes(mount.id), url:`awtsmoos://mount${mount.path}`
})));

/** B"H: default drives are living mount roots, not local/remote tribes. */
