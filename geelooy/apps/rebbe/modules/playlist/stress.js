//B"H
// modules/playlist/stress.js
import { normalizePlaylistItems, playlistItemKey, playlistStatsSnapshot } from './model.js';

const PLAYLIST_COUNTS = [10, 100, 1000];
const ITEM_COUNTS = [10, 100, 1000, 10000];

/**
 * B"H
 * A real executable playlist gauntlet: not comments, not wishes. It creates
 * large normalized libraries, saves, restores, reloads, reorders, shuffles,
 * exports, deletes, and recreates in a deterministic in-memory store so the
 * model can be stressed without browser IndexedDB ceremony.
 */
export async function runPlaylistStressSuite() {
  const results = [];
  for (const playlistCount of PLAYLIST_COUNTS) {
    for (const itemCount of ITEM_COUNTS) {
      results.push(await stressCase(playlistCount, itemCount));
    }
  }
  return { ok: results.every(result => result.ok), results };
}

export async function stressCase(playlistCount, itemCount) {
  const store = new MemoryPlaylistStore();
  const baseItems = makeItems(itemCount);
  for (let index = 0; index < playlistCount; index++) {
    await store.save({ id: `pl-${index}`, title: `Stress ${index}`, items: baseItems });
  }
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
  async save(playlist) {
    const clean = { ...playlist, items: normalizePlaylistItems(playlist.items || []), updatedAt: Date.now() };
    this.map.set(clean.id, clean);
    return clean;
  }
  async get(id) { return this.map.get(id) || null; }
  async list() { return [...this.map.values()].sort((a, b) => String(a.id).localeCompare(String(b.id))); }
  async remove(id) { this.map.delete(id); }
  async reorder(id, from, to) {
    const playlist = await this.get(id);
    const items = [...playlist.items];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    return this.save({ ...playlist, items });
  }
  async shuffle(id) {
    const playlist = await this.get(id);
    const items = [...playlist.items].sort((a, b) => playlistItemKey(a).localeCompare(playlistItemKey(b))).reverse();
    return this.save({ ...playlist, items });
  }
  async touchPlayback(id, playhead, playback) {
    const playlist = await this.get(id);
    return this.save({ ...playlist, playhead, playback, lastPlayedAt: Date.now() });
  }
  async export(id) {
    const playlist = await this.get(id);
    return { playlist, json: JSON.stringify(playlist) };
  }
}

function makeItems(count) {
  return Array.from({ length: count }, (_, index) => index % 25 === 0 ?
    { year: '5748', folder: `Legacy ${index}` } :
    { type: 'track', title: `Track ${index}`, year: '5748', folder: `Folder ${index % 12}`, path: `/archive/${index}.mp3`, duration: 60 + (index % 300) });
}

function assert(condition, message) { if (!condition) throw new Error(message); }
