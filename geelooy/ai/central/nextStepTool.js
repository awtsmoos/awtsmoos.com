// B"H
export const NEXT_STEP_TOOL_NAME = "awtsmoos_needs_next_step";
export const DEFAULT_NEXT_STEP_PROMPT = "Continue with the next precise verified step.";

/**
 * B"H
 * Chapter 250: Before The Final Answer, The Agent Lit A Continuation Lamp.
 *
 * This is a virtual browser-side tool. It does not touch the filesystem or the
 * tunnel. A provider calls it before its final visible answer when there is
 * still real work left after the answer lands. The page then sends exactly one
 * follow-up prompt after the final message paints, without racing the normal
 * automation pipeline.
 */
export function makeNextStepToolSchema() {
  return {
    type: "function",
    function: {
      name: NEXT_STEP_TOOL_NAME,
      description: "Call right before your final reply if, after that final reply is shown, the browser should automatically send one next-step prompt because useful work remains. Do not call when the task is complete.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          needed: { type: "boolean", description: "True only if there is more useful work to do after the final reply." },
          prompt: { type: "string", description: "Optional exact follow-up prompt to send. If omitted, the page uses a safe default." },
          reason: { type: "string", description: "Short reason shown in debug metadata." }
        },
        required: ["needed"]
      }
    }
  };
}

export function normalizeNextStepIntent(args = {}) {
  const needed = Boolean(args?.needed);
  const prompt = cleanPrompt(args?.prompt);
  return {
    needed,
    prompt: prompt || DEFAULT_NEXT_STEP_PROMPT,
    reason: String(args?.reason || "").trim(),
    source: NEXT_STEP_TOOL_NAME
  };
}

export function isNextStepToolName(name = "") {
  return String(name || "") === NEXT_STEP_TOOL_NAME;
}

function cleanPrompt(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.length > 2000 ? text.slice(0, 2000) : text;
}
