
// B"H

const DB_NAME = "awtsmoosTunnelControl";
const STORE = "settings";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLocalSetting(key, value) {
  try {
    const db = await openDb();

    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    localStorage.setItem("awtsTunnel:" + key, JSON.stringify(value));
    return true;
  }
}

export async function readLocalSetting(key, fallback = null) {
  try {
    const db = await openDb();

    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result === undefined ? fallback : req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    try {
      const raw = localStorage.getItem("awtsTunnel:" + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e2) {
      return fallback;
    }
  }
}
