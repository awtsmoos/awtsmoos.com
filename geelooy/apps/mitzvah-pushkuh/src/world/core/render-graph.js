// B"H
// A render graph turns drawing into ordered gates of revelation.
export function createRenderGraph() {
  const passes = [];
  function add(name, fn, enabled = () => true) { passes.push({ name, fn, enabled }); return api; }
  function run(ctx, state) { for (let i = 0; i < passes.length; i++) if (passes[i].enabled(state)) { state.stats?.pass(passes[i].name); passes[i].fn(ctx, state); } }
  const api = { add, run, clear: () => { passes.length = 0; } };
  return api;
}
