//B"H
import AIServiceHandler from "./aiService.js";
import { MessageRenderer } from "./js/render/messageRenderer.js";
import { AutomationSettingsStore } from "./js/automation/settingsStore.js";
import { AutomationPipeline } from "./js/automation/pipeline.js";
import { AutomationPanel } from "./js/automation/panel.js";
import { syncBackgroundAutomation } from "./js/automation/backgroundBridge.js";
import { ConversationController } from "./js/app/conversationController.js";
import { getConversationId, updateSearchParams } from "./js/app/urlState.js";
import { LayoutController } from "./js/layout/layoutController.js";
import { AttachmentTray } from "./js/attachments/attachmentTray.js";
import { ComposerAutosize } from "./js/forms/composerAutosize.js";
import { resumeStoredStreams } from "./js/chatgpt/stream/streamResumer.js";

/**
 * B"H
 * Chapter 378: Automation Finally Received A Living Wire.
 *
 * The Awtsmoos gives the visible Send button and the automation sender one
 * controller path. When the human flips Automation on, the panel now actually
 * calls the pipeline immediately. If background ownership is explicitly chosen,
 * the extension/relay receives the same ChatGPT mode payload before the visible
 * page stands down.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const aiHandler = new AIServiceHandler();
  await aiHandler.init();
  window.aiHandler = aiHandler;

  const dom = collectDom();
  new LayoutController(dom).mount();
  const attachments = new AttachmentTray({ tray: dom.attachmentTray, input: dom.messageInput, fileInput: dom.attachmentInput });
  attachments.mount();
  const composerAutosize = new ComposerAutosize(dom.messageInput, { inputArea: dom.inputArea });
  composerAutosize.mount();

  const renderer = new MessageRenderer({ chatBox: dom.chatBox });
  const store = new AutomationSettingsStore();
  const panel = new AutomationPanel({ root: dom.automationPanel, store, conversationId: getConversationId() });
  let resumeVisibleStreams = () => {};
  let controller = null;
  const syncPanelConversation = id => panel.setConversationId?.(id || getConversationId() || null);
  const stopVisibleStreams = id => { syncPanelConversation(id); resumeStoredStreams.stopActive?.(); };
  const pipeline = new AutomationPipeline({
    settingsStore: store,
    getSettings: conversationId => panel.getSettings(conversationId),
    sendPrompt: (prompt, context = {}) => controller.sendAutomation(prompt, {
      conversationId: context.conversationId,
      ondone: (reply, meta) => pipeline.afterAssistantReply(reply, meta)
    }),
    report: text => panel.report(text)
  });
  panel.onChange = settings => handleAutomationSettings({ settings, aiHandler, panel, pipeline });

  controller = new ConversationController({
    aiHandler,
    renderer,
    serviceSelect: dom.serviceSelect,
    onConversationChanging: id => stopVisibleStreams(id),
    onConversationLoaded: id => { syncPanelConversation(id); return resumeVisibleStreams(); }
  });

  resumeVisibleStreams = () => resumeStoredStreams(renderer, {
    getActiveConversationId: () => getConversationId(),
    onDone: (reply, meta) => pipeline.afterAssistantReply(reply, meta)
  });
  wireChrome({ dom, controller, aiHandler, pipeline, sendFromText, syncPanelConversation });
  await bootstrapFromUrl({ dom, aiHandler, controller, syncPanelConversation });
  syncPanelConversation(getConversationId());
  resumeVisibleStreams();

  async function sendFromText(text = dom.messageInput.value) {
    const prompt = String(text || "").trim();
    if (!prompt) return null;
    dom.messageInput.value = "";
    composerAutosize.resize();
    return await controller.send(prompt, {
      attachments: attachments.consume(),
      ondone: (reply, meta) => { syncPanelConversation(meta?.conversationId); return pipeline.afterAssistantReply(reply, meta); }
    });
  }

  window.sendMessageToAi = sendFromText;
});

async function handleAutomationSettings({ settings, aiHandler, panel, pipeline }) {
  const conversationId = getConversationId();
  const background = await syncBackgroundAutomation({
    settings,
    graph: panel.getGraph?.(),
    conversationId,
    chatgptMode: aiHandler.chatgptMode,
    chatgptModePayload: aiHandler.getChatGPTModePayload(),
    report: text => panel.report(text)
  });
  if (background?.owner === "page") return await pipeline.onSettingsChanged(settings);
  return background;
}

function collectDom() {
  return {
    chatBox: document.getElementById("chat-box"), newChat: document.getElementById("new-chat"),
    messageInput: document.getElementById("message-input"), sendButton: document.getElementById("send-button"),
    sidebar: document.getElementById("sidebar"), toggleSidebar: document.getElementById("toggle-sidebar"),
    conversationList: document.getElementById("conversation-items"), refreshButton: document.getElementById("refresh-conversations"),
    serviceSelect: document.getElementById("ai-service-select"), automationPanel: document.getElementById("automation-panel"),
    leftResizer: document.getElementById("left-resizer"), rightResizer: document.getElementById("right-resizer"),
    composerResizer: document.getElementById("composer-resizer"), attachmentTray: document.getElementById("attachment-tray"),
    attachmentInput: document.getElementById("attachment-input"), inputArea: document.querySelector(".input-area")
  };
}

function wireChrome({ dom, controller, aiHandler, pipeline, sendFromText, syncPanelConversation }) {
  if (dom.toggleSidebar) dom.toggleSidebar.onclick = () => dom.sidebar.querySelector?.("[data-panel-action='toggle']")?.click();
  dom.refreshButton.onclick = () => controller.refreshList(dom.conversationList);
  dom.newChat.onclick = () => { pipeline.reset(); controller.newConversation(); syncPanelConversation(null); };
  dom.sendButton.onclick = () => sendFromText();
  dom.messageInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) sendFromText();
  });
  dom.serviceSelect.onchange = async event => {
    aiHandler.switchService(event.target.value);
    updateSearchParams({ awtsmoosAi: event.target.value, awtsmoosConversation: null });
    await controller.newConversation();
    syncPanelConversation(null);
    await controller.refreshList(dom.conversationList);
  };
}

async function bootstrapFromUrl({ dom, aiHandler, controller, syncPanelConversation }) {
  const params = new URLSearchParams(location.search);
  const selected = params.get("awtsmoosAi");
  if (selected) { dom.serviceSelect.value = selected; aiHandler.switchService(selected); }
  const convo = getConversationId();
  syncPanelConversation(convo);
  if (convo) await controller.loadConversation(convo);
  await controller.refreshList(dom.conversationList);
}
