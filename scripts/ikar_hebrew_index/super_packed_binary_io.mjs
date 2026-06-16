// B"H
/**
 * @file super_packed_binary_io.mjs
 * @chapter The Metadata Stops Speaking JSON And Enters Binary Vessels
 * @description
 * Awtsmoos binary JSON wrappers for packed index dictionaries and metadata.
 * Big posting lists remain custom delta-varint streams; structured dictionaries
 * ride through the same binary serializer family used by AwtsmoosDB vessels.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const awtsmoosBinary = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  return Buffer.from(value || []);
}

function ensureParent(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

export async function writeAwtsmoosJson(file, value) {
  const encoded = await awtsmoosBinary.serializeJSON(value);
  ensureParent(file);
  fs.writeFileSync(file, toBuffer(encoded));
}

export async function writeAwtsmoosArray(file, value) {
  const encoded = await awtsmoosBinary.serializeArray(value);
  ensureParent(file);
  fs.writeFileSync(file, toBuffer(encoded));
}

export async function readAwtsmoos(file) {
  return awtsmoosBinary.deserializeBinary(fs.readFileSync(file));
}

export function writeJsonFallback(file, value) {
  ensureParent(file);
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}
