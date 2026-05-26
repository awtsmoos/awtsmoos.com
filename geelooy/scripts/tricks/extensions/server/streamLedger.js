//B"H
(function revealAwtsmoosStreamLedger() {
  const ttl = 1000 * 60 * 8;

  /**
   * B"H — The background river remembers its sparks.
   *
   * A page may reload while ChatGPT still breathes. This ledger keeps reading
   * in the extension background, numbers every byte chunk, and lets the reborn
   * page ask for all chunks after its last remembered cursor.
   */
  class AwtsmoosStreamLedger {
    constructor() {
      this.streams = new Map();
    }

    create(id, response) {
      const reader = response.body?.getReader?.();
      const stream = { id, reader, chunks: [], readCursor: 0, done: !reader, error: null, waiters: [] };
      this.streams.set(id, stream);
      if (reader) this.pump(stream);
      else this.scheduleCleanup(id);
      return stream;
    }

    async read(id) {
      const stream = this.streams.get(id);
      if (!stream) throw new Error("Response not found or already consumed.");
      const chunk = await this.waitForChunk(stream, stream.readCursor);
      if (!chunk) return null;
      stream.readCursor = chunk.index + 1;
      return chunk.chunk;
    }

    async body(id, kind) {
      const stream = this.streams.get(id);
      if (!stream) throw new Error("Response not found or already consumed.");
      await this.waitUntilDone(stream);
      const bytes = concatUint8Arrays(stream.chunks.map(chunk => chunk.value));
      if (kind === "blob") return await blobToDataURL(new Blob([bytes], { type: "application/octet-stream" }));
      const text = new TextDecoder().decode(bytes);
      return kind === "json" ? JSON.parse(text) : text;
    }

    async resume(id, cursor = 0) {
      const stream = this.streams.get(id);
      if (!stream) return null;
      await this.waitForMovement(stream, Number(cursor || 0));
      return {
        id,
        done: Boolean(stream.done),
        chunks: stream.chunks.filter(chunk => chunk.index >= Number(cursor || 0)).map(({ index, chunk }) => ({ index, chunk }))
      };
    }

    async pump(stream) {
      try {
        while (true) {
          const { done, value } = await stream.reader.read();
          if (done) break;
          const index = stream.chunks.length;
          const chunk = await blobToDataURL(new Blob([value], { type: "application/octet-stream" }));
          stream.chunks.push({ index, value, chunk });
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

    waitForChunk(stream, cursor) {
      if (stream.chunks[cursor]) return Promise.resolve(stream.chunks[cursor]);
      if (stream.done) return Promise.resolve(null);
      return this.wait(stream).then(() => this.waitForChunk(stream, cursor));
    }

    waitUntilDone(stream) {
      if (stream.done) return Promise.resolve();
      return this.wait(stream).then(() => this.waitUntilDone(stream));
    }

    waitForMovement(stream, cursor) {
      if (stream.done || stream.chunks.length > cursor) return Promise.resolve();
      return this.wait(stream).then(() => this.waitForMovement(stream, cursor));
    }

    wait(stream) {
      return new Promise(resolve => stream.waiters.push(resolve));
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
