//B"H
import { normalizePlaylistItems, playlistItemKey, playlistStatsSnapshot } from './model.js';

const PLAYLIST_COUNTS = [10, 100, 1000];
const ITEM_COUNTS = [10, 100, 1000, 10000];

/**
 * B"H
 * The browser calls this name from main.js. It receives the real IndexedDB Store
 * vessel, writes real playlists, proves reorder/playback/delete, then cleans its
 * own footprints so the user's library is not scorched by the stress fire.
 */
export async function runPlaylistStressTest(Store, options = {}) {
  assertStore(Store);
  const playlistCount = bounded(options.playlists, 3, 1, 25);
  const itemCount = bounded(options.items, 75, 1, 500);
  const prefix = `stress:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  const ids = Array.from({ length: playlistCount }, (_, i) => `${prefix}:${i}`);
  const items = makeItems(itemCount);
  const startedAt = Date.now();
  try {
    for (let i = 0; i < ids.length; i++) await Store.savePlaylist({ id: ids[i], title: `B\"H Stress ${i}`, items, sortOrder: startedAt + i });
    const restored = await Promise.all(ids.map(id => Store.getPlaylist(id)));
    assert(restored.every(pl => pl?.items?.length === itemCount), 'real store restore mismatch');
    await Store.reorderPlaylistItem(ids[0], itemCount - 1, 0);
    await Store.touchPlaylistPlayback(ids[0], { index: Math.min(3, itemCount - 1), time: 18 }, { loop: 'playlist', shuffle: true });
    const first = await Store.getPlaylist(ids[0]);
    assert(first.playback.loop === 'playlist', 'real store playback loop mismatch');
    assert(Boolean(first.playback.shuffle), 'real store playback shuffle mismatch');
    assert(first.items.length === itemCount, 'real store reorder count mismatch');
    const listed = (await Store.listPlaylists()).filter(pl => ids.includes(pl.id));
    assert(listed.length === playlistCount, 'real store list mismatch');
    return { ok: true, mode: 'indexeddb', playlistCount, itemCount, stats: playlistStatsSnapshot(first), elapsedMs: Date.now() - startedAt };
  } finally {
    await Promise.all(ids.map(id => Store.removePlaylist(id).catch(() => null)));
  }
}

/** B"H: pure memory gauntlet for Node and fast non-browser verification. */
export async function runPlaylistStressSuite() {
  const results = [];
  for (const playlistCount of PLAYLIST_COUNTS) for (const itemCount of ITEM_COUNTS) results.push(await stressCase(playlistCount, itemCount));
  return { ok: results.every(result => result.ok), results };
}

export async function stressCase(playlistCount, itemCount) {
  const store = new MemoryPlaylistStore();
  const baseItems = makeItems(itemCount);
  for (let index = 0; index < playlistCount; index++) await store.save({ id: `pl-${index}`, title: `Stress ${index}`, items: baseItems });
  const restored = await store.list();
  assert(restored.length === playlistCount, 'restore count mismatch');
  assert(restored.every(pl => pl.items.length === itemCount), 'item count mismatch');
  const reloaded = JSON.parse(JSON.stringify(restored));
  assert(reloaded[0].items.length === itemCount, 'reload count mismatch');
  await store.reorder('pl-0', itemCount - 1, 0);
  await store.shuffle('pl-0');
  await store.touchPlayback('pl-0', { index: 3, time: 18 }, { loop: 'playlist', shuffle: true });
  const exported = await store.export('pl-0');
  assert(exported.playlist.items.length === itemCount, 'export item count mismatch');
  assert(JSON.parse(exported.json).items.length === itemCount, 'export json item count mismatch');
  await store.remove('pl-0');
  assert(!(await store.get('pl-0')), 'delete failed');
  await store.save(JSON.parse(exported.json));
  assert((await store.get('pl-0')).items.length === itemCount, 'recreate failed');
  return { ok: true, playlistCount, itemCount, stats: playlistStatsSnapshot(await store.get('pl-0')) };
}

class MemoryPlaylistStore {
  constructor() { this.map = new Map(); }
  async save(playlist) { const clean = { ...playlist, items: normalizePlaylistItems(playlist.items || []), updatedAt: Date.now() }; this.map.set(clean.id, clean); return clean; }
  async get(id) { return this.map.get(id) || null; }
  async list() { return [...this.map.values()].sort((a, b) => String(a.id).localeCompare(String(b.id))); }
  async remove(id) { this.map.delete(id); }
  async reorder(id, from, to) { const playlist = await this.get(id); const items = [...playlist.items]; const [moved] = items.splice(from, 1); items.splice(to, 0, moved); return this.save({ ...playlist, items }); }
  async shuffle(id) { const playlist = await this.get(id); const items = [...playlist.items].sort((a, b) => playlistItemKey(a).localeCompare(playlistItemKey(b))).reverse(); return this.save({ ...playlist, items }); }
  async touchPlayback(id, playhead, playback) { const playlist = await this.get(id); return this.save({ ...playlist, playhead, playback, lastPlayedAt: Date.now() }); }
  async export(id) { const playlist = await this.get(id); return { playlist, json: JSON.stringify(playlist) }; }
}

function makeItems(count) {
  return Array.from({ length: count }, (_, index) => index % 25 === 0 ? { year: '5748', folder: `Legacy ${index}` } : { type: 'track', title: `Track ${index}`, year: '5748', folder: `Folder ${index % 12}`, path: `/archive/${index}.mp3`, duration: 60 + (index % 300) });
}

function assertStore(Store) { ['savePlaylist', 'listPlaylists', 'getPlaylist', 'removePlaylist', 'reorderPlaylistItem', 'touchPlaylistPlayback'].forEach(name => assert(typeof Store?.[name] === 'function', `Store missing ${name}`)); }
function bounded(value, fallback, min, max) { const number = Number(value ?? fallback); return Math.max(min, Math.min(max, Number.isFinite(number) ? Math.floor(number) : fallback)); }
function assert(condition, message) { if (!condition) throw new Error(message); }
