/* B"H */
export function createFilterRenderer(input = {}) { return { kind:'FilterRenderer', filters:input.filters || [] }; }
export function applyFilters(ctx, filters = []) { filters.forEach(filter => filter?.apply?.(ctx)); return ctx; }
export function updateFilterRenderer(node, patch = {}) { return Object.assign(node, patch); }
