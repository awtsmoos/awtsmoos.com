// B"H
/** Workflow tool schemas for Vibe agent orchestration. */
const workflowStepSchema = {
  type: "object",
  description: "One command-tree/workflow step: action/tool call, branch, loop, retry, assertion, or recovery handler.",
  properties: {
    id: { type: "string" },
    action: { type: "string" },
    tool: { type: "string" },
    call: { type: "string" },
    with: { type: "object" },
    args: { type: "object" },
    payload: { type: "object" },
    saveAs: { type: "string" },
    if: { type: "object" },
    when: { type: "object" },
    then: { type: "array", items: { type: "object" } },
    else: { type: "array", items: { type: "object" } },
    do: { type: "array", items: { type: "object" } },
    parallel: { type: "array", items: { type: "object" } },
    forEach: { type: "object" },
    retry: { type: "object" },
    assert: { type: "object" },
    onError: { type: "array", items: { type: "object" } },
    finally: { type: "array", items: { type: "object" } }
  }
};

const workflowGraphSchema = {
  type: "object",
  description: "Declarative workflow graph with variables, ordered steps, branches, loops, retries, assertions, and failure hooks.",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    vars: { type: "object" },
    policy: { type: "object" },
    steps: { type: "array", items: workflowStepSchema },
    do: { type: "array", items: workflowStepSchema },
    onError: { type: "array", items: workflowStepSchema },
    finally: { type: "array", items: workflowStepSchema }
  }
};

const workflowParams = {
  type: "object",
  properties: {
    workflow: workflowGraphSchema,
    steps: { type: "array", items: workflowStepSchema },
    do: { type: "array", items: workflowStepSchema },
    commands: { type: "array", items: workflowStepSchema },
    vars: { type: "object" },
    policy: { type: "object" },
    known: { type: "object" },
    dryRun: { type: "boolean" }
  }
};

function schema(name, description = "B'H. Declarative workflow/command-tree tool.") {
  return { function: { name, description, parameters: workflowParams } };
}

const commandTreeNames = [
  "command_tree_run", "command_tree_validate", "command_tree_dry_run",
  "command_tree_explain", "command_tree_visualize", "command_tree_resume",
  "command_tree_replay", "command_tree_cancel", "command_tree_status",
  "command_tree_save", "command_tree_load", "awtsmoos_command_tree",
  "merkava_command_tree", "ai_workflow_lang", "parallel_action_batch",
  "for_each_action_batch", "retry_action", "assert_action",
  "snapshot_before_after", "policy_guard", "destructive_intent_gate"
];

export const WorkflowSchemas = [
  schema("run_command_tree", "Runs a provider-agnostic command tree in one tool call."),
  schema("ai_command_batch", "Alias for run_command_tree optimized for plain-text AIs."),
  schema("run_semantic_workflow", "Executes a declarative semantic workflow graph."),
  ...commandTreeNames.map(name => schema(name, "B'H. Command-tree language tool with do/if/then/else/parallel/forEach/retry/assert/finally semantics.")),
  {
    function: {
      name: "assert_runtime_contracts",
      description: "Checks runtime output against explicit contracts/invariants.",
      parameters: {
        type: "object",
        properties: {
          contracts: { type: "array", items: { type: "object" } },
          runtime_state: { type: "object" },
          strict: { type: "boolean" }
        }
      }
    }
  }
];

export { workflowStepSchema, workflowGraphSchema };
