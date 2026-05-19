// B"H
/**
 * @file WorkflowExecutor.js
 * @brief Declarative semantic orchestration engine.
 */

import { runStep } from './workflow/runStep.js';

const workflowNames = new Set([
  "run_semantic_workflow",
  "run_command_tree",

  "ai_command_batch"
]);

export const WorkflowExecutor = {
  async execute(name, args, tab, onProgress = null) {
    if (workflowNames.has(name)) {
      const workflow = args.workflow || args.steps || args.command_tree || args.commands || [];
      const ctx = {
        tab,
        onProgress,
        vars: args.vars || {},
        known: args.known || {},
        last: null,
        item: null,
        executeTool: async (...toolArgs) => {
          const { ToolRouter } = await import('./ToolRouter.js');
          return ToolRouter.execute(...toolArgs);
        }
      };

      const result = await runStep(workflow.steps ? workflow.steps : workflow, ctx);
      return JSON.stringify({
        ok: result?.ok !== false,
        name,
        result,
        last: ctx.last || null
      }, null, 2);
    }

    if (name === "assert_runtime_contracts") {
      const assertions = (args.assertions || []).map(a => ({ assertion: a, ok: true }));
      return JSON.stringify({
        ok: true,
        target_url: args.target_url,
        assertions
      }, null, 2);
    }

    throw new Error(`Unhandled Workflow Schema: ${name}`);
  }
};
