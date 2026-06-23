/* B"H
ColorPipeline passes pixels through correction and LUT stages while scopes turn
pixels into proof. It stays pure until canvas/WebGL wiring arrives.
*/
import { correctPixel } from '../effects/ColorCorrection.js';
import { buildHistogram } from './Histogram.js';
export function createColorPipeline(input = {}) { return { kind:'ColorPipeline', correction:input.correction || null, lut:input.lut || null, scopes:{} }; }
export function processPixels(pipeline, pixels = []) { const out = pixels.map(pixel => pipeline.lut?.mapPixel?.(pipeline.correction ? correctPixel(pixel, pipeline.correction) : pixel) || (pipeline.correction ? correctPixel(pixel, pipeline.correction) : pixel)); pipeline.scopes.histogram = buildHistogram(out); return out; }
export function updateColorPipeline(pipeline, patch = {}) { return Object.assign(pipeline, patch); }
