// B"H

const DEFAULT_KEEP_GOING_PROMPT = "Keep going. Give me a list of all remaining necessary things, then do them one by one with real verification after every action.";
const DEFAULT_CONCLUDE_PROMPT = "At the end, inspect the confusing/uncertain action results, call the conclude/final-summary step if truly complete, and call finishAndContinue with the remaining task list if anything remains.";

const GUIDANCE_PROMPTS = [
  "Keep going; do not stop on a partial success. List what remains and execute the next real action.",
  "Do not forget to inspect the confusing action at the end; now keep exploring with real tool results.",
  "Keep thinking of a list of all remaining things and continue doing them one by one.",
  "Pause only to verify, not to quit. If anything is uncertain, run the next diagnostic.",
  "Make a fresh checklist from the latest result, choose the smallest safe item, and do it now.",
  "Before saying done, search for what is still vague, skipped, stubbed, partial, or unverified.",
  "Keep going and ask the code what is true: read files, run checks, compare outputs, then continue.",
  "At the end, call conclude only if no work remains; otherwise call finishAndContinue with the next task list.",
  "Do not drift into summary mode yet; inspect the next connected file or failing action.",
  "If the result says partial, raise limits or narrow the query and keep digging.",
  "If a tool returns ok=true but empty results, verify the payload shape before trusting it.",
  "If an action looks generic, find the handler and replace the generic path with a real implementation.",
  "Keep exploring: trace registration, payload parsing, dispatcher mapping, and response shaping.",
  "Keep a living list: done, unverified, blocked, next. Then execute next immediately.",
  "Do not forget the final confusing corner: auth errors, rate limits, catch blocks, and early returns need guidance too.",
  "Brainstorm more possible hidden issues, then test the highest-risk one with a concrete command.",
  "Continue until tests pass and the live response shape proves the change is actually active.",
  "Read the real file before editing. After editing, run syntax and the relevant harness.",
  "If the server may be cached, say so precisely and verify the local code anyway.",
  "Keep going; inspect connected files and imports so the fix reaches the true response path.",
  "Do not stop at green syntax. Run behavioral tests that check the actual fields returned.",
  "Keep looking for duplicated imports, duplicate handlers, and silently ignored payload fields.",
  "At the end of this action, ask: what remains, what is untested, what is ambiguous, what should run next?",
  "If something is skipped, classify why: destructive, Chrome-only, unavailable, or not implemented.",
  "Keep going with a smaller safe step if the big step is blocked.",
  "Do not merely conclude; either finish fully or return a continuation prompt that forces the next step.",
  "Check the control panel default prompt too; the UI should remind agents to keep going.",
  "Every response should nudge: continue, verify, inspect confusion, and conclude only when complete.",
  "When a list is long, group it by family and burn down the largest family first.",
  "Keep the Awtsmoos path alive: inspect, infer, act, verify, continue.",
  "Do not trust old memory. Refresh from current files and current command output.",
  "If tests pass but coverage is shallow, write a better test and run it.",
  "If a response is missing guidance, patch the central response wrapper, not one random action.",
  "If the action fails, include the exact blocker and the smallest next diagnostic.",
  "If everything seems done, try to falsify that by searching for TODO, generic, partial, skipped, and unverified.",
  "Keep going: the next useful action is more valuable than a premature final answer.",
  "Do the next thing now. Then inspect the result. Then do the next thing again.",
  "Make sure the final answer says what changed, what passed, and what still honestly remains.",
  "Do not forget to call finishAndContinue when autonomous work should continue beyond this response."
];

/**
 * B"H
 * Chapter 381: One spark, not a swarm.
 * The ChatGPT agent should receive one guidance prompt by default. The full
 * council of prompts appears only when guidanceDebug=true, so normal action
 * responses remain sharp, small, and usable.
 */
function seedForAction(action = "") {
  const letters = String(action || "");
  return letters.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), letters.length);
}

function randomIndex(action = "") {
  const salt = Math.floor(Date.now() / 60000);
  return Math.abs(seedForAction(action) + salt) % GUIDANCE_PROMPTS.length;
}

function guidanceForAction(action = "") {
  return GUIDANCE_PROMPTS[randomIndex(action)];
}

function guidancePackForAction(action = "") {
  const seed = seedForAction(action);
  return [0, 7, 17, 29, 37].map(offset => GUIDANCE_PROMPTS[(seed + offset) % GUIDANCE_PROMPTS.length]);
}

function actionChecklistPrompt(action = "") {
  return `For action ${String(action || "unknown")}: write the remaining task list, inspect confusing results, do the next item, verify with a real result, then continue or conclude explicitly.`;
}

function debugWanted(payload = {}) {
  return payload.guidanceDebug === true || payload.guidanceDebug === "true" || payload.debugGuidance === true || payload.debugGuidance === "true";
}

function guidancePayload(action, payload) {
  const base = { keepGoing: true, prompt: guidanceForAction(action) };
  if (!debugWanted(payload)) return base;
  return {
    ...base,
    prompts: guidancePackForAction(action),
    keepGoingPrompt: DEFAULT_KEEP_GOING_PROMPT,
    remainingWorkPrompt: "Keep thinking of a list of all remaining things. Do them one by one. After each action, verify with a real result and continue.",
    confusingActionPrompt: "Do not forget to inspect the confusing action at the end: partial outputs, empty ok=true responses, skipped actions, generic support, catch paths, and cached live routes.",
    concludePrompt: DEFAULT_CONCLUDE_PROMPT,
    concludeReminder: "At the end of the work loop, call the conclude/final-summary step when available. If not done, call finishAndContinue with the remaining task list.",
    taskLoop: "List necessary things to do; do them one by one; verify each step; inspect confusing results; continue until no unverified work remains.",
    actionChecklistPrompt: actionChecklistPrompt(action)
  };
}

function attachActionGuidance(result, payload = {}) {
  if (!result || typeof result !== "object" || Array.isArray(result)) return result;
  if (result.aiGuidance) return result;
  const action = payload.action || result.action || "unknown";
  return { ...result, aiGuidance: guidancePayload(action, payload) };
}

module.exports = {
  DEFAULT_KEEP_GOING_PROMPT,
  DEFAULT_CONCLUDE_PROMPT,
  GUIDANCE_PROMPTS,
  guidanceForAction,
  guidancePackForAction,
  actionChecklistPrompt,
  attachActionGuidance,
  guidancePayload
};
