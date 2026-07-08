// B"H
/** @module ContinuousRoute @description Ongoing events use the bh9 router/probe. */
import { ContinuousEventRouter } from '../ContinuousEventRouter.js?compact=true&v=final-proof-20260705-bh1';
export class ContinuousRoute { static async route(ActiveOlamInstance, data, promiseMap) { if (!ActiveOlamInstance) return; const keys = Object.keys(data || {}); for (let i = 0; i < keys.length; i += 1) await ContinuousEventRouter.route(ActiveOlamInstance, keys[i], data[keys[i]], promiseMap); } }
