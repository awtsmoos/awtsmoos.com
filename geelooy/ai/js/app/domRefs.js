// B"H
/**
 * The DOM is the map of vessels; each id is found, never imagined.
 */
export function collectDom() {
  return {
    main: query(".main"),
    chatBox: id("chat-box"),
    newChat: id("new-chat"),
    messageInput: id("message-input"),
    sendButton: id("send-button"),
    sidebar: id("sidebar"),
    toggleSidebar: id("toggle-sidebar"),
    conversationList: id("conversation-items"),
    refreshButton: id("refresh-conversations"),
    serviceSelect: id("ai-service-select"),
    chatgptModeWrap: id("chatgpt-mode-wrap"),
    chatgptModeSelect: id("chatgpt-mode-select"),
    automationPanel: id("automation-panel"),
    leftResizer: id("left-resizer"),
    rightResizer: id("right-resizer"),
    composerResizer: id("composer-resizer"),
    attachmentTray: id("attachment-tray"),
    attachmentInput: id("attachment-input"),
    transportStatus: id("transport-status"),
    sessionPanel: id("awtsmoos-session-panel")
  };
}

function id(value) { return document.getElementById(value); }
function query(value) { return document.querySelector(value); }
