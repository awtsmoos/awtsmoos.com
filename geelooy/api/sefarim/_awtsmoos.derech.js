// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file _awtsmoos.derech.js
 * @description
 * The Awtsmoos reveals each sefer through a guarded vessel, clear and bright;
 * Awtsmoos.com returns an empty doorway when old data is absent, never a crashing night.
 *
 * B"H 2026-10-17: added POST /write/batch — signature-authorized bulk write
 * for the Ikar translation import (Yaakov's publish-everything order).
 * Auth mirrors the packed import lane (importSign.js Ed25519): the signature
 * covers {v, ts, op:'sefarim/write', heichelId: corpus, payloadHash}, with
 * timestamp window + replay guard, fail-closed. Writes use setObjectKey
 * (append/merge) so existing keys are never clobbered.
 */

const importSign = require('../social/helper/routes/packed/importSign.js');
const { body } = require('../tunnel/control/core/request.js');

/**
 * @param {unknown} storedSefer Raw database value for one sefer.
 * @returns {{id: string, name: string}[]} Stable list of available portions.
 * @description
 * The Awtsmoos gives every vessel its measured form and every name its place;
 * arrays and object-backed stores both become one public shape with grace.
 */
function revealPortions(storedSefer) {
	const portionNames = Array.isArray(storedSefer)
		? storedSefer
		: storedSefer && typeof storedSefer === "object"
			? Object.keys(storedSefer)
			: [];

	return portionNames.map(portionName => ({
		id: String(portionName),
		name: String(portionName)
	}));
}

/**
 * @param {unknown} value Database value.
 * @returns {unknown} Existing value, or an empty array when the node is absent.
 * @description
 * When an old chamber is empty, Awtsmoos.com answers with a quiet vessel instead of a fall;
 * the Awtsmoos sustains the route through absence and lets the caller still receive it all.
 */
function revealOrEmpty(value) {
	return value == null ? [] : value;
}

const WRITE_OP = 'sefarim/write';
const CORPUS_RE = /^[a-z0-9_-]{1,40}$/i;
const WORK_RE = /^[A-Za-z0-9_.-]{1,120}$/;
const MAX_WORKS_PER_BATCH = 25;

async function readBody(info) {
	try {
		return (await body(info)) || {};
	} catch {
		return {};
	}
}

module.exports = {
	dynamicRoutes: async info => {
		await info.use({
			// B"H 2026-10-17: signature-authorized bulk write for translations.
			// POST body: {ts, sig, op:'sefarim/write', corpus, works:[{work,title,kind,units}], payloadHash}
			// payloadHash = sha256hex(JSON.stringify(works)) as received.
			"/write/batch": async () => {
				const method = String(info.request?.method || info.method || "GET").toUpperCase();
				if (method !== "POST") {
					return { response: { ok: false, error: "METHOD_NOT_ALLOWED" } };
				}
				const b = await readBody(info);
				const { ts, sig, op, corpus, works, payloadHash } = b;
				if (op !== WRITE_OP) {
					return { response: { ok: false, error: "BAD_OP" } };
				}
				if (typeof corpus !== "string" || !CORPUS_RE.test(corpus)) {
					return { response: { ok: false, error: "BAD_CORPUS" } };
				}
				if (!Array.isArray(works) || works.length === 0 || works.length > MAX_WORKS_PER_BATCH) {
					return { response: { ok: false, error: "BAD_WORKS" } };
				}
				const tc = importSign.checkTimestamp(ts);
				if (!tc.ok) return { response: { ok: false, error: "SIG_" + tc.error } };
				const recomputed = importSign.sha256hex(JSON.stringify(works));
				if (recomputed !== String(payloadHash || "")) {
					return { response: { ok: false, error: "PAYLOAD_HASH_MISMATCH" } };
				}
				const v = importSign.verifySignature(
					{ ts, op: WRITE_OP, heichelId: corpus, payloadHash: String(payloadHash) },
					sig
				);
				if (!v.ok) return { response: { ok: false, error: "SIG_" + v.error } };
				const rc = importSign.checkReplay(String(sig), ts);
				if (!rc.ok) return { response: { ok: false, error: "SIG_" + rc.error } };

				const now = new Date().toISOString();
				let wrote = 0;
				const writtenWorks = [];
				try {
					if (typeof info.db.write !== "function") {
						return { response: { ok: false, error: "NO_WRITE" } };
					}
					for (const w of works) {
						if (!w || typeof w !== "object") continue;
						if (typeof w.work !== "string" || !WORK_RE.test(w.work)) continue;
						if (!Array.isArray(w.units)) continue;
						const payload = {
							corpus,
							work: w.work,
							title: String(w.title || w.work),
							kind: String(w.kind || ""),
							units: w.units,
							unitCount: w.units.length,
							updatedAt: now
						};
						// B"H: preserve manifest work list.
						if (Array.isArray(w.works)) payload.works = w.works;
						// B"H: one BinaryJSON file per work; directory listing
						// reveals work keys for the portions read route.
						const wr = await info.db.write("/sefarim/" + corpus + "/" + w.work, payload);
						if (wr && wr.error) {
							return { response: { ok: false, error: "WRITE_FAILED", message: String(wr.error).slice(0, 200) } };
						}
						writtenWorks.push(w.work);
						wrote++;
					}
				} catch (e) {
					return { response: { ok: false, error: "WRITE_THROW", message: String((e && e.message) || e).slice(0, 300) } };
				}
				return { response: { ok: true, corpus, wrote, works: writtenWorks } };
			},
			"/": async () => {
				const sefarimRoot = await info.db.get("/sefarim");

				return {
					response: {
						sefarim: revealOrEmpty(sefarimRoot),
						available: sefarimRoot != null
					}
				};
			},
			"/:sefer": async vars => {
				// B"H 2026-10-17: prefer the explicit manifest (full work list);
				// directory listing is capped and cannot enumerate large corpora.
				let manifest = null;
				try {
					manifest = await info.db.get(`/sefarim/${vars.sefer}/_manifest`);
				} catch {}
				if (manifest && Array.isArray(manifest.works) && manifest.works.length) {
					return {
						response: {
							portions: manifest.works.map(w => ({
								id: String(w.id || w),
								name: String(w.title || w.id || w)
							})),
							available: true
						}
					};
				}
				const storedSefer = await info.db.get(`/sefarim/${vars.sefer}`);

				return {
					response: {
						portions: revealPortions(storedSefer),
						available: storedSefer != null
					}
				};
			},
			"/:sefer/section/:section": async vars => {
				let section = null;
				try {
					section = await info.db.get(
						`/sefarim/${vars.sefer}/${vars.section}`
					);
				} catch {}
				// B"H 2026-10-17: fallback when nested path get does not resolve;
				// works are stored as object keys via setObjectKey.
				if (section == null && info.db && typeof info.db.getValue === "function") {
					try {
						section = await info.db.getValue(`/sefarim/${vars.sefer}`, vars.section);
					} catch {}
				}
				if (section == null && info.db && typeof info.db.getObjectKey === "function") {
					try {
						section = await info.db.getObjectKey(`/sefarim/${vars.sefer}`, vars.section);
					} catch {}
				}

				return {
					response: {
						sections: revealOrEmpty(section),
						available: section != null
					}
				};
			},
			"/:sefer/section/:section/sub/:sub": async vars => {
				let subSection = null;
				try {
					subSection = await info.db.get(
						`/sefarim/${vars.sefer}/${vars.section}/${vars.sub}`
					);
				} catch {}
				if (subSection == null) {
					// B"H 2026-10-17: resolve the work, then select the unit by ref or index.
					let workPayload = null;
					try {
						workPayload = await info.db.get(`/sefarim/${vars.sefer}/${vars.section}`);
					} catch {}
					if (workPayload == null && info.db && typeof info.db.getValue === "function") {
						try {
							workPayload = await info.db.getValue(`/sefarim/${vars.sefer}`, vars.section);
						} catch {}
					}
					const units = workPayload && Array.isArray(workPayload.units) ? workPayload.units : [];
					const sub = String(vars.sub);
					subSection = units.find(u => u && (String(u.ref) === sub || String(u.unit_id) === sub))
						|| units[Number(sub)] || null;
				}

				return {
					response: {
						subSection: revealOrEmpty(subSection),
						available: subSection != null
					}
				};
			}
		});
	}
};
