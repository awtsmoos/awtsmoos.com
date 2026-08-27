/* B"H
A source is a vessel: it starts, stops, renders, speaks audio when it has breath,
and serializes without dragging live DOM nodes into the archive.
*/
const DEFAULT_CROP = { top:0, right:0, bottom:0, left:0 };
export function createBaseSource(input = {}) {
  const runtime = { node:input.node || null, stream:input.stream || null, audioNode:input.audioNode || null };
  const source = {
    id: input.id || idFor(input.type || 'source'), type: input.type || 'source', name: input.name || 'Source',
    visible: input.visible ?? true, locked: !!input.locked, opacity: clamp(input.opacity ?? 1, 0, 1),
    x: Number(input.x ?? input.transform?.x ?? 0), y: Number(input.y ?? input.transform?.y ?? 0),
    w: Number(input.w ?? input.transform?.w ?? 320), h: Number(input.h ?? input.transform?.h ?? 180),
    rotation: Number(input.rotation ?? input.transform?.rotation ?? 0), crop: input.crop || input.transform?.crop || DEFAULT_CROP,
    filters: input.filters || [], settings: input.settings || {}, health: input.health || health('idle'), runtime,
    get node() { return runtime.node; }, set node(value) { runtime.node = value; },
    get stream() { return runtime.stream; }, set stream(value) { runtime.stream = value; },
    async start() { this.health = health('running'); return this; },
    async stop() { stopTracks(runtime.stream); this.health = health('stopped'); return this; },
    update(patch = {}) { Object.assign(this.settings, patch.settings || {}); for (const key of editableKeys) if (key in patch) this[key] = patch[key]; return this; },
    serialize() { return serializeSource(this); },
    render(ctx) { return drawRuntime(ctx, this); },
    getAudioNode() { return runtime.audioNode || null; },
    getHealth() { return this.health; }
  };
  return source;
}
export function deserializeSource(data = {}, overrides = {}) { return createBaseSource({ ...data, ...overrides }); }
export function health(state, details = {}) { return { state, at:Date.now(), details }; }
export function makeTransform(transform = {}) { return { x:transform.x || 0, y:transform.y || 0, scaleX:transform.scaleX ?? 1, scaleY:transform.scaleY ?? 1, rotation:transform.rotation || 0, crop:transform.crop || DEFAULT_CROP }; }
function serializeSource(s) { const { id,type,name,visible,locked,opacity,x,y,w,h,rotation,crop,filters,settings,health } = s; return { id,type,name,visible,locked,opacity,x,y,w,h,rotation,crop,filters,settings,health }; }
function drawRuntime(ctx, s) { if (!s.visible || !ctx) return false; const node = s.node; ctx.save(); ctx.globalAlpha = s.opacity; ctx.translate(s.x + s.w / 2, s.y + s.h / 2); ctx.rotate(s.rotation * Math.PI / 180); try { node ? ctx.drawImage(node, -s.w / 2, -s.h / 2, s.w, s.h) : placeholder(ctx, s); } catch { placeholder(ctx, s); } ctx.restore(); return true; }
function placeholder(ctx, s) { ctx.fillStyle = s.settings.color || '#1d2844'; ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h); ctx.fillStyle = '#83ffe7'; ctx.font = '20px system-ui'; ctx.fillText(s.name, -s.w / 2 + 14, -s.h / 2 + 34); }
function stopTracks(stream) { stream?.getTracks?.().forEach(track => track.stop()); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }
function idFor(prefix) { return `${prefix.toLowerCase()}-${globalThis.crypto?.randomUUID?.() || Date.now()}`; }
const editableKeys = ['name','visible','locked','opacity','x','y','w','h','rotation','crop','filters','health'];
