// B"H
import { applyFilter } from './actions/filter.js';
import { sortItems } from './actions/sorters.js';
export function renderPipeline(items = [], state = {}) { return sortItems(applyFilter(items, state.filter), state.sort); }
/** B"H: render order, filter, and sort pass through one clear river. */
