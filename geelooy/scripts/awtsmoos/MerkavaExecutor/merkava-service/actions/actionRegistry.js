// B"H

export function createActionRegistry(runOnce) {
  return {
    async simulate(options = {}) {
      return runOnce(options);
    },

    async rerun(ctx = {}) {
      return runOnce(ctx.options || {});
    },

    async mutate(ctx = {}, next = {}) {
      return runOnce({
        ...(ctx.options || {}),
        ...next
      });
    }
  };
}
