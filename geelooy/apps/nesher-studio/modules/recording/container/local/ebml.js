/* B"H
 * EBML sparks: ids, vint sizes, and elements shaped for WebM.
 * Each element is a small chamber where hidden light becomes binary order.
 */
import { concat, float64, u8, uintBE, utf8 } from './bytes.js';

export function element(id, payload) { return concat([u8(...id), vintSize(payload.length), payload]); }
export function master(id, children) { return element(id, concat(children)); }
export function uintElement(id, value, bytes) { return element(id, uintBE(value, bytes)); }
export function stringElement(id, text) { return element(id, utf8(text)); }
export function floatElement(id, value) { return element(id, float64(value)); }
export function unknownSize8() { return u8(0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff); }

export function vintSize(size) {
  if (size < 0x7f) return u8(0x80 | size);
  if (size < 0x3fff) return uintBE(0x4000 | size, 2);
  if (size < 0x1fffff) return uintBE(0x200000 | size, 3);
  if (size < 0x0fffffff) return uintBE(0x10000000 | size, 4);
  if (size < 0x07ffffffff) return uintBE(0x0800000000n | BigInt(size), 5);
  throw new Error(`EBML element too large for local muxer: ${size}`);
}
