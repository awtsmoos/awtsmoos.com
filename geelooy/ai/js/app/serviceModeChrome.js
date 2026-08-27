// B"H
import { updateSearchParams } from "./urlState.js";

/** One chrome gate for provider and ChatGPT mode changes. */
export function syncChatGptModeChrome(dom) {
  if (!dom?.chatgptModeWrap) return;
  dom.chatgptModeWrap.hidden = dom.serviceSelect?.value !== "chatgpt";
}

export async function resetForServiceMode({ value, aiHandler, controller, panel, dom, mode }) {
  if (!value) return;
  if (mode) aiHandler.setChatGPTMode(value);
  else aiHandler.switchService(value);
  syncChatGptModeChrome(dom);
  updateSearchParams({
    [mode ? "awtsmoosChatGPTMode" : "awtsmoosAi"]: value,
    awtsmoosConversation: null
  });
  await controller.newConversation();
  panel.setConversationId(null);
  await controller.refreshList();
}
