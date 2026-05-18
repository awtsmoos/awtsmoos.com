// B"H
/**
 * @file Workflow.js
 * @brief Semantic workflow graph and contract assertion schemas.
 *
 * Chapter 1: In the workshop of tiny vessels, the Awtsmoos glimmers through
 * every schema edge. A workflow is not a heap of commands; it is a riverbed:
 * each step names its kav, each condition opens or closes a gate, each retry
 * admits that created things can crack yet be renewed. These tool schemas are
 * deliberately declarative, so the runtime can inspect intent before action.
 */

/**
 * Schema fragment for one executable workflow node.
 *
 * @type {object}
 */
const workflowStepSchema = {
    type: "object",
    description: "One semantic workflow step: tool call, branch, foreach loop, pipe, fallback, retry, or failure handler.",
    properties: {
        id: { type: "string", description: "Stable step identifier for logs, references, and recovery." },
        tool: { type: "string", description: "Optional tool/function name to invoke for this step." },
        args: { type: "object", description: "Arguments passed to the tool or interpreter." },
        if: { description: "Condition expression or structured predicate controlling branch execution." },
        then: { type: "array", items: { type: "object" }, description: "Steps executed when the condition is truthy." },
        else: { type: "array", items: { type: "object" }, description: "Steps executed when the condition is falsy." },
        foreach: { description: "Iterable expression, array, or data reference used to repeat this step." },
        pipe: { type: "array", items: { type: "object" }, description: "Pipeline of steps receiving prior output." },
        fallback: { type: "array", items: { type: "object" }, description: "Alternative steps attempted when primary execution fails." },
        retry: {
            type: "object",
            description: "Retry policy for transient failures.",
            properties: {
                attempts: { type: "number" },
                delay_ms: { type: "number" },
                backoff: { type: "string", enum: ["none", "linear", "exponential"] }
            }
        },
        onFailure: { type: "array", items: { type: "object" }, description: "Cleanup or reporting steps after unrecovered failure." }
    }
};

/**
 * The complete workflow graph schema. It keeps orchestration data-shaped, so
 * each runtime can walk it with humility instead of guessing hidden intent.
 *
 * @type {object}
 */
const workflowGraphSchema = {
    type: "object",
    description: "Declarative workflow graph with variables, ordered steps, branches, loops, pipelines, fallbacks, retries, and failure hooks.",
    properties: {
        name: { type: "string", description: "Human-readable workflow name." },
        description: { type: "string", description: "Purpose and safety notes for this workflow." },
        vars: { type: "object", description: "Named values available to expressions and step arguments." },
        steps: {
            type: "array",
            description: "Primary ordered workflow steps.",
            items: workflowStepSchema
        },
        onFailure: {
            type: "array",
            description: "Global failure handler steps.",
            items: workflowStepSchema
        }
    },
    required: ["steps"]
};

export const WorkflowSchemas = [
    {
        function: {
            name: "run_semantic_workflow",
            description: "Executes a declarative workflow graph with conditions, fallbacks, pipelines, retries, foreach loops, and failure handlers.",
            parameters: {
                type: "object",
                properties: {
                    workflow: workflowGraphSchema
                },
                required: ["workflow"]
            }
        }
    },
    {
        function: {
            name: "assert_runtime_contracts",
            description: "Verifies runtime contracts such as URL reachability, DOM selectors, expected files, required exports, and semantic assertions.",
            parameters: {
                type: "object",
                properties: {
                    target_url: {
                        type: "string",
                        description: "Optional URL that must be reachable before selector assertions run."
                    },
                    selectors: {
                        type: "array",
                        description: "CSS selectors expected to exist in the active runtime document.",
                        items: { type: "string" }
                    },
                    files: {
                        type: "array",
                        description: "Project-relative files expected to exist.",
                        items: { type: "string" }
                    },
                    exports: {
                        type: "array",
                        description: "Expected module exports, expressed as strings or structured checks.",
                        items: {}
                    },
                    assertions: {
                        type: "array",
                        description: "Free-form semantic assertions the runtime should evaluate and report.",
                        items: {}
                    }
                }
            }
        }
    }
];
