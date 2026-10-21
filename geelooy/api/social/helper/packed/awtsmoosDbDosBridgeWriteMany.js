//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module awtsmoosDbDosBridgeWriteMany
 * @description
 * DosDB family bridge bulk native write (writeMany).
 */

const { AwtsmoosDbDosBridgeBase } = require('./awtsmoosDbDosBridgeBase.js');
const { pathWithDefaultExtension } = require('./awtsmoosDbFamilies.js');
const { serializeValue } = require('./awtsmoosDbValueCodec.js');

class AwtsmoosDbDosBridgeWriteMany extends AwtsmoosDbDosBridgeBase {
	// B"H 2026-10-11 (import-speed): BULK native write (design doc §3.1).
	// entries: [{ id, value }] or [{ id, buffer }] (pre-serialized Buffer).
	// Groups entries by family bridge; each bridge lands its share in ONE
	// fs transaction via writeManyBuffers — one round of per-file overhead
	// per 100–500 records instead of per record. Returns per-entry
	// { id, ok, bytes?, error? } in INPUT order. Entries with no native
	// bridge fall back to serial legacy writes. Serialization failures are
	// reported per entry, never thrown.
	async writeMany(entries) {
		const list = Array.isArray(entries) ? entries : [];
		const out = new Array(list.length);
		const byBridge = new Map();
		const serial = [];
		for (let i = 0; i < list.length; i++) {
			const entry = list[i] || {};
			const id = entry.id;
			const virtualPath = pathWithDefaultExtension(id);
			let buffer = entry.buffer;
			if (!Buffer.isBuffer(buffer)) {
				try {
					buffer = serializeValue(entry.value, virtualPath);
				} catch (e) {
					out[i] = { id, ok: false, error: 'SERIALIZE_FAILED: ' + ((e && e.message) || e) };
					continue;
				}
			}
			const bridge = this._bridgeForWrite(virtualPath);
			if (bridge) {
				let items = byBridge.get(bridge);
				if (!items) { items = []; byBridge.set(bridge, items); }
				// NOTE: writeManyBuffers entries are { virtualPath, value }.
				items.push({ idx: i, virtualPath, value: buffer });
			} else {
				serial.push({ idx: i, id, buffer });
			}
		}
		for (const [bridge, items] of byBridge) {
			let res;
			try {
				res = bridge.writeManyBuffers(items);
			} catch (e) {
				const msg = (e && e.message) || String(e);
				for (const it of items) out[it.idx] = { id: list[it.idx].id, ok: false, error: msg };
				continue;
			}
			for (let k = 0; k < items.length; k++) {
				const it = items[k];
				const r = res[k] || {};
				out[it.idx] = r.ok
					? { id: list[it.idx].id, ok: true, bytes: r.bytes }
					: { id: list[it.idx].id, ok: false, error: r.error || 'WRITE_FAILED' };
			}
		}
		for (const s of serial) {
			try {
				await this.write(s.id, s.buffer);
				out[s.idx] = { id: s.id, ok: true, bytes: s.buffer.length };
			} catch (e) {
				out[s.idx] = { id: s.id, ok: false, error: (e && e.message) || String(e) };
			}
		}
		return out;
	}

}

module.exports = {
	AwtsmoosDbDosBridgeWriteMany
};
