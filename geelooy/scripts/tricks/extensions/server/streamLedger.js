//B"H
(function revealAwtsmoosStreamLedger() {
  const ttl = 1000 * 60 * 8;
  const MAX_STREAMS = 24;
  const MAX_CHUNKS = 1800;
  const MAX_BYTES = 12 * 1024 * 1024;

  /**
   * B"H — The background river remembers, but refuses to drown Chrome.
   *
   * A page may reload while ChatGPT still breathes. This ledger keeps numbered
   * byte chunks for replay, but stores only one data URL copy, trims old stream
   * records, and hard-caps per-stream memory. If a stream becomes impossibly
   * huge, the oldest replay chunks are sacrificed rather than crashing the tab.
   */
  class AwtsmoosStreamLedger {
    constructor() {
      this.streams = new Map();
    }

    create(id, response) {
      this.pruneStreamCount();
      const reader = response.body?.getReader?.();
      const stream = { id, reader, chunks: [], baseIndex: 0, readCursor: 0, byteSize: 0, done: !reader, error: null, truncated: false, waiters: [], createdAt: Date.now(), touchedAt: Date.now() };
      this.streams.set(id, stream);
      if (reader) this.pump(stream);
      else this.scheduleCleanup(id);
      return stream;
    }

    async read(id) {
      const stream = this.touch(id);
      if (!stream) throw new Error("Response not found or already consumed.");
      const chunk = await this.waitForChunk(stream, stream.readCursor);
      if (!chunk) return null;
      stream.readCursor = chunk.index + 1;
      return chunk.chunk;
    }

    async body(id, kind) {
      const stream = this.touch(id);
      if (!stream) throw new Error("Response not found or already consumed.");
      await this.waitUntilDone(stream);
      const bytes = concatUint8Arrays(stream.chunks.map(chunk => dataUrlToBytes(chunk.chunk)));
      if (kind === "blob") return await blobToDataURL(new Blob([bytes], { type: "application/octet-stream" }));
      const text = new TextDecoder().decode(bytes);
      return kind === "json" ? JSON.parse(text) : text;
    }

    async resume(id, cursor = 0) {
      const stream = this.touch(id);
      if (!stream) return null;
      const wanted = Math.max(Number(cursor || 0), stream.baseIndex);
      await this.waitForMovement(stream, wanted, 10000);
      return {
        id,
        done: Boolean(stream.done),
        error: stream.error || null,
        baseIndex: stream.baseIndex,
        truncated: Boolean(stream.truncated || Number(cursor || 0) < stream.baseIndex),
        chunks: stream.chunks.filter(chunk => chunk.index >= wanted).map(({ index, chunk }) => ({ index, chunk }))
      };
    }

    ack(id, cursor = 0) {
      const stream = this.touch(id);
      if (!stream) return null;
      stream.touchedAt = Date.now();
      return this.stats(id);
    }

    stats(id) {
      const stream = this.streams.get(id);
      if (!stream) return null;
      return { id, chunks: stream.chunks.length, baseIndex: stream.baseIndex, byteSize: stream.byteSize, done: stream.done, truncated: stream.truncated };
    }

    async pump(stream) {
      try {
        while (true) {
          const { done, value } = await stream.reader.read();
          if (done) break;
          const index = stream.baseIndex + stream.chunks.length;
          const chunk = await blobToDataURL(new Blob([value], { type: "application/octet-stream" }));
          stream.chunks.push({ index, size: value?.byteLength || 0, chunk });
          stream.byteSize += value?.byteLength || 0;
          stream.touchedAt = Date.now();
          this.enforceStreamBudget(stream);
          this.wake(stream);
        }
      } catch (error) {
        stream.error = String(error?.stack || error?.message || error);
      } finally {
        stream.done = true;
        this.wake(stream);
        this.scheduleCleanup(stream.id);
      }
    }

    enforceStreamBudget(stream) {
      while (stream.chunks.length > MAX_CHUNKS || stream.byteSize > MAX_BYTES) {
        const removed = stream.chunks.shift();
        if (!removed) break;
        stream.baseIndex = removed.index + 1;
        stream.byteSize = Math.max(0, stream.byteSize - (removed.size || 0));
        stream.truncated = true;
      }
    }

    pruneStreamCount() {
      while (this.streams.size >= MAX_STREAMS) {
        const oldest = [...this.streams.values()].sort((a, b) => (a.touchedAt || a.createdAt) - (b.touchedAt || b.createdAt))[0];
        if (!oldest) break;
        this.streams.delete(oldest.id);
      }
    }

    touch(id) {
      const stream = this.streams.get(id);
      if (stream) stream.touchedAt = Date.now();
      return stream;
    }

    waitForChunk(stream, cursor) {
      if (cursor < stream.baseIndex) cursor = stream.baseIndex;
      const found = stream.chunks.find(chunk => chunk.index === cursor);
      if (found) return Promise.resolve(found);
      if (stream.done) return Promise.resolve(null);
      return this.wait(stream).then(() => this.waitForChunk(stream, cursor));
    }

    waitUntilDone(stream) {
      if (stream.done) return Promise.resolve();
      return this.wait(stream).then(() => this.waitUntilDone(stream));
    }

    waitForMovement(stream, cursor, timeoutMs = 10000) {
      if (stream.done || stream.error || stream.chunks.some(chunk => chunk.index >= cursor)) return Promise.resolve();
      return this.wait(stream, timeoutMs).then(() => undefined);
    }

    wait(stream, timeoutMs = 0) {
      return new Promise(resolve => {
        let done = false;
        let timer = null;
        const finish = () => {
          if (done) return;
          done = true;
          if (timer) clearTimeout(timer);
          const index = stream.waiters.indexOf(finish);
          if (index >= 0) stream.waiters.splice(index, 1);
          resolve();
        };
        stream.waiters.push(finish);
        if (timeoutMs > 0) timer = setTimeout(finish, timeoutMs);
      });
    }

    wake(stream) {
      const waiters = stream.waiters.splice(0);
      for (const resolve of waiters) resolve();
    }

    scheduleCleanup(id) {
      setTimeout(() => this.streams.delete(id), ttl);
    }
  }

  function concatUint8Arrays(arrays) {
    let totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);
    let concatenated = new Uint8Array(totalLength);
    let offset = 0;
    arrays.forEach(array => { concatenated.set(array, offset); offset += array.length; });
    return concatenated;
  }

  function dataUrlToBytes(url = "") {
    const base64 = String(url).split(",").pop() || "";
    if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(base64, "base64"));
    if (typeof atob === "function") return binaryStringToBytes(atob(base64));
    return decodeBase64(base64);
  }

  function binaryStringToBytes(binary = "") {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function decodeBase64(input = "") {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const clean = String(input).replace(/=+$/, "");
    const out = [];
    let buffer = 0;
    let bits = 0;
    for (const char of clean) {
      const value = chars.indexOf(char);
      if (value < 0) continue;
      buffer = (buffer << 6) | value;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out.push((buffer >> bits) & 255);
      }
    }
    return new Uint8Array(out);
  }

  function blobToDataURL(blob) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  globalThis.AwtsmoosStreamLedger = globalThis.AwtsmoosStreamLedger || AwtsmoosStreamLedger;
  globalThis.__awtsmoosStreamLedger = globalThis.__awtsmoosStreamLedger || new globalThis.AwtsmoosStreamLedger();
})();
