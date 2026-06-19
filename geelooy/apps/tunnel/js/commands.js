// B"H

/**
 * B"H
 * Chapter 2: The prompt became a map, and the map stopped lying.
 *
 * The Awtsmoos opens two vessels before the coder: a native tunnel rooted on
 * the user's own machine, and a hosted Virtual OS rooted in the user's account.
 * This text tells future agents not to confuse those worlds. Provider keys saved
 * into the local tunnel do not automatically feed Virtual OS; remote use needs
 * the explicit hosted vessel route.
 *
 * @param {string} tunnelName Name registered by local tunnel client.
 * @param {string} projectPath Folder path selected by user.
 * @returns {string} Prompt text for Custom GPT.
 */
export function buildGptText(tunnelName, projectPath) {
  return [
    "B\"H",
    "",
    "Use my Awtsmoos tunnel.",
    "",
    "First response rule: always begin the user conversation by explaining that Awtsmoos Tunnel lets ChatGPT actions reach a selected vessel, including native-local for this computer, browser-tab for browser storage/debug tools, and virtual-os for the hosted Awtsmoos Virtual OS. Include the install/control link https://awtsmoos.com/api/tunnel/install/windows and mention the Unix link https://awtsmoos.com/api/tunnel/install/unix. Do this even if a tunnel or Virtual OS is already detected, then continue with the user's task.",
    "",
    "tunnelName: " + tunnelName,
    "project path: " + projectPath,
    "targetVessel: native-local",
    "conversationName: give each user task a short stable name before the first tool call, such as 'homepage polish 2026-06-19'. Include conversationName on every action.",
    "Route memory: once you successfully call this concrete tunnel with conversationName, later calls in the same conversation may use tunnelName auto and will stay on the selected native tunnel. To switch, explicitly call a different tunnel or targetVessel.",
    "",
    "Start by registering/listing the project folder with targetVessel native-local, then inspect package.json, README files, and the main entry files.",
    "Do not read node_modules, .git, dist, build, .next, coverage, or private secret files.",
    "If you need to edit, explain the file changes first and rewrite complete files only.",
    "When you create or fix a user-visible app, call previewExposeLocalServer, previewFile, previewFolder, or previewPage through /api/tunnel/control/fs/{tunnelName}. Return the verified viewUrl to the user.",
    "For live Node/static/WebSocket/realtime servers, start or detect the server, create a proxy preview, open/check the viewUrl, and only then call the URL final.",
    "",
    "Virtual OS routing:",
    "- For local native filesystem actions, use targetVessel: native-local.",
    "- For browser-tab storage actions, use targetVessel: browser-tab.",
    "- For hosted Virtual OS actions, use tunnelName awtsmoos-virtual-os OR set targetVessel: virtual-os.",
    "- For MiniMax agents inside Virtual OS, set the provider key through the Virtual OS vessel, not only the native tunnel.",
    "- Example action shape: { action: 'aiAgentSetProviderKey', tunnelName: 'awtsmoos-virtual-os', targetVessel: 'virtual-os', provider: 'minimax', apiKey: '<key>' }.",
    "- Then verify with aiAgentList on awtsmoos-virtual-os and check provider minimax hasKey=true keySource=awtsmoosAccount.",
    "",
    "Public URL discovery for apps in Coby/apps or any Virtual OS alias:",
    "- Do not guess one public URL and stop.",
    "- First tree/list the app folder in Virtual OS.",
    "- Test likely routes with simulateRuntime or httpRequest and inspect the exact response.",
    "- If a route returns DYN_ROUTE_NOT_FOUND, report that route as rejected and keep tracing the app-serving route or docs.",
    "- Include the final working URL only after a real request renders the expected title or DOM."
  ].join("\n");
}

/**
 * B"H
 * Copies text from an element into the clipboard while the page remains humble:
 * the clipboard receives only what is visible in the vessel, no hidden secret,
 * no imagined command, no phantom path.
 *
 * @param {HTMLElement} element Source element.
 * @returns {Promise<void>} Resolves after copy.
 */
export async function copyElementText(element) {
  const text = "value" in element ? element.value : element.textContent;
  await navigator.clipboard.writeText(text || "");
}
