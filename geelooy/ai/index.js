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
import { LayoutController } from "./js/layout/layoutController.js";
import { AttachmentTray } from "./js/attachments/attachmentTray.js";
import { resumeStoredStreams } from "./js/chatgpt/stream/streamResumer.js";
import { downloadCurrentChatHtml, downloadCurrentChatJson } from "./js/export/chatHtmlExporter.js";

/**
 * Chapter 1: The page becomes a cockpit, not a leaking scroll.
 * The Awtsmoos reveals each event through small vessels: renderer, controller,
 * settings, and pipeline, so no one giant script devours the world.
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
  let resumeVisibleStreams = () => {};
  const controller = new ConversationController({
    aiHandler,
    renderer,
    serviceSelect: dom.serviceSelect,
    onConversationLoaded: () => resumeVisibleStreams()
  });
  const store = new AutomationSettingsStore();
  let pipeline = null;
  const panel = new AutomationPanel({
    root: dom.automationPanel,
    store,
    onDownloadChat: () => downloadCurrentChatHtml(renderer),
    onDownloadJson: () => downloadCurrentChatJson(renderer),
    onChange: async settings => {
      const owner = await syncBackgroundAutomation({ settings, graph: panel.getGraph(), conversationId: getConversationId(), chatgptMode: aiHandler.chatgptMode, chatgptModePayload: aiHandler.getChatGPTModePayload?.(), report: text => panel.report(text) });
      if (owner?.owner === "page") await pipeline?.onSettingsChanged(settings);
      else pipeline?.reset(getConversationId());
    }
  });
  pipeline = new AutomationPipeline({
    settingsStore: store,
    getSettings: () => panel.getSettings(),
    sendPrompt: async (prompt, context = {}) => {
      let finalReply = "";
      const result = await controller.sendAutomation(prompt, {
        conversationId: context.conversationId,
        ondone: reply => { if (reply) finalReply = reply; }
      });
      return finalReply || result || "";
    },
    report: text => panel.report(text)
  });
  resumeVisibleStreams = () => resumeStoredStreams(renderer, {
    getActiveConversationId: () => getConversationId(),
    onDone: reply => {
      if (!hasBackgroundAutomationBridge()) pipeline.afterAssistantReply(reply);
    }
  });
  new LayoutController(dom).mount();
  wireTransportStatus(dom);

  wireChrome({ dom, controller, aiHandler, pipeline, panel, attachments, sendFromText });
  mountBackgroundAutomationMirror({ renderer, controller, panel, getConversationId });
  dom.conversationList.innerHTML = `<li class="is-loading">Loading conversations…</li>`;
  dom.chatBox.innerHTML = `<div class="render-loading"><i></i><span>Preparing Awtsmoos cockpit…</span></div>`;
  const bootedConversation = await bootstrapFromUrl({ dom, aiHandler, controller });
  scheduleIdle(() => {
    if (!hasBackgroundAutomationBridge()) pipeline.resumeActiveRuns();
    else panel.report("automation owner: extension background");
    if (!bootedConversation) resumeVisibleStreams();
  });

  async function sendFromText(text = dom.messageInput.value) {
    const prompt = String(text || "").trim();
    if (!prompt) return null;
    dom.messageInput.value = "";
    return await controller.send(prompt, { attachments: attachments.consume(), ondone: async (reply, meta) => {
      if (!hasBackgroundAutomationBridge()) return pipeline.afterAssistantReply(reply, meta);
      if (panel.getSettings().enabled) await syncBackgroundAutomation({ settings: panel.getSettings(), graph: panel.getGraph(), conversationId: getConversationId(), chatgptMode: aiHandler.chatgptMode, chatgptModePayload: aiHandler.getChatGPTModePayload?.(), report: text => panel.report(text) });
    } });
  }

  window.sendMessageToAi = sendFromText;
});

function collectDom() {
  return {
    chatBox: document.getElementById("chat-box"),
    newChat: document.getElementById("new-chat"),
    messageInput: document.getElementById("message-input"),
    sendButton: document.getElementById("send-button"),
    sidebar: document.getElementById("sidebar"),
    toggleSidebar: document.getElementById("toggle-sidebar"),
    conversationList: document.getElementById("conversation-items"),
    refreshButton: document.getElementById("refresh-conversations"),
    serviceSelect: document.getElementById("ai-service-select"),
    chatgptModeWrap: document.getElementById("chatgpt-mode-wrap"),
    chatgptModeSelect: document.getElementById("chatgpt-mode-select"),
    automationPanel: document.getElementById("automation-panel"),
    leftResizer: document.getElementById("left-resizer"),
    rightResizer: document.getElementById("right-resizer"),
    composerResizer: document.getElementById("composer-resizer"),
    attachmentTray: document.getElementById("attachment-tray"),
    attachmentInput: document.getElementById("attachment-input"),
    transportStatus: document.getElementById("transport-status")
  };
}
function wireChrome({ dom, controller, aiHandler, pipeline, sendFromText }) {
  if (dom.toggleSidebar) dom.toggleSidebar.onclick = () => dom.sidebar.querySelector?.("[data-panel-action='toggle']")?.click();
  dom.refreshButton.onclick = () => controller.refreshList(dom.conversationList);
  dom.newChat.onclick = () => { pipeline.reset(); controller.newConversation(); };
  dom.sendButton.onclick = () => sendFromText();
  dom.messageInput.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    const mobile = isMobileInputDevice();
    const commandSend = event.ctrlKey || event.metaKey;
    const desktopPlainSend = !mobile && !event.shiftKey && !event.altKey;
    if (!commandSend && !desktopPlainSend) return;
    event.preventDefault();
    sendFromText();
  });
  dom.chatgptModeSelect.value = aiHandler.chatgptMode || "regular";
  syncChatGptModeChrome(dom);
  dom.chatgptModeSelect.onchange = async event => {
    aiHandler.setChatGPTMode(event.target.value);
    updateSearchParams({ awtsmoosChatGPTMode: event.target.value, awtsmoosConversation: null });
    await controller.newConversation();
    await controller.refreshList(dom.conversationList);
  };
  dom.serviceSelect.onchange = async event => {
    aiHandler.switchService(event.target.value);
    syncChatGptModeChrome(dom);
    updateSearchParams({ awtsmoosAi: event.target.value, awtsmoosConversation: null });
    await controller.newConversation();
    await controller.refreshList(dom.conversationList);
  };
}

function isMobileInputDevice() {
  return matchMedia?.("(pointer: coarse)")?.matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
}

function syncChatGptModeChrome(dom) {
  const isChatGPT = dom.serviceSelect.value === "chatgpt";
  dom.chatgptModeWrap.hidden = !isChatGPT;
}



function wireTransportStatus(dom) {
  const el = dom.transportStatus;
  if (!el) return;
  const renderReady = detail => {
    el.hidden = false;
    el.className = `transport-status is-${detail.kind || detail.transport || "ready"}`;
    el.innerHTML = `<strong>Transport:</strong> ${escapeInline(detail.label || detail.transport || "ready")}`;
  };
  const renderFeedback = detail => {
    const type = String(detail.type || "extension issue");
    const error = String(detail.error || "");
    if (/Response not found|already consumed/i.test(error)) return;
    el.hidden = false;
    el.className = `transport-status is-${type.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase() || "missing"}`;
    el.innerHTML = `<strong>Transport feedback:</strong> ${escapeInline(type)} ${error ? `<span class="transport-error-text">${escapeInline(error)}</span>` : ""}`;
  };
  const renderMissing = help => {
    el.hidden = false;
    el.className = "transport-status is-missing";
    el.innerHTML = `
      <strong>Awtsmoos transport needed.</strong>
      <span>Use the Chrome server extension or run the local Node relay.</span>
      <a href="${help.extensionUrl}" target="_blank" rel="noreferrer">Extension zip</a>
      <button type="button" data-copy="mac">Copy macOS/Linux relay command</button>
      <button type="button" data-copy="win">Copy Windows relay command</button>
    `;
    el.querySelector('[data-copy="mac"]')?.addEventListener("click", () => navigator.clipboard?.writeText(help.macLinux));
    el.querySelector('[data-copy="win"]')?.addEventListener("click", () => navigator.clipboard?.writeText(help.windows));
  };
  window.addEventListener("awtsmoos-ai-transport", event => renderReady(event.detail || {}));
  window.addEventListener("awtsmoos-server-ready", event => renderReady({ kind: "extension", label: "Awtsmoos Chrome Server Extension" }));
  window.addEventListener("awtsmoos-server-feedback", event => renderFeedback(event.detail || {}));
  window.addEventListener("awtsmoos-ai-transport-error", event => renderMissing(event.detail || {}));
}

function escapeInline(text) {
  return String(text || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

async function bootstrapFromUrl({ dom, aiHandler, controller }) {
  const params = new URLSearchParams(location.search);
  const selected = params.get("awtsmoosAi");
  const mode = params.get("awtsmoosChatGPTMode");
  if (mode) aiHandler.setChatGPTMode(mode);
  if (selected) { dom.serviceSelect.value = selected; aiHandler.switchService(selected); }
  dom.chatgptModeSelect.value = aiHandler.chatgptMode || "regular";
  syncChatGptModeChrome(dom);
  const convo = getConversationId();
  const refreshSidebarSoon = () => scheduleIdle(() => controller.refreshList(dom.conversationList));
  if (convo) {
    await controller.loadConversation(convo);
    refreshSidebarSoon();
    return true;
  }
  if (dom.chatBox.textContent.includes("Preparing Awtsmoos cockpit")) {
    dom.chatBox.innerHTML = `<div class="render-loading idle"><span>Select a conversation or start a new chat.</span></div>`;
  }
  refreshSidebarSoon();
  return false;
}

function scheduleIdle(task) {
  const runner = () => Promise.resolve().then(task).catch(error => console.warn("Deferred AI boot task failed", error));
  if (typeof requestIdleCallback === "function") return requestIdleCallback(runner, { timeout: 1500 });
  return setTimeout(runner, 0);
}
