//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module AllPostsMerge
 * @description Incremental tail merge for the grouped all-post cache (split from allPostsIndex.js, verbatim).
 */

	const fs = require('fs');
	const { allPostKey, compactPost, postIdOf } = require('./allPostsCore.js');

//B"H 2026-10-19: incremental tail merge — when the shard only GREW (the
//common case: imports appending), parse just the new bytes and merge them
//into the cached groups instead of re-scanning 175MB. Full rebuild only when
//the file shrank or was replaced.
//B"H 2026-10-20 (allPosts-list fix): the merge now maintains the entry's
//alias dimension (byAlias) and heichel-ordered list (all) alongside the
//series groups, with the same remove-then-unshift discipline, so all
//three views stay consistent under append-only growth.
function mergeTailRecords(entry, file, from, to) {
  const fd = fs.openSync(file, 'r');
  try {
    const CHUNK = 4 * 1024 * 1024;
    const buf = Buffer.allocUnsafe(CHUNK);
    let pos = from;
    let leftover = '';
    const removeCompact = (arr, compact) => {
      if (!arr) return;
      const ix = arr.findIndex(p => p.postId === compact.postId && p.heichelId === compact.heichelId);
      if (ix >= 0) arr.splice(ix, 1);
    };
    const applyLine = (line) => {
      if (!line) return;
      let rec;
      try { rec = JSON.parse(line); } catch { return; }
      if (!rec || !rec.key) return;
      const value = rec.value || {};
      const k = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
      if (!k) return;
      // remove old entry everywhere
      const prev = entry.byKey.get(k);
      if (prev) {
        for (const sid of prev.seriesIds) {
          removeCompact(entry.groups.get(sid), prev.compact);
        }
        if (entry.byAlias) removeCompact(entry.byAlias.get(prev.compact.aliasId || ''), prev.compact);
        if (entry.all) removeCompact(entry.all, prev.compact);
        entry.byKey.delete(k);
      }
      if (rec.op === 'del') return;
      const compact = compactPost(value);
      const seriesIds = new Set(
        [value.seriesId, value.parentSeriesId].map(v => String(v || '')).filter(Boolean)
      );
      if (!seriesIds.size) seriesIds.add('root');
      const sidArr = [...seriesIds];
      entry.byKey.set(k, { seriesIds: sidArr, compact });
      for (const sid of sidArr) {
        if (!entry.groups.has(sid)) entry.groups.set(sid, []);
        entry.groups.get(sid).unshift(compact);
      }
      if (entry.byAlias) {
        const a = compact.aliasId || '';
        if (!entry.byAlias.has(a)) entry.byAlias.set(a, []);
        entry.byAlias.get(a).unshift(compact);
      }
      if (entry.all) entry.all.unshift(compact);
    };
    while (pos < to) {
      const n = fs.readSync(fd, buf, 0, Math.min(CHUNK, to - pos), pos);
      if (n <= 0) break;
      pos += n;
      const text = leftover + buf.subarray(0, n).toString('utf8');
      const lines = text.split('\n');
      leftover = lines.pop();
      for (const line of lines) applyLine(line);
    }
    if (leftover) applyLine(leftover);
  } finally {
    fs.closeSync(fd);
  }
}

module.exports = {
	mergeTailRecords
};
