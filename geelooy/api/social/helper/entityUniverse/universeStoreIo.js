//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module universeStoreIo
 * @description
 * Low-level entity store reads, list writes and folder hydration.
 */

async function read($i, path, fallback = null) {
  try { return (await $i.db.get(path)) ?? fallback; } catch { return fallback; }
}

async function writeList($i, path, value) {
  const current = await read($i, path, []);
  const list = Array.isArray(current) ? current : Object.keys(current || {});
  if (!list.includes(value)) list.push(value);
  await $i.db.write(path, list);
}

async function folderValues($i, folderPath) {
  const root = await read($i, folderPath, {});
  if (Array.isArray(root)) {
    const out = [];
    for (const item of root) {
      if (item && typeof item === 'object' && item.id) out.push(item);
      else {
        const hydrated = await read($i, `${folderPath}/${item}`, null);
        if (hydrated && typeof hydrated === 'object') out.push(hydrated);
      }
    }
    return out;
  }
  if (!root || typeof root !== 'object') return [];
  const out = [];
  for (const [key, value] of Object.entries(root)) {
    if (value && typeof value === 'object' && value.id) out.push(value);
    else {
      const hydrated = await read($i, `${folderPath}/${key}`, null);
      if (hydrated && typeof hydrated === 'object') out.push(hydrated);
    }
  }
  return out;
}

module.exports = {
	read,
	writeList,
	folderValues
};
