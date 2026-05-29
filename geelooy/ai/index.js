//B"H
import AIServiceHandler from "./aiService.js";
import { MessageRenderer } from "./js/render/messageRenderer.js";
import { resetRenderWorkerStores } from "./js/render/workerClient.js";
import { AutomationSettingsStore } from "./js/automation/settingsStore.js";
import { AutomationPipeline } from "./js/automation/pipeline.js";
import { AutomationPanel } from "./js/automation/panel.js";
import { syncBackgroundAutomation, hasBackgroundAutomationBridge } from "./js/automation/backgroundBridge.js";
import { mountBackgroundAutomationMirror } from "./js/automation/backgroundStreamMirror.js";
import { ConversationController } from "./js/app/conversationController.js";
import { getConversationId, updateSearchParams } from "./js/app/urlState.js";
import { mountMobileScenes, openConversationDrawer } from "./js/app/mobileDrawers.js";
import { wireTransportStatus } from "./js/app/transportStatus.js";
import { LayoutController } from "./js/layout/layoutController.js";
import { AttachmentTray } from "./js/attachments/attachmentTray.js";
import { resumeStoredStreams } from "./js/chatgpt/stream/streamResumer.js";
import { downloadCurrentChatHtml, downloadCurrentChatJson } from "./js/export/chatHtmlExporter.js";

/**
 * Chapter 32: The cockpit learned mercy for the small glass shore.
 *
 * The Awtsmoos breathes through one page: conversation drawers no longer hide
 * beneath automation, transport install help appears without waiting for a
 * failed send, and the Send button still uses the same verified controller path.
 */
document.addEventListener("DOMContentLoaded", async () => {
  scheduleIdle(() => resetRenderWorkerStores());
  const aiHandler = new AIServiceHandler();
  await aiHandler.init();
  window.aiHandler = aiHandler;

  const dom = collectDom();
  const attachments = new AttachmentTray({ tray: dom.attachmentTray, input: dom.messageInput, fileInput: dom.attachmentInput });
  attachments.mount();
  const renderer = new MessageRenderer({ chatBox: dom.chatBox });
  const showAutomationWait = createAutomationWaitBubble(dom.chatBox);
  let resumeVisibleStreams = () => {};
  let panel = null;
  const stopVisibleStreams = () => resumeStoredStreams.stopActive?.();
  const rebindAutomation = id => panel?.setConversationId(id || getConversationId());
  const controller = new ConversationController({
    aiHandler,
    renderer,
    serviceSelect: dom.serviceSelect,
    onConversationChanging: id => { stopVisibleStreams(); rebindAutomation(id); },
    onConversationLoaded: id => { rebindAutomation(id); return resumeVisibleStreams(); }
  });
  const store = new AutomationSettingsStore();
  let pipeline = null;
  panel = new AutomationPanel({
    root: dom.automationPanel,
    store,
    conversationId: getConversationId(),
    onDownloadChat: () => downloadCurrentChatHtml(renderer),
    onDownloadJson: () => downloadCurrentChatJson(renderer),
    onChange: async settings => onAutomationChange({ settings, panel, pipeline, aiHandler })
  });
  pipeline = new AutomationPipeline({
    settingsStore: store,
    getSettings: conversationId => panel.getSettings(conversationId),
    sendPrompt: async prompt => sendAutomationPrompt({ controller, prompt }),
    report: text => panel.report(text),
    onWaiting: state => showAutomationWait(state)
  });
  resumeVisibleStreams = () => resumeStoredStreams(renderer, {
    getActiveConversationId: () => getConversationId(),
    onDone: reply => { if (!hasBackgroundAutomationBridge()) pipeline.afterAssistantReply(reply); }
  });
  new LayoutController(dom).mount();
  const mobileScenes = mountMobileScenes(dom);
  wireTransportStatus(dom);
  wireChrome({ dom, controller, aiHandler, pipeline, panel, mobileScenes, sendFromText });
  mountBackgroundAutomationMirror({ renderer, controller, panel, getConversationId });
  dom.conversationList.innerHTML = `<li class="is-loading">Loading conversations…</li>`;
  dom.chatBox.innerHTML = `<div class="render-loading"><i></i><span>Preparing Awtsmoos cockpit…</span></div>`;
  const bootedConversation = await bootstrapFromUrl({ dom, aiHandler, controller, panel });
  scheduleIdle(() => bootAutomation({ panel, pipeline, bootedConversation, resumeVisibleStreams }));

  async function sendFromText(text = dom.messageInput.value) {
    const prompt = String(text || "").trim();
    if (!prompt) return null;
    dom.messageInput.value = "";
    return await controller.send(prompt, { attachments: attachments.consume(), ondone: async (reply, meta) => afterUserSend({ reply, meta, panel, pipeline, aiHandler, rebindAutomation }) });
  }

  window.sendMessageToAi = sendFromText;
});

function collectDom() {
  return { main: document.querySelector(".main"), chatBox: id("chat-box"), newChat: id("new-chat"), messageInput: id("message-input"), sendButton: id("send-button"), sidebar: id("sidebar"), toggleSidebar: id("toggle-sidebar"), conversationList: id("conversation-items"), refreshButton: id("refresh-conversations"), serviceSelect: id("ai-service-select"), chatgptModeWrap: id("chatgpt-mode-wrap"), chatgptModeSelect: id("chatgpt-mode-select"), automationPanel: id("automation-panel"), leftResizer: id("left-resizer"), rightResizer: id("right-resizer"), composerResizer: id("composer-resizer"), attachmentTray: id("attachment-tray"), attachmentInput: id("attachment-input"), transportStatus: id("transport-status") };
}
function id(value) { return document.getElementById(value); }

function wireChrome({ dom, controller, aiHandler, pipeline, panel, mobileScenes, sendFromText }) {
  if (dom.toggleSidebar) dom.toggleSidebar.onclick = () => dom.sidebar.querySelector?.("[data-panel-action='toggle']")?.click();
  dom.refreshButton.onclick = () => controller.refreshList(dom.conversationList);
  dom.newChat.onclick = async () => { pipeline.reset(); await controller.newConversation(); panel.setConversationId(null); openConversationDrawer(dom); };
  window.addEventListener("awtsmoos-ai-conversation-action", async event => handleConversationAction({ action: event.detail?.action, dom, controller }));
  dom.sendButton.onclick = () => sendFromText();
  dom.messageInput.addEventListener("keydown", event => maybeSendFromKeyboard(event, sendFromText));
  dom.chatgptModeSelect.value = aiHandler.chatgptMode || "regular";
  syncChatGptModeChrome(dom);
  document.querySelector(".mobile-nav-chat")?.addEventListener("click", () => mobileScenes.openChat());
  document.querySelector(".mobile-nav-conversations")?.addEventListener("click", () => mobileScenes.openConversationDrawer());
  document.querySelector(".mobile-nav-automation")?.addEventListener("click", () => mobileScenes.openAutomationDrawer());
  dom.chatgptModeSelect.onchange = async event => resetForServiceMode({ value: event.target.value, aiHandler, controller, panel, dom, mode: true });
  dom.serviceSelect.onchange = async event => resetForServiceMode({ value: event.target.value, aiHandler, controller, panel, dom, mode: false });
}

async function handleConversationAction({ action, dom, controller }) {
  if (action === "open") return openConversationDrawer(dom);
  if (action === "refresh") { openConversationDrawer(dom); return controller.refreshList(dom.conversationList); }
  if (action === "new") { openConversationDrawer(dom); return dom.newChat.click(); }
}
function maybeSendFromKeyboard(event, sendFromText) {
  if (event.key !== "Enter") return;
  const mobile = matchMedia?.("(pointer: coarse)")?.matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
  const commandSend = event.ctrlKey || event.metaKey;
  const desktopPlainSend = !mobile && !event.shiftKey && !event.altKey;
  if (!commandSend && !desktopPlainSend) return;
  event.preventDefault();
  sendFromText();
}
async function resetForServiceMode({ value, aiHandler, controller, panel, dom, mode }) {
  if (mode) aiHandler.setChatGPTMode(value);
  else aiHandler.switchService(value);
  syncChatGptModeChrome(dom);
  updateSearchParams({ [mode ? "awtsmoosChatGPTMode" : "awtsmoosAi"]: value, awtsmoosConversation: null });
  await controller.newConversation();
  panel.setConversationId(null);
  await controller.refreshList(dom.conversationList);
}
function syncChatGptModeChrome(dom) { dom.chatgptModeWrap.hidden = dom.serviceSelect.value !== "chatgpt"; }

async function onAutomationChange({ settings, panel, pipeline, aiHandler }) {
  const conversationId = getConversationId();
  const owner = await syncBackgroundAutomation({ settings, graph: panel.getGraph(), conversationId, chatgptMode: aiHandler.chatgptMode, chatgptModePayload: aiHandler.getChatGPTModePayload?.(), report: text => panel.report(text) });
  if (owner?.owner === "page") await pipeline?.onSettingsChanged(settings);
  else pipeline?.reset(conversationId);
}
async function sendAutomationPrompt({ controller, prompt }) {
  let finalReply = "";
  const result = await controller.send(prompt, { ondone: reply => { if (reply) finalReply = reply; } });
  return finalReply || result || "";
}
async function afterUserSend({ reply, meta, panel, pipeline, aiHandler, rebindAutomation }) {
  rebindAutomation(meta?.conversationId || getConversationId());
  if (!hasBackgroundAutomationBridge()) return pipeline.afterAssistantReply(reply, meta);
  const settings = panel.getSettings(meta?.conversationId);
  if (settings.enabled) await syncBackgroundAutomation({ settings, graph: panel.getGraph(), conversationId: meta?.conversationId || getConversationId(), chatgptMode: aiHandler.chatgptMode, chatgptModePayload: aiHandler.getChatGPTModePayload?.(), report: text => panel.report(text) });
}
function bootAutomation({ panel, pipeline, bootedConversation, resumeVisibleStreams }) {
  panel.setConversationId(getConversationId());
  if (!hasBackgroundAutomationBridge()) pipeline.resumeActiveRuns();
  else panel.report("automation owner: extension background");
  if (!bootedConversation) resumeVisibleStreams();
}

function createAutomationWaitBubble(chatBox) {
  let node = null;
  return state => {
    if (!chatBox) return;
    if (state?.done) { node?.remove?.(); node = null; return; }
    if (!node?.isConnected) {
      node = document.createElement("div");
      node.className = "automation-countdown message assistant-message";
      node.setAttribute("aria-live", "polite");
      chatBox.append(node);
    }
    node.textContent = state?.text || "⌛ automation waiting…";
    chatBox.scrollTop = chatBox.scrollHeight;
  };
}

async function bootstrapFromUrl({ dom, aiHandler, controller, panel }) {
  const params = new URLSearchParams(location.search);
  const selected = params.get("awtsmoosAi");
  const mode = params.get("awtsmoosChatGPTMode");
  if (mode) aiHandler.setChatGPTMode(mode);
  if (selected) { dom.serviceSelect.value = selected; aiHandler.switchService(selected); }
  dom.chatgptModeSelect.value = aiHandler.chatgptMode || "regular";
  syncChatGptModeChrome(dom);
  const convo = getConversationId();
  panel.setConversationId(convo);
  const refreshSidebarSoon = () => scheduleIdle(() => controller.refreshList(dom.conversationList));
  if (convo) {
    await controller.loadConversation(convo);
    refreshSidebarSoon();
    return true;
  }
  if (dom.chatBox.textContent.includes("Preparing Awtsmoos cockpit")) dom.chatBox.innerHTML = `<div class="render-loading idle"><span>Select a conversation or start a new chat.</span></div>`;
  refreshSidebarSoon();
  return false;
}
function scheduleIdle(task) {
  const runner = () => Promise.resolve().then(task).catch(error => console.warn("Deferred AI boot task failed", error));
  if (typeof requestIdleCallback === "function") return requestIdleCallback(runner, { timeout: 1500 });
  return setTimeout(runner, 0);
}
