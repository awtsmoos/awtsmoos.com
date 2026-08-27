/* B"H
Audio packets sleep in IndexedDB until the final mux asks them to rise as one buffer.
*/
const DB = 'BH_NESHER_AUDIO_PACKETS';
const STORE = 'packets';

export async function openAudioDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'key' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearAudioSession(sessionId) {
  const db = await openAudioDb();
  await txDone(db.transaction(STORE, 'readwrite'), store => {
    const range = IDBKeyRange.bound(`${sessionId}:`, `${sessionId}:~`);
    store.delete(range);
  });
  db.close();
}

export async function putAudioPacket(sessionId, index, sampleRate, channels) {
  const db = await openAudioDb();
  const packet = { key: `${sessionId}:${String(index).padStart(9, '0')}`, sessionId, index, sampleRate, channels };
  await txDone(db.transaction(STORE, 'readwrite'), store => store.put(packet));
  db.close();
}

export async function readAudioShim(sessionId, fallbackDuration, fallbackRate = 48000) {
  const packets = await readPackets(sessionId);
  if (!packets.length) return silentShim(fallbackDuration, fallbackRate);
  const sampleRate = packets[0].sampleRate || fallbackRate;
  const channelCount = packets[0].channels.length || 1;
  const total = packets.reduce((n, p) => n + p.channels[0].length, 0);
  const channels = Array.from({ length: channelCount }, () => new Float32Array(total));
  let offset = 0;
  packets.forEach(packet => { packet.channels.forEach((c, i) => channels[i].set(c, offset)); offset += packet.channels[0].length; });
  return { channels, sampleRate, length: total, duration: total / sampleRate, numberOfChannels: channelCount };
}

async function readPackets(sessionId) {
  const db = await openAudioDb(); const packets = [];
  await txDone(db.transaction(STORE, 'readonly'), store => {
    const range = IDBKeyRange.bound(`${sessionId}:`, `${sessionId}:~`);
    store.openCursor(range).onsuccess = event => { const cursor = event.target.result; if (!cursor) return; packets.push(cursor.value); cursor.continue(); };
  });
  db.close(); return packets;
}

function silentShim(duration, sampleRate) {
  const length = Math.max(1, Math.ceil(duration * sampleRate));
  return { channels: [new Float32Array(length)], sampleRate, length, duration: length / sampleRate, numberOfChannels: 1 };
}
function txDone(tx, useStore) { return new Promise((resolve, reject) => { useStore(tx.objectStore(STORE)); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); }
