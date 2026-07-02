// B"H
/** @module OyvedMessageInterpreter @description Routes genesis and bh9 playerProbe pulses. */
import { GenesisRoute } from './GenesisRoute.js?';
import { ContinuousRoute } from './ContinuousRoute.js?v=no-alert-perf-jump-20260701-bh9';
const SHATTERED_WARN_GAP_MS = 5000, SHATTERED_SAMPLE_LIMIT = 8;
const shattered = { total:0, lastWarnAt:0, firstAt:0, lastAt:0, lastKeys:[], samples:[] };
function keysOf(data) { return data && typeof data === 'object' ? Object.keys(data).slice(0, 12) : []; }
function publishShatteredDiagnostic(keys) { const now = Date.now(); shattered.total += 1; shattered.firstAt ||= now; shattered.lastAt = now; shattered.lastKeys = keys; shattered.samples.push({ at:now, keys }); shattered.samples = shattered.samples.slice(-SHATTERED_SAMPLE_LIMIT); globalThis.__AWTSMOOS_SUB_VESSEL_DIAG__ = { ...shattered, message:'sub-vessels not ready; command ignored until vessel boot completes' }; if (shattered.total === 1 || now - shattered.lastWarnAt >= SHATTERED_WARN_GAP_MS) { shattered.lastWarnAt = now; console.warn('B"H - Sub-vessels not ready; holding console silence after this diagnostic.', { total:shattered.total, keys }); } }
export class OyvedMessageInterpreter { static async handleMessage(data, isVesselsSound, SystemCore, promiseMap) { if (!data || typeof data !== 'object') return null; if (!isVesselsSound) { publishShatteredDiagnostic(keysOf(data)); return null; } if (data.type === 'pawsawch' || data.pawsawch) return await GenesisRoute.execute(data.payload || data.pawsawch, SystemCore, promiseMap); return 'CONTINUOUS'; } static async handleOngoing(ActiveOlamInstance, data, promiseMap) { await ContinuousRoute.route(ActiveOlamInstance, data, promiseMap); } }
