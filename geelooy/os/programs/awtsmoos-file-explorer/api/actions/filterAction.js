// B"H
import { setFilter } from './filter.js';
export function filterBy({ state, query = '' }) { setFilter(state, query); return state.filter; }
/** B"H: filtering is an action so search fields and buttons agree. */
