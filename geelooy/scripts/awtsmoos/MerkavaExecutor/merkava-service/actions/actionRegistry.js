// B"H
/**
 * B"H
 * Builds workflow actions around a provided simulate function.
 *
 * @param {Function} simulate Simulation function.
 * @returns {object} Action registry.
 */
function createActionRegistry(simulate) {
  return {
    async simulateBrowser(_args, ctx) {
      ctx.result = await simulate({ ...ctx.options, runtime: "browser" });
      return ctx.result;
    },

    async simulateNode(_args, ctx) {
      ctx.result = await simulate({ ...ctx.options, runtime: "node" });
      return ctx.result;
    },

    async simulate(_args, ctx) {
      ctx.result = await simulate(ctx.options);
      return ctx.result;
    },

    async unsupportedRuntime(_args, ctx) {
      return { ok: false, error: "unsupported_runtime", runtime: ctx.options?.runtime || null };
    }
  };
}

module.exports = { createActionRegistry };
