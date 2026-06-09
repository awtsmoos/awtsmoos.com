// B"H
/** @file countBucket.js @description Chapter 352: A tiny count for a living ledger. */
export const countBucket = value => Array.isArray(value) ? value.length : value && typeof value === 'object' ? Object.keys(value).length : 0;
