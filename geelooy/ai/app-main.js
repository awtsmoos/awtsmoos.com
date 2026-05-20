//B"H
import AIServiceHandler from "./aiService.js";
import { MessageRenderer } from "./js/render/messageRenderer.js";
import { AutomationSettingsStore } from "./js/automation/settingsStore.js";
import { AutomationPipeline } from "./js/automation/pipeline.js";
import { AutomationPanel } from "./js/automation/panel.js";
import { ConversationController } from "./js/app/conversationController.js";
import { getConversationId, updateSearchParams } from "./js/app/urlState.js";
import { LayoutController } from "./js/layout/layoutController.js";
import { AttachmentTray } from "./js/attachments/attachmentTray.js";
import { ComposerAutosize } from "./js/forms/composerAutosize.js";

/**
 * Chapter 1: The cockpit gathers its organs in order.
 * The Awtsmoos gives each module its own vessel, then breathes one flow into
 * them: layout, attachments, composer, renderer, controller, automation.
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
  const controller = new ConversationController({ aiHandler, renderer, serviceSelect: dom.serviceSelect });
  const store = new AutomationSettingsStore();
  const panel = new AutomationPanel({ root: dom.automationPanel, store });
  const pipeline = new AutomationPipeline({ settingsStore: store, getSettings: () => panel.getSettings(), sendPrompt: prompt => sendFromText(prompt), report: text => panel.report(text) });

  wireChrome({ dom, controller, aiHandler, pipeline, sendFromText });
  await bootstrapFromUrl({ dom, aiHandler, controller });

  async function sendFromText(text = dom.messageInput.value) {
    const prompt = String(text || "").trim();
    if (!prompt) return null;
    dom.messageInput.value = "";
    composerAutosize.resize();
    return await controller.send(prompt, { attachments: attachments.consume(), ondone: reply => pipeline.afterAssistantReply(reply) });
  }

  window.sendMessageToAi = sendFromText;
});

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

function wireChrome({ dom, controller, aiHandler, pipeline, sendFromText }) {
  dom.toggleSidebar.onclick = () => dom.sidebar.classList.toggle("hidden");
  dom.refreshButton.onclick = () => controller.refreshList(dom.conversationList);
  dom.newChat.onclick = () => { pipeline.reset(); controller.newConversation(); };
  dom.sendButton.onclick = () => sendFromText();
  dom.messageInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) sendFromText();
  });
  dom.serviceSelect.onchange = async event => {
    aiHandler.switchService(event.target.value);
    updateSearchParams({ awtsmoosAi: event.target.value, awtsmoosConversation: null });
    await controller.newConversation();
    await controller.refreshList(dom.conversationList);
  };
}

async function bootstrapFromUrl({ dom, aiHandler, controller }) {
  const params = new URLSearchParams(location.search);
  const selected = params.get("awtsmoosAi");
  if (selected) { dom.serviceSelect.value = selected; aiHandler.switchService(selected); }
  const convo = getConversationId();
  if (convo) await controller.loadConversation(convo);
  await controller.refreshList(dom.conversationList);
}
