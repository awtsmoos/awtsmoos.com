//B"H
export const YEARS = {
  "5711": "5711-1764816569",
  "5712": "5712-1764816569",
  "5713": "5713-1764816569",
  "5714": "5714-1764816569",
  "5715": "5715-1764816569",
  "5716": "5716-1764816569",
  "5717": "5717-1764816569",
  "5718": "5718-1764816569",
  "5719": "5719-1764816569",
  "5720": "5720-1764816569",
  "5721": "5721-1764816569",
  "5722": "5722-1764816569",
  "5723": "5723-1764816569",
  "5724": "5724-1764816569",
  "5725": "5725-1764816569",
  "5726": "5726-1764816569",
  "5727": "5727-1764816569",
  "5728": "5728-1764816569",
  "5729": "5729-1764816569",
  "5730": "5730-1764805608",
  "5732": "5732-1764805608",
  "5733": "5733-1764805608",
  "5734": "5734-1764805608",
  "5735": "5735-1764805608",
  "5736": "5736-1764805608",
  "5737": "5737-1764805608",
  "5738": "5738-1764805608",
  "5739": "5739-1764805608",
  "5740": "5740-1764759611",
  "5741": "5741-1764759611",
  "5742": "5742-1764759611",
  "5743": "5743-1764759611",
  
  
  "5747": "5747-1764759611",
  "5748": "5748-1764805608",
  "5749": "5749-1764833216",
  "5750": "5750-1764833216",
  "5751": "5751-1764833216",
  "5752": "5752-1764833216"
 

};

const DB_NAME = "AwtsmoosExtremeDB";
const STORE_NAME = "tracks";

let db = null;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      db = e.target.result;
      if(!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "path" });
      }
    };
    request.onsuccess = (e) => {
      db = e.target.result;
      resolve();
    };
    request.onerror = (e) => reject(e);
  });
}

export async function saveTrack(path, blob) {
  if(!db) await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put({ path, blob, savedAt: Date.now() });
}

export async function getTrack(path) {
  if(!db) await initDB();
  return new Promise(resolve => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(path);
    req.onsuccess = () => resolve(req.result ? req.result.blob : null);
    req.onerror = () => resolve(null);
  });
}

export async function clearAllTracks() {
    if(!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e);
    });
}