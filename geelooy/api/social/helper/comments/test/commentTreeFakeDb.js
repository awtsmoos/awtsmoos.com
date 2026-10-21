//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file commentTreeFakeDb.js
 * @description Fake DB extracted verbatim from commentTreeSectionEditDelete.test.js.
 */
function arrayWithSuccess(values) {
  const arr = [...values];
  arr.success = arr;
  return arr;
}

function createFakeDb() {
  const store = new Map();
  return {
    store,
    async appendToArrayAtKey(filePath, { key, shtar }) {
      const object = store.get(filePath) || {};
      object[key] = Array.isArray(object[key]) ? object[key] : [];
      object[key].push(shtar);
      store.set(filePath, object);
      return { success: true };
    },
    async getObjectKey(filePath, key) {
      return store.get(filePath)?.[key] || [];
    },
    async setObjectKey(filePath, key, value) {
      const object = store.get(filePath) || {};
      object[key] = value;
      store.set(filePath, object);
      return { success: true };
    },
    async deleteObjectKey(filePath, key) {
      const object = store.get(filePath) || {};
      delete object[key];
      store.set(filePath, object);
      return { success: true };
    },
    async getObjectKeys(filePath) {
      return arrayWithSuccess(Object.keys(store.get(filePath) || {}));
    },
    async hasObjectKey(filePath, key) {
      return Array.isArray(store.get(filePath)?.[key]);
    },
    async get(filePath) {
      if (filePath === '/users/u1/aliases/alice') return { aliasId: 'alice' };
      if (filePath === '/users/u2/aliases/bob') return { aliasId: 'bob' };
      const exact = store.get(filePath);
      if (exact !== undefined) return exact;
      const prefix = filePath.endsWith('/') ? filePath : `${filePath}/`;
      const names = new Set();
      for (const key of store.keys()) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length).split('/')[0];
        if (rest) names.add(rest);
      }
      return [...names];
    },
    async write(filePath, value) { store.set(filePath, value); return { success: true }; },
    async syncKeyInObj(filePath, key) {
      const object = store.get(filePath) || {};
      object[key] = true;
      store.set(filePath, object);
      return { success: true };
    },
    async removeElementFromArray(filePath, value) {
      const current = store.get(filePath);
      if (!Array.isArray(current)) return { success: true, removed: false };
      store.set(filePath, current.filter(item => item !== value));
      return { success: true, removed: current.includes(value) };
    },
    async removeElementFromArray(filePath, value) {
      const current = store.get(filePath);
      if (!Array.isArray(current)) return { success: true, removed: false };
      store.set(filePath, current.filter(item => item !== value));
      return { success: true, removed: current.includes(value) };
    },
    async count(filePath) {
      const value = store.get(filePath);
      if (!value || typeof value !== 'object') return { success: 0 };
      return { success: Object.keys(value).length };
    },
    async delete(filePath) { store.delete(filePath); return { success: true }; },
    async exists(filePath) { return { success: store.has(filePath) }; }
  };
}

module.exports = { createFakeDb };