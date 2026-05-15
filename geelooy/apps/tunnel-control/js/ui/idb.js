
// B"H
const DB_NAME = "awtsmoosTunnelControl";
const STORE = "settings";

function fallbackGet(key) {
  return localStorage.getItem("awt:" + key);
}

function fallbackSet(key, value) {
  localStorage.setItem("awt:" + key, String(value ?? ""));
}

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

export async function idbGet(key, fallback = "") {
  try {
    const db = await openDb();

    return await new Promise(resolve => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);

      req.onsuccess = () => resolve(req.result ?? fallbackGet(key) ?? fallback);
      req.onerror = () => resolve(fallbackGet(key) ?? fallback);
    });
  } catch (e) {
    return fallbackGet(key) ?? fallback;
  }
}

export async function idbSet(key, value) {
  fallbackSet(key, value);

  try {
    const db = await openDb();

    await new Promise(resolve => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(String(value ?? ""), key);
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
  } catch (e) {}
}
