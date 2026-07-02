// B"H
import { providerCapabilities } from "../providers/capabilities.js";

export function defaultMounts() { return [
  mount({ id:"mount:virtual", prefix:"/", adapterId:"virtual", provider:"virtual", title:"Awtsmoos Root", icon:"א", permissions:{ read:true, write:true, delete:true, list:true } }),
  mount({ id:"mount:network", prefix:"/network", adapterId:"tunnel", provider:"tunnel", title:"Network", icon:"🌐", permissions:{ read:true, list:true, write:false, delete:false } }),
  mount({ id:"mount:tunnels:legacy", prefix:"awtsmoos://tunnels", adapterId:"tunnel", provider:"tunnel", title:"Connected Tunnels", icon:"💻", permissions:{ read:true, list:true, write:false, delete:false } }),
  mount({ id:"mount:previews", prefix:"/system/previews", adapterId:"preview", provider:"preview", title:"Preview Artifacts", icon:"🔭", permissions:{ read:true, list:true, write:false, delete:false } }),
  mount({ id:"mount:previews:legacy", prefix:"awtsmoos://previews", adapterId:"preview", provider:"preview", title:"Preview Artifacts", icon:"🔭", permissions:{ read:true, list:true, write:false, delete:false } }),
  mount({ id:"mount:receipts", prefix:"/system/receipts", adapterId:"preview", provider:"receipt", title:"Mission Receipts", icon:"🧾", permissions:{ read:true, list:true, write:false, delete:false } }),
  mount({ id:"mount:receipts:legacy", prefix:"awtsmoos://receipts", adapterId:"preview", provider:"receipt", title:"Mission Receipts", icon:"🧾", permissions:{ read:true, list:true, write:false, delete:false } })
]; }

export function mount(input) { const provider = input.provider || input.adapterId || "virtual"; return { adapterType:input.adapterId, provider, permissionState:permissionState(input.permissions), capabilities:providerCapabilities({ ...input, provider }), ...input, data:{ style:provider, provider, ...(input.data || {}) } }; }
export function permissionState(permissions = {}) { if (permissions.write === false && permissions.delete === false) return "read-only"; if (permissions.deny?.length) return "restricted"; return "read-write"; }

/** B"H: mounts declare provider and capability; distance is hidden below. */
