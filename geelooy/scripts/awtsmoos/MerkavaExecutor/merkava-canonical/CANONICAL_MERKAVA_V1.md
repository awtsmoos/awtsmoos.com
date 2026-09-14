<!--B"H-->
<!--Boruch Hashem-->
<!--Blessed be He-->

# Canonical Merkava v1

The canonical `.merkava` garment is the stable outer application format. Historical codecs such as MD2, MAPP, MWEB, and SANG may continue as compiler/runtime implementation details, but new tooling should exchange one canonical container.

## Header

The fixed 32-byte little-endian header contains `MKV1`, container version, ISA version, host ABI version, flags, section count, total bytes, directory location, payload location, and a zero reserved word.

## Directory

Each 20-byte directory record contains a section type, flags, payload offset, payload length, CRC32 corruption witness, and a zero reserved word. Canonical writers sort section types and reject duplicates. Readers reject truncation, overlap, out-of-range offsets, corrupt CRC witnesses, malformed reserved fields, and duplicate types before exposing payloads.

## Core sections

`MANIFEST`, `STRINGS`, `DOM`, `STYLES`, `FUNCTIONS`, `BYTECODE`, `MODULES`, `ASSETS`, `DEBUG`, `CAPABILITIES`, and `SIGNATURE` are reserved canonical section identities. Application execution requires at least `MANIFEST` and `BYTECODE`.

## Transition

The first implementation wraps the already-working Mode2 executable stream inside canonical `BYTECODE` while declaring `programEncoding: mode2-transition`. This gives builds one stable outer format immediately without falsely claiming that the experimental inner ISA has already been replaced.

## Platform law

The same canonical application must target browser, Windows, macOS, Linux, and Android. Browser intelligence belongs to portable Merkava code. Native hosts expose versioned platform primitives only: windows, input, graphics, fonts, storage, networking, timers, threads, clipboard, audio, and cryptographic randomness.

## Completion gates

A production v1 release requires a canonical ISA compiler/interpreter, exact capability enforcement, WebGL 1/2 conformance, CSS/HTML/DOM compatibility gates, ECMAScript conformance gates, deterministic cross-platform rendering tests, sandboxing, source maps, reproducible builds, and signed packaging for every native target.
