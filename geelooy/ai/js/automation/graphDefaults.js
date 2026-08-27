//B"H

export const DEFAULT_AUTOMATION_GRAPH = Object.freeze({
  version: 2,
  name: "Awtsmoos Automation Studio",
  start: "guard-stop",
  nodes: [
    { id: "guard-stop", type: "condition", label: "Stop token?", match: "STOP_AUTOMATION", onTrue: "stop", onFalse: "send-continue" },
    { id: "send-continue", type: "send", label: "Continue", prompt: "{{settings.prompt}}", archiveTag: "default-run", outputKey: "lastReply" },
    { id: "stop", type: "stop", label: "Stop" }
  ]
});

export const STUDIO_EXAMPLE_GRAPH = Object.freeze({
  version: 2,
  name: "Feature Film Studio Pipeline",
  start: "concept-architect",
  nodes: [
    { id: "concept-architect", type: "session", role: "screenplay architect", outputKey: "concept", archiveTag: "film", prompt: conceptPrompt(), next: "scene-writer" },
    { id: "scene-writer", type: "session", role: "opening scene writer", inputKeys: "concept", outputKey: "openingScene", archiveTag: "film", prompt: scenePrompt(), next: "continuity-critic" },
    { id: "continuity-critic", type: "session", role: "continuity critic", inputKeys: "concept,openingScene", outputKey: "critique", prompt: "Critique continuity, pacing, symbolism, and emotional clarity.\n\n{{memory.concept}}\n\n{{memory.openingScene}}", next: "compile-final" },
    { id: "compile-final", type: "compile", outputKey: "finalPackage", compileTemplate: "===CONCEPT===\n{{memory.concept}}\n\n===OPENING SCENE===\n{{memory.openingScene}}\n\n===CRITIQUE===\n{{memory.critique}}", next: "stop" },
    { id: "stop", type: "stop", label: "Done" }
  ]
});

export function cloneDefaultAutomationGraph() { return clone(DEFAULT_AUTOMATION_GRAPH); }
export function cloneStudioExampleGraph() { return clone(STUDIO_EXAMPLE_GRAPH); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function conceptPrompt() {
  return `B"H\nYou are the screenplay architect. Generate an original feature film concept.\nUse exact delimiters: ===TITLE===, ===LOGLINE===, ===THEMES===, ===MAIN CHARACTERS===, ===ACT STRUCTURE===, ===SCENE IDEAS===.\nThemes: hidden truth, inner transformation, technology and soul, hidden light inside darkness.`;
}
function scenePrompt() {
  return `B"H\nYou are the screenplay scene writer. Use the concept below:\n{{memory.concept}}\n\nWrite the OPENING SCENE in professional screenplay format with sensory detail, symbolism, and realistic dialogue. Use ===SCENE BREAK=== between sections.`;
}
