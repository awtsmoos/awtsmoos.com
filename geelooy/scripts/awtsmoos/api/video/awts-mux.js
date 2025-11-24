//B"H


// WebM Muxer module
const WebMMuxer = (function () {
  // EBML Float Wrappers
  class EBMLFloat32 {
    constructor(value) {
      this.value = value;
    }
  }

  class EBMLFloat64 {
    constructor(value) {
      this.value = value;
    }
  }

  // Utility Functions
  function measureUnsignedInt(value) {
    if (value < 1 << 8) return 1;
    if (value < 1 << 16) return 2;
    if (value < 1 << 24) return 3;
    if (value < 2 ** 32) return 4;
    if (value < 2 ** 40) return 5;
    return 6;
  }

  function measureEBMLVarInt(value) {
    if (value < (1 << 7) - 1) return 1;
    if (value < (1 << 14) - 1) return 2;
    if (value < (1 << 21) - 1) return 3;
    if (value < (1 << 28) - 1) return 4;
    if (value < 2 ** 35 - 1) return 5;
    if (value < 2 ** 42 - 1) return 6;
    throw new Error("EBML VINT size not supported " + value);
  }

  function readBits(bytes, start, end) {
    let result = 0;
    for (let i = start; i < end; i++) {
      let byteIndex = Math.floor(i / 8);
      let byte = bytes[byteIndex];
      let bitIndex = 7 - (i & 7);
      let bit = (byte & (1 << bitIndex)) >> bitIndex;
      result <<= 1;
      result |= bit;
    }
    return result;
  }

  function writeBits(bytes, start, end, value) {
    for (let i = start; i < end; i++) {
      let byteIndex = Math.floor(i / 8);
      let byte = bytes[byteIndex];
      let bitIndex = 7 - (i & 7);
      byte &= ~(1 << bitIndex);
      byte |= ((value & (1 << (end - i - 1))) >> (end - i - 1)) << bitIndex;
      bytes[byteIndex] = byte;
    }
  }

  
  class Target {}

  class ArrayBufferTarget extends Target {
    constructor() {
      super();
      this.buffer = null;
    }
  }

  class StreamTarget extends Target {
    constructor(options) {
      super();
      this.options = options;
      if (typeof options !== "object") {
        throw new TypeError("StreamTarget requires an options object.");
      }
      if (options.onData) {
        if (typeof options.onData !== "function") {
          throw new TypeError("options.onData must be a function.");
        }
        if (options.onData.length < 2) {
          throw new TypeError(
            "options.onData must take at least two arguments (data and position)."
          );
        }
      }
      if (options.onHeader && typeof options.onHeader !== "function") {
        throw new TypeError("options.onHeader must be a function.");
      }
      if (options.onCluster && typeof options.onCluster !== "function") {
        throw new TypeError("options.onCluster must be a function.");
      }
      if (options.chunked !== undefined && typeof options.chunked !== "boolean") {
        throw new TypeError("options.chunked must be a boolean.");
      }
      if (
        options.chunkSize !== undefined &&
        (!Number.isInteger(options.chunkSize) || options.chunkSize <= 0)
      ) {
        throw new TypeError("options.chunkSize must be a positive integer.");
      }
    }
  }

  class FileSystemWritableFileStreamTarget extends Target {
    constructor(stream, options) {
      super();
      this.stream = stream;
      this.options = options;
      if (!(stream instanceof FileSystemWritableFileStream)) {
        throw new TypeError(
          "FileSystemWritableFileStreamTarget requires a FileSystemWritableFileStream instance."
        );
      }
      if (options !== undefined && typeof options !== "object") {
        throw new TypeError("options must be an object.");
      }
      if (options) {
        if (
          options.chunkSize !== undefined &&
          (!Number.isInteger(options.chunkSize) || options.chunkSize <= 0)
        ) {
          throw new TypeError("options.chunkSize must be a positive integer.");
        }
      }
    }
  }

  // Writer Classes
  class Writer {
    constructor() {
      this.pos = 0;
      this.helper = new Uint8Array(8);
      this.helperView = new DataView(this.helper.buffer);
      this.offsets = new WeakMap();
      this.dataOffsets = new WeakMap();
    }

    seek(newPos) {
      this.pos = newPos;
    }

    writeByte(value) {
      this.helperView.setUint8(0, value);
      this.write(this.helper.subarray(0, 1));
    }

    writeFloat32(value) {
      this.helperView.setFloat32(0, value, false);
      this.write(this.helper.subarray(0, 4));
    }

    writeFloat64(value) {
      this.helperView.setFloat64(0, value, false);
      this.write(this.helper);
    }

    writeUnsignedInt(value, width = measureUnsignedInt(value)) {
      let pos = 0;
      switch (width) {
        case 6:
          this.helperView.setUint8(pos++, Math.floor(value / 2 ** 40));
        case 5:
          this.helperView.setUint8(pos++, Math.floor(value / 2 ** 32));
        case 4:
          this.helperView.setUint8(pos++, value >> 24);
        case 3:
          this.helperView.setUint8(pos++, value >> 16);
        case 2:
          this.helperView.setUint8(pos++, value >> 8);
        case 1:
          this.helperView.setUint8(pos++, value);
          break;
        default:
          throw new Error("Bad UINT size " + width);
      }
      this.write(this.helper.subarray(0, pos));
    }

    writeString(str) {
      this.write(new Uint8Array(str.split("").map((x) => x.charCodeAt(0))));
    }

    writeEBMLVarInt(value, width = measureEBMLVarInt(value)) {
      let pos = 0;
      switch (width) {
        case 1:
          this.helperView.setUint8(pos++, 1 << 7 | value);
          break;
        case 2:
          this.helperView.setUint8(pos++, 1 << 6 | (value >> 8));
          this.helperView.setUint8(pos++, value);
          break;
        case 3:
          this.helperView.setUint8(pos++, 1 << 5 | (value >> 16));
          this.helperView.setUint8(pos++, value >> 8);
          this.helperView.setUint8(pos++, value);
          break;
        case 4:
          this.helperView.setUint8(pos++, 1 << 4 | (value >> 24));
          this.helperView.setUint8(pos++, value >> 16);
          this.helperView.setUint8(pos++, value >> 8);
          this.helperView.setUint8(pos++, value);
          break;
        case 5:
          this.helperView.setUint8(pos++, 1 << 3 | ((value / 2 ** 32) & 7));
          this.helperView.setUint8(pos++, value >> 24);
          this.helperView.setUint8(pos++, value >> 16);
          this.helperView.setUint8(pos++, value >> 8);
          this.helperView.setUint8(pos++, value);
          break;
        case 6:
          this.helperView.setUint8(pos++, 1 << 2 | ((value / 2 ** 40) & 3));
          this.helperView.setUint8(pos++, Math.floor(value / 2 ** 32));
          this.helperView.setUint8(pos++, value >> 24);
          this.helperView.setUint8(pos++, value >> 16);
          this.helperView.setUint8(pos++, value >> 8);
          this.helperView.setUint8(pos++, value);
          break;
        default:
          throw new Error("Bad EBML VINT size " + width);
      }
      this.write(this.helper.subarray(0, pos));
    }

    writeEBML(data) {
      if (data === null) return;
      if (data instanceof Uint8Array) {
        this.write(data);
      } else if (Array.isArray(data)) {
        for (let elem of data) {
          this.writeEBML(elem);
        }
      } else {
        this.offsets.set(data, this.pos);
        this.writeUnsignedInt(data.id);
        if (Array.isArray(data.data)) {
          let sizePos = this.pos;
          let sizeSize = data.size === -1 ? 1 : data.size || 4;
          if (data.size === -1) {
            this.writeByte(255);
          } else {
            this.seek(this.pos + sizeSize);
          }
          let startPos = this.pos;
          this.dataOffsets.set(data, startPos);
          this.writeEBML(data.data);
          if (data.size !== -1) {
            let size = this.pos - startPos;
            let endPos = this.pos;
            this.seek(sizePos);
            this.writeEBMLVarInt(size, sizeSize);
            this.seek(endPos);
          }
        } else if (typeof data.data === "number") {
          let size = data.size || measureUnsignedInt(data.data);
          this.writeEBMLVarInt(size);
          this.writeUnsignedInt(data.data, size);
        } else if (typeof data.data === "string") {
          this.writeEBMLVarInt(data.data.length);
          this.writeString(data.data);
        } else if (data.data instanceof Uint8Array) {
          this.writeEBMLVarInt(data.data.byteLength, data.size);
          this.write(data.data);
        } else if (data.data instanceof EBMLFloat32) {
          this.writeEBMLVarInt(4);
          this.writeFloat32(data.data.value);
        } else if (data.data instanceof EBMLFloat64) {
          this.writeEBMLVarInt(8);
          this.writeFloat64(data.data.value);
        }
      }
    }
  }

  class ArrayBufferTargetWriter extends Writer {
    constructor(target) {
      super();
      this.target = target;
      this.buffer = new ArrayBuffer(2 ** 16);
      this.bytes = new Uint8Array(this.buffer);
    }

    write(data) {
      this.ensureSize(this.pos + data.byteLength);
      this.bytes.set(data, this.pos);
      this.pos += data.byteLength;
    }

    finalize() {
      this.ensureSize(this.pos);
      this.target.buffer = this.buffer.slice(0, this.pos);
    }

    ensureSize(size) {
      let newLength = this.buffer.byteLength;
      while (newLength < size) newLength *= 2;
      if (newLength === this.buffer.byteLength) return;
      let newBuffer = new ArrayBuffer(newLength);
      let newBytes = new Uint8Array(newBuffer);
      newBytes.set(this.bytes, 0);
      this.buffer = newBuffer;
      this.bytes = newBytes;
    }
  }

  class BaseStreamTargetWriter extends Writer {
    constructor(target) {
      super();
      this.target = target;
      this.trackingWrites = false;
      this.trackedWrites = undefined;
      this.trackedStart = undefined;
      this.trackedEnd = undefined;
    }

    write(data) {
      if (!this.trackingWrites) return;
      let pos = this.pos;
      if (pos < this.trackedStart) {
        if (pos + data.byteLength <= this.trackedStart) return;
        data = data.subarray(this.trackedStart - pos);
        pos = 0;
      }
      let neededSize = pos + data.byteLength - this.trackedStart;
      let newLength = this.trackedWrites.byteLength;
      while (newLength < neededSize) newLength *= 2;
      if (newLength !== this.trackedWrites.byteLength) {
        let copy = new Uint8Array(newLength);
        copy.set(this.trackedWrites, 0);
        this.trackedWrites = copy;
      }
      this.trackedWrites.set(data, pos - this.trackedStart);
      this.trackedEnd = Math.max(this.trackedEnd, pos + data.byteLength);
    }

    startTrackingWrites() {
      this.trackingWrites = true;
      this.trackedWrites = new Uint8Array(2 ** 10);
      this.trackedStart = this.pos;
      this.trackedEnd = this.pos;
    }

    getTrackedWrites() {
      if (!this.trackingWrites) {
        throw new Error("Can't get tracked writes since nothing was tracked.");
      }
      let slice = this.trackedWrites.subarray(
        0,
        this.trackedEnd - this.trackedStart
      );
      let result = {
        data: slice,
        start: this.trackedStart,
        end: this.trackedEnd,
      };
      this.trackedWrites = undefined;
      this.trackingWrites = false;
      return result;
    }
  }

  class StreamTargetWriter extends BaseStreamTargetWriter {
    constructor(target, ensureMonotonicity) {
      super(target);
      this.sections = [];
      this.lastFlushEnd = 0;
      this.ensureMonotonicity = ensureMonotonicity;
    }

    write(data) {
      super.write(data);
      this.sections.push({
        data: data.slice(),
        start: this.pos,
      });
      this.pos += data.byteLength;
    }

    flush() {
      if (this.sections.length === 0) return;
      let chunks = [];
      let sorted = [...this.sections].sort((a, b) => a.start - b.start);
      chunks.push({
        start: sorted[0].start,
        size: sorted[0].data.byteLength,
      });
      for (let i = 1; i < sorted.length; i++) {
        let lastChunk = chunks[chunks.length - 1];
        let section = sorted[i];
        if (section.start <= lastChunk.start + lastChunk.size) {
          lastChunk.size = Math.max(
            lastChunk.size,
            section.start + section.data.byteLength - lastChunk.start
          );
        } else {
          chunks.push({
            start: section.start,
            size: section.data.byteLength,
          });
        }
      }
      for (let chunk of chunks) {
        chunk.data = new Uint8Array(chunk.size);
        for (let section of this.sections) {
          if (
            chunk.start <= section.start &&
            section.start < chunk.start + chunk.size
          ) {
            chunk.data.set(section.data, section.start - chunk.start);
          }
        }
        if (this.ensureMonotonicity && chunk.start < this.lastFlushEnd) {
          throw new Error("Internal error: Monotonicity violation.");
        }
        this.target.options.onData?.(chunk.data, chunk.start);
        this.lastFlushEnd = chunk.start + chunk.data.byteLength;
      }
      this.sections.length = 0;
    }

    finalize() {}
  }

  const DEFAULT_CHUNK_SIZE = 2 ** 24;
  const MAX_CHUNKS_AT_ONCE = 2;

  class ChunkedStreamTargetWriter extends BaseStreamTargetWriter {
    constructor(target, ensureMonotonicity) {
      super(target);
      this.chunkSize = target.options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
      this.chunks = [];
      this.lastFlushEnd = 0;
      this.ensureMonotonicity = ensureMonotonicity;
      if (!Number.isInteger(this.chunkSize) || this.chunkSize < 2 ** 10) {
        throw new Error(
          "chunkSize must be an integer not smaller than 1024."
        );
      }
    }

    write(data) {
      super.write(data);
      this.writeDataIntoChunks(data, this.pos);
      this.flushChunks();
      this.pos += data.byteLength;
    }

    finalize() {
      this.flushChunks(true);
    }

    writeDataIntoChunks(data, position) {
      let chunkIndex = this.chunks.findIndex(
        (x) => x.start <= position && position < x.start + this.chunkSize
      );
      if (chunkIndex === -1) chunkIndex = this.createChunk(position);
      let chunk = this.chunks[chunkIndex];
      let relativePosition = position - chunk.start;
      let toWrite = data.subarray(
        0,
        Math.min(this.chunkSize - relativePosition, data.byteLength)
      );
      chunk.data.set(toWrite, relativePosition);
      let section = {
        start: relativePosition,
        end: relativePosition + toWrite.byteLength,
      };
      this.insertSectionIntoChunk(chunk, section);
      if (
        chunk.written[0].start === 0 &&
        chunk.written[0].end === this.chunkSize
      ) {
        chunk.shouldFlush = true;
      }
      if (this.chunks.length > MAX_CHUNKS_AT_ONCE) {
        for (let i = 0; i < this.chunks.length - 1; i++) {
          this.chunks[i].shouldFlush = true;
        }
        this.flushChunks();
      }
      if (toWrite.byteLength < data.byteLength) {
        this.writeDataIntoChunks(
          data.subarray(toWrite.byteLength),
          position + toWrite.byteLength
        );
      }
    }

    insertSectionIntoChunk(chunk, section) {
      let low = 0;
      let high = chunk.written.length - 1;
      let index = -1;
      while (low <= high) {
        let mid = Math.floor(low + (high - low + 1) / 2);
        if (chunk.written[mid].start <= section.start) {
          low = mid + 1;
          index = mid;
        } else {
          high = mid - 1;
        }
      }
      chunk.written.splice(index + 1, 0, section);
      if (index === -1 || chunk.written[index].end < section.start) index++;
      while (
        index < chunk.written.length - 1 &&
        chunk.written[index].end >= chunk.written[index + 1].start
      ) {
        chunk.written[index].end = Math.max(
          chunk.written[index].end,
          chunk.written[index + 1].end
        );
        chunk.written.splice(index + 1, 1);
      }
    }

    createChunk(includesPosition) {
      let start = Math.floor(includesPosition / this.chunkSize) * this.chunkSize;
      let chunk = {
        start,
        data: new Uint8Array(this.chunkSize),
        written: [],
        shouldFlush: false,
      };
      this.chunks.push(chunk);
      this.chunks.sort((a, b) => a.start - b.start);
      return this.chunks.indexOf(chunk);
    }

    flushChunks(force = false) {
      for (let i = 0; i < this.chunks.length; i++) {
        let chunk = this.chunks[i];
        if (!chunk.shouldFlush && !force) continue;
        for (let section of chunk.written) {
          if (
            this.ensureMonotonicity &&
            chunk.start + section.start < this.lastFlushEnd
          ) {
            throw new Error("Internal error: Monotonicity violation.");
          }
          this.target.options.onData?.(
            chunk.data.subarray(section.start, section.end),
            chunk.start + section.start
          );
          this.lastFlushEnd = chunk.start + section.end;
        }
        this.chunks.splice(i--, 1);
      }
    }
  }

  class FileSystemWritableFileStreamTargetWriter extends ChunkedStreamTargetWriter {
    constructor(target, ensureMonotonicity) {
      super(
        new StreamTarget({
          onData: (data, position) =>
            target.stream.write({ type: "write", data, position }),
          chunked: true,
          chunkSize: target.options?.chunkSize,
        }),
        ensureMonotonicity
      );
    }
  }

  // Muxer Class
  const VIDEO_TRACK_NUMBER = 1;
  const AUDIO_TRACK_NUMBER = 2;
  const SUBTITLE_TRACK_NUMBER = 3;
  const VIDEO_TRACK_TYPE = 1;
  const AUDIO_TRACK_TYPE = 2;
  const SUBTITLE_TRACK_TYPE = 17;
  const MAX_CHUNK_LENGTH_MS = 2 ** 15;
  const CODEC_PRIVATE_MAX_SIZE = 2 ** 12;
  const APP_NAME = "awtsmoos.com";
  const SEGMENT_SIZE_BYTES = 6;
  const CLUSTER_SIZE_BYTES = 5;
  const FIRST_TIMESTAMP_BEHAVIORS = ["strict", "offset", "permissive"];

  class Muxer {
    constructor(options) {
      this.options = { type: "webm", firstTimestampBehavior: "strict", ...options };
      this.target = options.target;
      this.writer = null;
      this.segment = null;
      this.segmentInfo = null;
      this.seekHead = null;
      this.tracksElement = null;
      this.segmentDuration = null;
      this.colourElement = null;
      this.videoCodecPrivate = null;
      this.audioCodecPrivate = null;
      this.subtitleCodecPrivate = null;
      this.cues = null;
      this.currentCluster = null;
      this.currentClusterTimestamp = null;
      this.duration = 0;
      this.videoChunkQueue = [];
      this.audioChunkQueue = [];
      this.subtitleChunkQueue = [];
      this.firstVideoTimestamp = undefined;
      this.firstAudioTimestamp = undefined;
      this.lastVideoTimestamp = -1;
      this.lastAudioTimestamp = -1;
      this.lastSubtitleTimestamp = -1;
      this.colorSpace = undefined;
      this.finalized = false;

      this.validateOptions(options);
      let ensureMonotonicity = !!this.options.streaming;
      if (this.target instanceof ArrayBufferTarget) {
        this.writer = new ArrayBufferTargetWriter(this.target);
      } else if (this.target instanceof StreamTarget) {
        this.writer = this.target.options?.chunked
          ? new ChunkedStreamTargetWriter(this.target, ensureMonotonicity)
          : new StreamTargetWriter(this.target, ensureMonotonicity);
      } else if (this.target instanceof FileSystemWritableFileStreamTarget) {
        this.writer = new FileSystemWritableFileStreamTargetWriter(
          this.target,
          ensureMonotonicity
        );
      } else {
        throw new Error(`Invalid target: ${this.target}`);
      }
      this.createFileHeader();
    }

    validateOptions(options) {
      if (typeof options !== "object") {
        throw new TypeError("Options object required.");
      }
      if (!(options.target instanceof Target)) {
        throw new TypeError("Target must be an instance of Target.");
      }
      if (options.video) {
        if (typeof options.video.codec !== "string") {
          throw new TypeError(`Invalid video codec: ${options.video.codec}.`);
        }
        if (!Number.isInteger(options.video.width) || options.video.width <= 0) {
          throw new TypeError(`Invalid video width: ${options.video.width}.`);
        }
        if (!Number.isInteger(options.video.height) || options.video.height <= 0) {
          throw new TypeError(`Invalid video height: ${options.video.height}.`);
        }
        if (
          options.video.frameRate !== undefined &&
          (!Number.isFinite(options.video.frameRate) || options.video.frameRate <= 0)
        ) {
          throw new TypeError(`Invalid frame rate: ${options.video.frameRate}.`);
        }
        if (
          options.video.alpha !== undefined &&
          typeof options.video.alpha !== "boolean"
        ) {
          throw new TypeError(`Invalid alpha: ${options.video.alpha}.`);
        }
      }
      if (options.audio) {
        if (typeof options.audio.codec !== "string") {
          throw new TypeError(`Invalid audio codec: ${options.audio.codec}.`);
        }
        if (
          !Number.isInteger(options.audio.numberOfChannels) ||
          options.audio.numberOfChannels <= 0
        ) {
          throw new TypeError(
            `Invalid channels: ${options.audio.numberOfChannels}.`
          );
        }
        if (
          !Number.isInteger(options.audio.sampleRate) ||
          options.audio.sampleRate <= 0
        ) {
          throw new TypeError(
            `Invalid sample rate: ${options.audio.sampleRate}.`
          );
        }
        if (
          options.audio.bitDepth !== undefined &&
          (!Number.isInteger(options.audio.bitDepth) || options.audio.bitDepth <= 0)
        ) {
          throw new TypeError(`Invalid bit depth: ${options.audio.bitDepth}.`);
        }
      }
      if (options.subtitles) {
        if (typeof options.subtitles.codec !== "string") {
          throw new TypeError(`Invalid subtitles codec: ${options.subtitles.codec}.`);
        }
      }
      if (
        options.type !== undefined &&
        !["webm", "matroska"].includes(options.type)
      ) {
        throw new TypeError(`Invalid type: ${options.type}.`);
      }
      if (
        options.firstTimestampBehavior &&
        !FIRST_TIMESTAMP_BEHAVIORS.includes(options.firstTimestampBehavior)
      ) {
        throw new TypeError(
          `Invalid firstTimestampBehavior: ${options.firstTimestampBehavior}`
        );
      }
      if (
        options.streaming !== undefined &&
        typeof options.streaming !== "boolean"
      ) {
        throw new TypeError(`Invalid streaming: ${options.streaming}.`);
      }
    }

    createFileHeader() {
      if (
        this.writer instanceof BaseStreamTargetWriter &&
        this.writer.target.options.onHeader
      ) {
        this.writer.startTrackingWrites();
      }
      this.writeEBMLHeader();
      if (!this.options.streaming) {
        this.createSeekHead();
      }
      this.createSegmentInfo();
      this.createCodecPrivatePlaceholders();
      this.createColourElement();
      if (!this.options.streaming) {
        this.createTracks();
        this.createSegment();
      }
      this.createCues();
      this.maybeFlushStreamingTargetWriter();
    }

    writeEBMLHeader() {
      let ebmlHeader = {
        id: 440786851,
        data: [
          { id: 17030, data: 1 },
          { id: 17143, data: 1 },
          { id: 17138, data: 4 },
          { id: 17139, data: 8 },
          { id: 17026, data: this.options.type || "webm" },
          { id: 17031, data: 2 },
          { id: 17029, data: 2 },
        ],
      };
      this.writer.writeEBML(ebmlHeader);
    }

    createCodecPrivatePlaceholders() {
      this.videoCodecPrivate = {
        id: 236,
        size: 4,
        data: new Uint8Array(CODEC_PRIVATE_MAX_SIZE),
      };
      this.audioCodecPrivate = {
        id: 236,
        size: 4,
        data: new Uint8Array(CODEC_PRIVATE_MAX_SIZE),
      };
      this.subtitleCodecPrivate = {
        id: 236,
        size: 4,
        data: new Uint8Array(CODEC_PRIVATE_MAX_SIZE),
      };
    }

    createColourElement() {
      this.colourElement = {
        id: 21936,
        data: [
          { id: 21937, data: 2 },
          { id: 21946, data: 2 },
          { id: 21947, data: 2 },
          { id: 21945, data: 0 },
        ],
      };
    }

    createSeekHead() {
      const kaxCues = new Uint8Array([28, 83, 187, 107]);
      const kaxInfo = new Uint8Array([21, 73, 169, 102]);
      const kaxTracks = new Uint8Array([22, 84, 174, 107]);
      this.seekHead = {
        id: 290298740,
        data: [
          {
            id: 19899,
            data: [
              { id: 21419, data: kaxCues },
              { id: 21420, size: 5, data: 0 },
            ],
          },
          {
            id: 19899,
            data: [
              { id: 21419, data: kaxInfo },
              { id: 21420, size: 5, data: 0 },
            ],
          },
          {
            id: 19899,
            data: [
              { id: 21419, data: kaxTracks },
              { id: 21420, size: 5, data: 0 },
            ],
          },
        ],
      };
    }

    createSegmentInfo() {
      this.segmentDuration = { id: 17545, data: new EBMLFloat64(0) };
      this.segmentInfo = {
        id: 357149030,
        data: [
          { id: 2807729, data: 1e6 },
          { id: 19840, data: APP_NAME },
          { id: 22337, data: APP_NAME },
          !this.options.streaming ? this.segmentDuration : null,
        ],
      };
    }

    createTracks() {
      this.tracksElement = { id: 374648427, data: [] };
      if (this.options.video) {
        this.tracksElement.data.push({
          id: 174,
          data: [
            { id: 215, data: VIDEO_TRACK_NUMBER },
            { id: 29637, data: VIDEO_TRACK_NUMBER },
            { id: 131, data: VIDEO_TRACK_TYPE },
            { id: 134, data: this.options.video.codec },
            this.videoCodecPrivate,
            this.options.video.frameRate
              ? { id: 2352003, data: 1e9 / this.options.video.frameRate }
              : null,
            {
              id: 224,
              data: [
                { id: 176, data: this.options.video.width },
                { id: 186, data: this.options.video.height },
                this.options.video.alpha ? { id: 21440, data: 1 } : null,
                this.colourElement,
              ],
            },
          ],
        });
      }
      if (this.options.audio) {
        this.audioCodecPrivate = this.options.streaming
          ? this.audioCodecPrivate || null
          : { id: 236, size: 4, data: new Uint8Array(CODEC_PRIVATE_MAX_SIZE) };
        this.tracksElement.data.push({
          id: 174,
          data: [
            { id: 215, data: AUDIO_TRACK_NUMBER },
            { id: 29637, data: AUDIO_TRACK_NUMBER },
            { id: 131, data: AUDIO_TRACK_TYPE },
            { id: 134, data: this.options.audio.codec },
            this.audioCodecPrivate,
            {
              id: 225,
              data: [
                {
                  id: 181,
                  data: new EBMLFloat32(this.options.audio.sampleRate),
                },
                { id: 159, data: this.options.audio.numberOfChannels },
                this.options.audio.bitDepth
                  ? { id: 25188, data: this.options.audio.bitDepth }
                  : null,
              ],
            },
          ],
        });
      }
      if (this.options.subtitles) {
        this.tracksElement.data.push({
          id: 174,
          data: [
            { id: 215, data: SUBTITLE_TRACK_NUMBER },
            { id: 29637, data: SUBTITLE_TRACK_NUMBER },
            { id: 131, data: SUBTITLE_TRACK_TYPE },
            { id: 134, data: this.options.subtitles.codec },
            this.subtitleCodecPrivate,
          ],
        });
      }
    }

    createSegment() {
      this.segment = {
        id: 408125543,
        size: this.options.streaming ? -1 : SEGMENT_SIZE_BYTES,
        data: [
          !this.options.streaming ? this.seekHead : null,
          this.segmentInfo,
          this.tracksElement,
        ],
      };
      this.writer.writeEBML(this.segment);
      if (
        this.writer instanceof BaseStreamTargetWriter &&
        this.writer.target.options.onHeader
      ) {
        let { data, start } = this.writer.getTrackedWrites();
        this.writer.target.options.onHeader(data, start);
      }
    }

    createCues() {
      this.cues = { id: 475249515, data: [] };
    }

    maybeFlushStreamingTargetWriter() {
      if (this.writer instanceof StreamTargetWriter) {
        this.writer.flush();
      }
    }

    segmentDataOffset() {
      return this.writer.dataOffsets.get(this.segment);
    }

    writeVideoDecoderConfig(meta) {
      if (!meta.decoderConfig) return;
      if (meta.decoderConfig.colorSpace) {
        let colorSpace = meta.decoderConfig.colorSpace;
        this.colorSpace = colorSpace;
        this.colourElement.data = [
          {
            id: 21937,
            data: { rgb: 1, bt709: 1, bt470bg: 5, smpte170m: 6 }[
              colorSpace.matrix
            ],
          },
          {
            id: 21946,
            data: { bt709: 1, smpte170m: 6, "iec61966-2-1": 13 }[
              colorSpace.transfer
            ],
          },
          {
            id: 21947,
            data: { bt709: 1, bt470bg: 5, smpte170m: 6 }[colorSpace.primaries],
          },
          { id: 21945, data: [1, 2][Number(colorSpace.fullRange)] },
        ];
        if (!this.options.streaming) {
          let endPos = this.writer.pos;
          this.writer.seek(this.writer.offsets.get(this.colourElement));
          this.writer.writeEBML(this.colourElement);
          this.writer.seek(endPos);
        }
      }
      if (meta.decoderConfig.description) {
        if (this.options.streaming) {
          this.videoCodecPrivate = this.createCodecPrivateElement(
            meta.decoderConfig.description
          );
        } else {
          this.writeCodecPrivate(
            this.videoCodecPrivate,
            meta.decoderConfig.description
          );
        }
      }
    }

    fixVP9ColorSpace(chunk) {
      if (chunk.type !== "key" || !this.colorSpace) return;
      let i = 0;
      if (readBits(chunk.data, 0, 2) !== 2) return;
      i += 2;
      let profile = (readBits(chunk.data, i + 1, i + 2) << 1) + readBits(chunk.data, i, i + 1);
      i += 2;
      if (profile === 3) i++;
      if (readBits(chunk.data, i, i + 1)) return; // showExistingFrame
      i++;
      if (readBits(chunk.data, i, i + 1) !== 0) return; // frameType
      i += 2;
      if (readBits(chunk.data, i, i + 24) !== 4817730) return; // syncCode
      i += 24;
      if (profile >= 2) i++;
      let colorSpaceID = {
        rgb: 7,
        bt709: 2,
        bt470bg: 1,
        smpte170m: 3,
      }[this.colorSpace.matrix];
      writeBits(chunk.data, i, i + 3, colorSpaceID);
    }

    addVideoChunk(chunk, meta, timestamp) {
      if (!(chunk instanceof EncodedVideoChunk)) {
        throw new TypeError("chunk must be an EncodedVideoChunk.");
      }
      if (meta && typeof meta !== "object") {
        throw new TypeError("meta must be an object.");
      }
      if (
        timestamp !== undefined &&
        (!Number.isFinite(timestamp) || timestamp < 0)
      ) {
        throw new TypeError("timestamp must be a non-negative number.");
      }
      let data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      this.addVideoChunkRaw(data, chunk.type, timestamp ?? chunk.timestamp, meta);
    }

    addVideoChunkRaw(data, type, timestamp, meta) {
      if (!(data instanceof Uint8Array)) {
        throw new TypeError("data must be a Uint8Array.");
      }
      if (type !== "key" && type !== "delta") {
        throw new TypeError("type must be 'key' or 'delta'.");
      }
      if (!Number.isFinite(timestamp) || timestamp < 0) {
        throw new TypeError("timestamp must be a non-negative number.");
      }
      if (meta && typeof meta !== "object") {
        throw new TypeError("meta must be an object.");
      }
      this.ensureNotFinalized();
      if (!this.options.video) throw new Error("No video track declared.");
      if (this.firstVideoTimestamp === undefined)
        this.firstVideoTimestamp = timestamp;
      if (meta) this.writeVideoDecoderConfig(meta);
      let videoChunk = this.createInternalChunk(
        data,
        type,
        timestamp,
        VIDEO_TRACK_NUMBER
      );
      if (this.options.video.codec === "V_VP9") this.fixVP9ColorSpace(videoChunk);
      this.lastVideoTimestamp = videoChunk.timestamp;
      while (
        this.audioChunkQueue.length > 0 &&
        this.audioChunkQueue[0].timestamp <= videoChunk.timestamp
      ) {
        let audioChunk = this.audioChunkQueue.shift();
        this.writeBlock(audioChunk, false);
      }
      if (
        !this.options.audio ||
        videoChunk.timestamp <= this.lastAudioTimestamp
      ) {
        this.writeBlock(videoChunk, true);
      } else {
        this.videoChunkQueue.push(videoChunk);
      }
      this.writeSubtitleChunks();
      this.maybeFlushStreamingTargetWriter();
    }

    addAudioChunk(chunk, meta, timestamp) {
      if (!(chunk instanceof EncodedAudioChunk)) {
        throw new TypeError("chunk must be an EncodedAudioChunk.");
      }
      if (meta && typeof meta !== "object") {
        throw new TypeError("meta must be an object.");
      }
      if (
        timestamp !== undefined &&
        (!Number.isFinite(timestamp) || timestamp < 0)
      ) {
        throw new TypeError("timestamp must be a non-negative number.");
      }
      let data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      this.addAudioChunkRaw(data, chunk.type, timestamp ?? chunk.timestamp, meta);
    }

    addAudioChunkRaw(data, type, timestamp, meta) {
      if (!(data instanceof Uint8Array)) {
        throw new TypeError("data must be a Uint8Array.");
      }
      if (type !== "key" && type !== "delta") {
        throw new TypeError("type must be 'key' or 'delta'.");
      }
      if (!Number.isFinite(timestamp) || timestamp < 0) {
        throw new TypeError("timestamp must be a non-negative number.");
      }
      if (meta && typeof meta !== "object") {
        throw new TypeError("meta must be an object.");
      }
      this.ensureNotFinalized();
      if (!this.options.audio) throw new Error("No audio track declared.");
      if (this.firstAudioTimestamp === undefined)
        this.firstAudioTimestamp = timestamp;
      if (meta?.decoderConfig) {
        if (this.options.streaming) {
          this.audioCodecPrivate = this.createCodecPrivateElement(
            meta.decoderConfig.description
          );
        } else {
          this.writeCodecPrivate(
            this.audioCodecPrivate,
            meta.decoderConfig.description
          );
        }
      }
      let audioChunk = this.createInternalChunk(
        data,
        type,
        timestamp,
        AUDIO_TRACK_NUMBER
      );
      this.lastAudioTimestamp = audioChunk.timestamp;
      while (
        this.videoChunkQueue.length > 0 &&
        this.videoChunkQueue[0].timestamp <= audioChunk.timestamp
      ) {
        let videoChunk = this.videoChunkQueue.shift();
        this.writeBlock(videoChunk, true);
      }
      if (
        !this.options.video ||
        audioChunk.timestamp <= this.lastVideoTimestamp
      ) {
        this.writeBlock(audioChunk, !this.options.video);
      } else {
        this.audioChunkQueue.push(audioChunk);
      }
      this.writeSubtitleChunks();
      this.maybeFlushStreamingTargetWriter();
    }

    addSubtitleChunk(chunk, meta, timestamp) {
      if (typeof chunk !== "object" || !chunk) {
        throw new TypeError("chunk must be an object.");
      }
      if (!(chunk.body instanceof Uint8Array)) {
        throw new TypeError("body must be a Uint8Array.");
      }
      if (!Number.isFinite(chunk.timestamp) || chunk.timestamp < 0) {
        throw new TypeError("timestamp must be a non-negative number.");
      }
      if (!Number.isFinite(chunk.duration) || chunk.duration < 0) {
        throw new TypeError("duration must be a non-negative number.");
      }
      if (chunk.additions && !(chunk.additions instanceof Uint8Array)) {
        throw new TypeError("additions must be a Uint8Array.");
      }
      if (typeof meta !== "object") {
        throw new TypeError("meta must be an object.");
      }
      this.ensureNotFinalized();
      if (!this.options.subtitles) throw new Error("No subtitle track declared.");
      if (meta?.decoderConfig) {
        if (this.options.streaming) {
          this.subtitleCodecPrivate = this.createCodecPrivateElement(
            meta.decoderConfig.description
          );
        } else {
          this.writeCodecPrivate(
            this.subtitleCodecPrivate,
            meta.decoderConfig.description
          );
        }
      }
      let subtitleChunk = this.createInternalChunk(
        chunk.body,
        "key",
        timestamp ?? chunk.timestamp,
        SUBTITLE_TRACK_NUMBER,
        chunk.duration,
        chunk.additions
      );
      this.lastSubtitleTimestamp = subtitleChunk.timestamp;
      this.subtitleChunkQueue.push(subtitleChunk);
      this.writeSubtitleChunks();
      this.maybeFlushStreamingTargetWriter();
    }

    writeSubtitleChunks() {
      let lastWrittenMediaTimestamp = Math.min(
        this.options.video ? this.lastVideoTimestamp : Infinity,
        this.options.audio ? this.lastAudioTimestamp : Infinity
      );
      let queue = this.subtitleChunkQueue;
      while (
        queue.length > 0 &&
        queue[0].timestamp <= lastWrittenMediaTimestamp
      ) {
        this.writeBlock(queue.shift(), !this.options.video && !this.options.audio);
      }
    }

    createInternalChunk(data, type, timestamp, trackNumber, duration, additions) {
      let adjustedTimestamp = this.validateTimestamp(timestamp, trackNumber);
      return {
        data,
        additions,
        type,
        timestamp: adjustedTimestamp,
        duration,
        trackNumber,
      };
    }

    validateTimestamp(timestamp, trackNumber) {
      let lastTimestamp =
        trackNumber === VIDEO_TRACK_NUMBER
          ? this.lastVideoTimestamp
          : trackNumber === AUDIO_TRACK_NUMBER
          ? this.lastAudioTimestamp
          : this.lastSubtitleTimestamp;
      if (trackNumber !== SUBTITLE_TRACK_NUMBER) {
        let firstTimestamp =
          trackNumber === VIDEO_TRACK_NUMBER
            ? this.firstVideoTimestamp
            : this.firstAudioTimestamp;
        if (
          this.options.firstTimestampBehavior === "strict" &&
          lastTimestamp === -1 &&
          timestamp !== 0
        ) {
          throw new Error(
            `First chunk must have timestamp 0 (received ${timestamp}).`
          );
        } else if (this.options.firstTimestampBehavior === "offset") {
          timestamp -= firstTimestamp;
        }
      }
      if (timestamp < lastTimestamp) {
        throw new Error(
          `Timestamps must increase (went from ${lastTimestamp} to ${timestamp}).`
        );
      }
      if (timestamp < 0) {
        throw new Error(`Timestamps must be non-negative (received ${timestamp}).`);
      }
      return timestamp;
    }

    writeBlock(chunk, canCreateNewCluster) {
      if (this.options.streaming && !this.tracksElement) {
        this.createTracks();
        this.createSegment();
      }
      let msTimestamp = Math.floor(chunk.timestamp / 1e3);
      let shouldCreateNewClusterFromKeyFrame =
        canCreateNewCluster &&
        chunk.type === "key" &&
        msTimestamp - this.currentClusterTimestamp >= 1e3;
      if (!this.currentCluster || shouldCreateNewClusterFromKeyFrame) {
        this.createNewCluster(msTimestamp);
      }
      let relativeTimestamp = msTimestamp - this.currentClusterTimestamp;
      if (relativeTimestamp < 0) return;
      if (relativeTimestamp >= MAX_CHUNK_LENGTH_MS) {
        throw new Error(
          `Cluster too long, max ${MAX_CHUNK_LENGTH_MS}ms; need key frame.`
        );
      }
      let prelude = new Uint8Array(4);
      let view = new DataView(prelude.buffer);
      view.setUint8(0, 128 | chunk.trackNumber);
      view.setInt16(1, relativeTimestamp, false);
      if (chunk.duration === undefined && !chunk.additions) {
        view.setUint8(3, Number(chunk.type === "key") << 7);
        let simpleBlock = { id: 163, data: [prelude, chunk.data] };
        this.writer.writeEBML(simpleBlock);
      } else {
        let msDuration = Math.floor(chunk.duration / 1e3);
        let blockGroup = {
          id: 160,
          data: [
            { id: 161, data: [prelude, chunk.data] },
            chunk.duration !== undefined
              ? { id: 155, data: msDuration }
              : null,
            chunk.additions ? { id: 30113, data: chunk.additions } : null,
          ],
        };
        this.writer.writeEBML(blockGroup);
      }
      this.duration = Math.max(this.duration, msTimestamp);
    }

    createCodecPrivateElement(data) {
      return { id: 25506, size: 4, data: new Uint8Array(data) };
    }

    writeCodecPrivate(element, data) {
      let endPos = this.writer.pos;
      this.writer.seek(this.writer.offsets.get(element));
      let codecPrivateElementSize = 2 + 4 + data.byteLength;
      let voidDataSize = CODEC_PRIVATE_MAX_SIZE - codecPrivateElementSize;
      if (voidDataSize < 0) {
        let newByteLength = data.byteLength + voidDataSize;
        data = data instanceof ArrayBuffer
          ? data.slice(0, newByteLength)
          : data.buffer.slice(0, newByteLength);
        voidDataSize = 0;
      }
      element = [
        this.createCodecPrivateElement(data),
        { id: 236, size: 4, data: new Uint8Array(voidDataSize) },
      ];
      this.writer.writeEBML(element);
      this.writer.seek(endPos);
    }

    createNewCluster(timestamp) {
      if (this.currentCluster && !this.options.streaming) {
        this.finalizeCurrentCluster();
      }
      if (
        this.writer instanceof BaseStreamTargetWriter &&
        this.writer.target.options.onCluster
      ) {
        this.writer.startTrackingWrites();
      }
      this.currentCluster = {
        id: 524531317,
        size: this.options.streaming ? -1 : CLUSTER_SIZE_BYTES,
        data: [{ id: 231, data: timestamp }],
      };
      this.writer.writeEBML(this.currentCluster);
      this.currentClusterTimestamp = timestamp;
      let clusterOffsetFromSegment =
        this.writer.offsets.get(this.currentCluster) - this.segmentDataOffset();
      this.cues.data.push({
        id: 187,
        data: [
          { id: 179, data: timestamp },
          this.options.video
            ? {
                id: 183,
                data: [
                  { id: 247, data: VIDEO_TRACK_NUMBER },
                  { id: 241, data: clusterOffsetFromSegment },
                ],
              }
            : null,
          this.options.audio
            ? {
                id: 183,
                data: [
                  { id: 247, data: AUDIO_TRACK_NUMBER },
                  { id: 241, data: clusterOffsetFromSegment },
                ],
              }
            : null,
        ],
      });
    }

    finalizeCurrentCluster() {
      let clusterSize =
        this.writer.pos - this.writer.dataOffsets.get(this.currentCluster);
      let endPos = this.writer.pos;
      this.writer.seek(this.writer.offsets.get(this.currentCluster) + 4);
      this.writer.writeEBMLVarInt(clusterSize, CLUSTER_SIZE_BYTES);
      this.writer.seek(endPos);
      if (
        this.writer instanceof BaseStreamTargetWriter &&
        this.writer.target.options.onCluster
      ) {
        let { data, start } = this.writer.getTrackedWrites();
        this.writer.target.options.onCluster(
          data,
          start,
          this.currentClusterTimestamp
        );
      }
    }

    ensureNotFinalized() {
      if (this.finalized) {
        throw new Error("Cannot add chunks after finalization.");
      }
    }

    finalize() {
      if (this.finalized) {
        throw new Error("Cannot finalize more than once.");
      }
      while (this.videoChunkQueue.length > 0) {
        this.writeBlock(this.videoChunkQueue.shift(), true);
      }
      while (this.audioChunkQueue.length > 0) {
        this.writeBlock(this.audioChunkQueue.shift(), true);
      }
      while (
        this.subtitleChunkQueue.length > 0 &&
        this.subtitleChunkQueue[0].timestamp <= this.duration
      ) {
        this.writeBlock(this.subtitleChunkQueue.shift(), false);
      }
      if (this.currentCluster && !this.options.streaming) {
        this.finalizeCurrentCluster();
      }
      this.writer.writeEBML(this.cues);
      if (!this.options.streaming) {
        let endPos = this.writer.pos;
        let segmentSize = this.writer.pos - this.segmentDataOffset();
        this.writer.seek(this.writer.offsets.get(this.segment) + 4);
        this.writer.writeEBMLVarInt(segmentSize, SEGMENT_SIZE_BYTES);
        this.segmentDuration.data = new EBMLFloat64(this.duration);
        this.writer.seek(this.writer.offsets.get(this.segmentDuration));
        this.writer.writeEBML(this.segmentDuration);
        this.seekHead.data[0].data[1].data =
          this.writer.offsets.get(this.cues) - this.segmentDataOffset();
        this.seekHead.data[1].data[1].data =
          this.writer.offsets.get(this.segmentInfo) - this.segmentDataOffset();
        this.seekHead.data[2].data[1].data =
          this.writer.offsets.get(this.tracksElement) - this.segmentDataOffset();
        this.writer.seek(this.writer.offsets.get(this.seekHead));
        this.writer.writeEBML(this.seekHead);
        this.writer.seek(endPos);
      }
      this.maybeFlushStreamingTargetWriter();
      this.writer.finalize();
      this.finalized = true;
    }
  }

  // Subtitle Encoder
  const cueBlockHeaderRegex = /(?:(.+?)\n)?((?:\d{2}:)?\d{2}:\d{2}.\d{3})\s+-->\s+((?:\d{2}:)?\d{2}:\d{2}.\d{3})/g;
  const preambleStartRegex = /^WEBVTT.*?\n{2}/;
  const timestampRegex = /(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})/;
  const inlineTimestampRegex = /<(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})>/g;
  const textEncoder = new TextEncoder();

  class SubtitleEncoder {
    constructor(options) {
      this.options = options;
      this.config = undefined;
      this.preambleSeen = false;
      this.preambleBytes = undefined;
      this.preambleEmitted = false;
    }

    configure(config) {
      if (config.codec !== "webvtt") {
        throw new Error("Codec must be 'webvtt'.");
      }
      this.config = config;
    }

    encode(text) {
      if (!this.config) throw new Error("Encoder not configured.");
      text = text.replace("\r\n", "\n").replace("\r", "\n");
      cueBlockHeaderRegex.lastIndex = 0;
      let match;
      if (!this.preambleSeen) {
        if (!preambleStartRegex.test(text)) {
          let error = new Error("WebVTT preamble incorrect.");
          this.options.error(error);
          throw error;
        }
        match = cueBlockHeaderRegex.exec(text);
        let preamble = text.slice(0, match?.index ?? text.length).trimEnd();
        if (!preamble) {
          let error = new Error("No WebVTT preamble provided.");
          this.options.error(error);
          throw error;
        }
        this.preambleBytes = textEncoder.encode(preamble);
        this.preambleSeen = true;
        if (match) {
          text = text.slice(match.index);
          cueBlockHeaderRegex.lastIndex = 0;
        }
      }
      while ((match = cueBlockHeaderRegex.exec(text))) {
        let notes = text.slice(0, match.index);
        let cueIdentifier = match[1] || "";
        let matchEnd = match.index + match[0].length;
        let bodyStart = text.indexOf("\n", matchEnd) + 1;
        let cueSettings = text.slice(matchEnd, bodyStart).trim();
        let bodyEnd = text.indexOf("\n\n", matchEnd);
        if (bodyEnd === -1) bodyEnd = text.length;
        let startTime = this.parseTimestamp(match[2]);
        let endTime = this.parseTimestamp(match[3]);
        let duration = endTime - startTime;
        let body = text.slice(bodyStart, bodyEnd);
        let additions = `${cueSettings}\n${cueIdentifier}\n${notes}`;
        inlineTimestampRegex.lastIndex = 0;
        body = body.replace(inlineTimestampRegex, (match2) => {
          let time = this.parseTimestamp(match2.slice(1, -1));
          let offsetTime = time - startTime;
          return `<${this.formatTimestamp(offsetTime)}>`;
        });
        text = text.slice(bodyEnd).trimStart();
        cueBlockHeaderRegex.lastIndex = 0;
        let chunk = {
          body: textEncoder.encode(body),
          additions: additions.trim() === "" ? undefined : textEncoder.encode(additions),
          timestamp: startTime * 1e3,
          duration: duration * 1e3,
        };
        let meta = {};
        if (!this.preambleEmitted) {
          meta.decoderConfig = { description: this.preambleBytes };
          this.preambleEmitted = true;
        }
        this.options.output(chunk, meta);
      }
    }

    parseTimestamp(string) {
      let match = timestampRegex.exec(string);
      if (!match) throw new Error("Expected match.");
      return (
        60 * 60 * 1e3 * Number(match[1] || "0") +
        60 * 1e3 * Number(match[2]) +
        1e3 * Number(match[3]) +
        Number(match[4])
      );
    }

    formatTimestamp(timestamp) {
      let hours = Math.floor(timestamp / (60 * 60 * 1e3));
      let minutes = Math.floor((timestamp % (60 * 60 * 1e3)) / (60 * 1e3));
      let seconds = Math.floor((timestamp % (60 * 1e3)) / 1e3);
      let milliseconds = timestamp % 1e3;
      return (
        hours.toString().padStart(2, "0") +
        ":" +
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0") +
        "." +
        milliseconds.toString().padStart(3, "0")
      );
    }
  }

  // Exports
  return {
    ArrayBufferTarget,
    FileSystemWritableFileStreamTarget,
    Muxer,
    StreamTarget,
    SubtitleEncoder,
  };
});

if (typeof module === "object" && typeof module.exports === "object") {
  Object.assign(module.exports, WebMMuxer);
}