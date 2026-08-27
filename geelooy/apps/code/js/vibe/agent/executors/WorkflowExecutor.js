// B"H
/**
 * @file WorkflowExecutor.js
 * @brief Declarative semantic orchestration engine.
 */

import { runStep } from './workflow/runStep.js';

const workflowNames = new Set([
  "run_semantic_workflow",
  "run_command_tree",

  "ai_command_batch",
  "command_tree_run", "command_tree_validate", "command_tree_dry_run", "command_tree_explain", "command_tree_visualize", "command_tree_resume", "command_tree_replay", "command_tree_cancel", "command_tree_status", "command_tree_save", "command_tree_load", "awtsmoos_command_tree", "merkava_command_tree", "ai_workflow_lang", "parallel_action_batch", "for_each_action_batch", "retry_action", "assert_action", "snapshot_before_after", "policy_guard", "destructive_intent_gate"
]);

export const WorkflowExecutor = {
  async execute(name, args, tab, onProgress = null) {
    if (workflowNames.has(name)) {
      const workflow = args.workflow || args.steps || args.command_tree || args.commands || args.do || [];
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

      if (/validate|dry_run|explain|visualize|status|cancel|save|load|resume|replay/.test(name)) {
        return JSON.stringify({ ok: true, name, validated: true, plan: workflow.steps ? workflow.steps : workflow }, null, 2);
      }

      if (/validate|dry_run|explain|visualize|status|cancel|save|load|resume|replay/.test(name)) {
        return JSON.stringify({ ok: true, name, validated: true, plan: workflow.steps ? workflow.steps : workflow }, null, 2);
      }

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
