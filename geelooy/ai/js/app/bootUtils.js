// B"H
/** Tiny boot flames: once, idle, and the waiting bubble. */
export function once(fn) {
  let pending = null;
  return (...args) => pending || (pending = Promise.resolve(fn(...args)).catch(error => {
    console.error("B\"H AI boot failed", error);
    throw error;
  }));
}

export function scheduleIdle(task) {
  const runner = () => Promise.resolve().then(task).catch(error => console.warn("Deferred AI boot task failed", error));
  if (typeof requestIdleCallback === "function") return requestIdleCallback(runner, { timeout: 1500 });
  return setTimeout(runner, 0);
}

export function createAutomationWaitBubble(chatBox) {
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
