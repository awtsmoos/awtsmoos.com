// B"H
import { setSort } from './sorters.js';
export function sortBy({ state, controller }, by) { setSort(state, by); controller.emit('explorer.sort.change', state.sort); return state.sort; }
/** B"H: sort buttons mutate state, then the controller refreshes the order. */
