// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RashiApi
 * @description
 * Fetches Rashi's English commentary posts from the public Awtsmoos API.
 * Rashi posts live at:
 *   GET /api/social/heichelos/ikar/series/rashi-bavli-<slug>/post/rashi-bavli-<slug>
 * Kiddushin is split per-daf:
 *   GET /api/social/heichelos/ikar/series/rashi-bavli-kiddushin-<daf>/post/rashi-bavli-kiddushin-<daf>
 * Units carry { ref: "2a:1#c0", dibur, hebrew, english }.
 */

const API_BASE = '/api/social/heichelos/ikar';

/** postId -> parsed units[] (in-memory cache, one fetch per page session). */
const postCache = new Map();

/**
 * Maps a Bavli seriesId / masechta name to the Rashi post slug.
 * Covers the 38 masechtos with Rashi English live.
 */
const MASECHTA_SLUGS = {
  // canonical rashi slugs
  'berakhot': 'berakhot', 'berachos': 'berakhot', 'berachot': 'berakhot',
  'shabbat': 'shabbat', 'shabbos': 'shabbat',
  'eruvin': 'eruvin', 'eiruvin': 'eruvin',
  'pesachim': 'pesachim', 'pesach': 'pesachim',
  'yoma': 'yoma', 'yuma': 'yoma',
  'sukkah': 'sukkah', 'sukkos': 'sukkah', 'succah': 'sukkah',
  'beitzah': 'beitzah', 'beitza': 'beitzah', 'beitzoh': 'beitzah',
  'rosh-hashanah': 'rosh-hashanah', 'rosh-hashana': 'rosh-hashanah', 'roshhashana': 'rosh-hashanah',
  'taanit': 'taanit', 'taanis': 'taanit', 'taanith': 'taanit',
  'megillah': 'megillah', 'megilla': 'megillah',
  'moed-katan': 'moed-katan', 'moedkatan': 'moed-katan', 'moed-koton': 'moed-katan',
  'chagigah': 'chagigah', 'chagiga': 'chagigah', 'chagigoh': 'chagigah',
  'yevamot': 'yevamot', 'yevamos': 'yevamot', 'yevamoth': 'yevamot',
  'ketubot': 'ketubot', 'kesubos': 'ketubot', 'kesuvos': 'ketubot',
  'nedarim': 'nedarim',
  'nazir': 'nazir', 'nozir': 'nazir',
  'sotah': 'sotah', 'sota': 'sotah', 'sotoh': 'sotah',
  'gittin': 'gittin', 'gitin': 'gittin',
  'kiddushin': 'kiddushin', 'kidushin': 'kiddushin',
  'bava-kamma': 'bava-kamma', 'bavakamma': 'bava-kamma', 'bava-kama': 'bava-kamma', 'bavakama': 'bava-kamma',
  'bava-metzia': 'bava-metzia', 'bavametzia': 'bava-metzia', 'bava-metsia': 'bava-metzia',
  'bava-batra': 'bava-batra', 'bavabatra': 'bava-batra',
  'sanhedrin': 'sanhedrin',
  'makkot': 'makkot', 'makos': 'makkot', 'makot': 'makkot',
  'shevuot': 'shevuot', 'shavuos': 'shevuot', 'shevuos': 'shevuot', 'shvuos': 'shevuot',
  'avodah-zarah': 'avodah-zarah', 'avodahzarah': 'avodah-zarah', 'avodah-zara': 'avodah-zarah',
  'horayot': 'horayot', 'horayos': 'horayot',
  'zevachim': 'zevachim', 'zevach': 'zevachim', 'zevachin': 'zevachim',
  'menachot': 'menachot', 'menachos': 'menachot',
  'chullin': 'chullin', 'chulin': 'chullin', 'chul': 'chullin',
  'bekhorot': 'bekhorot', 'bechoros': 'bekhorot', 'bechorot': 'bekhorot',
  'arakhin': 'arakhin', 'arachin': 'arakhin', 'erchin': 'arakhin',
  'temurah': 'temurah', 'temura': 'temurah', 'temuroh': 'temurah',
  'keritot': 'keritot', 'krisos': 'keritot', 'kretot': 'keritot',
  'meilah': 'meilah', 'meila': 'meilah', 'meiloh': 'meilah',
  'niddah': 'niddah', 'nida': 'niddah', 'nidda': 'niddah',
};

export function rashiSlugFor(masechta) {
  if (!masechta) return null;
  const key = String(masechta).trim().toLowerCase().replace(/[_\s]+/g, '-');
  return MASECHTA_SLUGS[key] || null;
}

function rashiPostUrl(slug, daf) {
  const postId = slug === 'kiddushin' && daf
    ? `rashi-bavli-kiddushin-${String(daf).toLowerCase()}`
    : `rashi-bavli-${slug}`;
  return `${API_BASE}/series/${postId}/post/${postId}`;
}

/**
 * Fetches and caches the Rashi post for a masechta (+daf for Kiddushin).
 * @returns {Promise<Array>} normalized units [{ref, dibur, hebrew, english}]
 */
export async function fetchRashiUnits(masechta, daf) {
  const slug = rashiSlugFor(masechta);
  if (!slug) throw new Error('RASHI_NO_MASECHTA:' + masechta);
  const url = rashiPostUrl(slug, daf);
  if (postCache.has(url)) return postCache.get(url);
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error('RASHI_FETCH_FAILED:' + res.status);
  const post = await res.json();
  const units = Array.isArray(post.units) ? post.units : [];
  const normalized = units
    .filter((u) => u && (u.english || u.hebrew))
    .map((u) => ({
      ref: String(u.ref || ''),
      dibur: String(u.dibur || ''),
      hebrew: String(u.hebrew || ''),
      english: String(u.english || ''),
    }));
  postCache.set(url, normalized);
  return normalized;
}

/**
 * Filters Rashi units to those commenting on the given Vilna daf (e.g. "2a", "46b").
 * Rashi refs look like "2a:1#c0".
 */
export function unitsForDaf(units, daf) {
  if (!daf) return units;
  const d = String(daf).toLowerCase();
  // Numeric dafs (e.g. "46") match both amudim: "46a:" and "46b:".
  const prefixes = /^\d+$/.test(d) ? [d + 'a:', d + 'b:'] : [d + ':'];
  return units.filter((u) => {
    const ref = u.ref.toLowerCase();
    return prefixes.some((p) => ref.startsWith(p));
  });
}
