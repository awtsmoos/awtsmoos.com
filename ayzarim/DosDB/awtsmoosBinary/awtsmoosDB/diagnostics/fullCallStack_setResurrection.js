
// B"H

/**
 * @file diagnostics/fullCallStack_setResurrection.js
 * @chapter The Set Was Stored As A Sequence But Returned As A Mask
 * @description
 * Exact traced failure:
 *
 * test/run_all.js
 * -> test/lightning/runOne.js
 * -> test/lightning/moduleRunner.js
 * -> test/lightning/fastSuites/index.js
 * -> test/lightning/fastSuites/suite.js
 * -> test/lightning/fastSuites/probes/containers.js
 * -> db.root.nativeSet = new Set(["aleph","beis","gimmel"])
 * -> api/liveHandle/writer/map_ops/setter.js
 * -> structure/manifest/complex/builder.js
 * -> structure/manifest/complex/builder/logic/typeTable.js
 * -> detects JS_SET
 * -> structure/manifest/complex/builder/vessel/sequence/index.js
 * -> OLD BUG: it created a Sequence pointer and returned it with SEQUENCE type
 * -> reader later saw SEQUENCE, not JS_SET
 * -> api/liveHandle/reader/index.js _wrapIfNeeded()
 * -> wrapped it as LiveHandle instead of native Set
 * -> ContainerProbe: db.root.nativeSet instanceof Set
 * -> false
 *
 * Root fix:
 * Native Set values are sequence-backed on disk, but their pointer type must
 * stay JS_SET. That type is the soul-name. The bytes are the body. The body can
 * be a sequence, but the soul-name says "return as Set".
 *
 * Pointer format rule:
 * Pointers are varint-only:
 * [type:1 byte][offset:ULEB128][length:ULEB128]
 * No padding. No fallback. No fixed 16-byte garbage. No maybe-missing methods.
 */

module.exports = {
  failingFeature: "native Set resurrection",
  coreCause: "SequenceManifestor returned SEQUENCE type instead of requested JS_SET type",
  fixedBy: [
    "strict varint SmartPointer API",
    "SequenceManifestor preserves requested outer type",
    "reader returns native Set for JS_SET and SET",
    "KeysLogic debug logs removed"
  ]
};
