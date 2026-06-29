// B"H
export function defaultMounts() { return [
  mount({ id:'mount:virtual', prefix:'/', adapterId:'virtual', title:'Local IndexedDB', icon:'💾', locality:'local', syncState:'private', permissions:{ read:true, write:true, delete:true, list:true } }),
  mount({ id:'mount:tunnels', prefix:'awtsmoos://tunnels', adapterId:'tunnel', title:'Connected Tunnels', icon:'🌐', locality:'remote', syncState:'live', permissions:{ read:true, list:true, write:false, delete:false } }),
  mount({ id:'mount:previews', prefix:'awtsmoos://previews', adapterId:'preview', title:'Preview Artifacts', icon:'🟣', locality:'remote', syncState:'hosted', permissions:{ read:true, list:true, write:false, delete:false } }),
  mount({ id:'mount:receipts', prefix:'awtsmoos://receipts', adapterId:'preview', title:'Mission Receipts', icon:'📜', locality:'remote', syncState:'hosted', permissions:{ read:true, list:true, write:false, delete:false } })
]; }
export function mount(input) { return { adapterType:input.adapterId, permissionState:permissionState(input.permissions), ...input, data:{ style:input.adapterId, ...(input.data || {}) } }; }
export function permissionState(permissions = {}) { if (permissions.write === false && permissions.delete === false) return 'read-only'; if (permissions.deny?.length) return 'restricted'; return 'read-write'; }
/** B"H: mounts now declare locality, adapter type, permission state, and sync breath. */
