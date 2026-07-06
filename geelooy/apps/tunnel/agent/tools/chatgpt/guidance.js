// B"H
/**
 * B"H
 * One small lamp for every tunnel surface: when a ChatGPT URL appears, agents
 * should not improvise browser loops. They should use the durable session gate.
 */
function chatgptWorkflowGuidance(actionOrSession = {}, maybeSession = null) {
  const session = maybeSession || (typeof actionOrSession === "object" ? actionOrSession : {});
  return {
    preferredStartAction: "chatgptSeasonSaveAndContinue",
    preferredResumeAction: "chatgptAutoContinueWhenIdle",
    registerOnlyAction: "chatgptSaveCurrentSeason",
    statusAction: "chatgptSessionStatus",
    doctorAction: "chatgptSessionDoctor",
    stopAction: "chatgptSessionStop",
    conclusionAction: "chatgptSessionConclusion",
    rule: "Given a ChatGPT conversation URL, use chatgptSeasonSaveAndContinue. It registers the URL, verifies navigation, waits until the visible conversation is idle, prunes heavy DOM, sends through the visible UI, waits for completion, journals, and writes receipts. Do not manually recreate wait loops.",
    currentSession: session.sessionId || "",
    status: session.status || "",
    currentUrl: session.url || ""
  };
}
function chatgptCatalogWorkflow() {
  return [
    "When the user gives a ChatGPT conversation URL, prefer chatgptSeasonSaveAndContinue with url/conversationUrl/chatgptUrl.",
    "Do not manually script waiting loops for ChatGPT turns; session actions already wait until the visible conversation is idle before sending and wait for completion after sending.",
    "Use chatgptSaveCurrentSeason only when the user wants to register a URL without sending immediately.",
    "Use chatgptAutoContinueWhenIdle or chatgptAutoPilotSession for later resumptions of the same saved session.",
    "Use batchTurns sparingly; default one turn is safest because each turn waits for idle, prunes DOM, sends through visible UI, journals, and writes receipts.",
    "Use chatgptSessionStatus or chatgptSessionDoctor when Chrome, authentication, navigation, or idle detection seems broken.",
    "Use chatgptSessionStop to halt automatic continuation and chatgptSessionConclusion to summarize the durable session state.",
    "Do not use hidden completion endpoints; these actions operate through the visible ChatGPT browser profile."
  ];
}
function compactChatgptInstruction() { return chatgptWorkflowGuidance().rule; }
module.exports = { chatgptWorkflowGuidance, chatgptCatalogWorkflow, compactChatgptInstruction };
