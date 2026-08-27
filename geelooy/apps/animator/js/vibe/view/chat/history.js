// B"H
/** Projects chat history into the Vibe panel without mutating session truth. */
export const ChatHistory = {
  render(container, history = []) {
    const mount = container?.querySelector?.('#vibe-chat-history');
    if (!mount) return null;
    mount.innerHTML = '';
    for (const entry of history) {
      const row = document.createElement('article');
      row.className = `vibe-chat-entry ${entry.role || 'system'}`;
      row.textContent = entry.content ?? entry.text ?? '';
      mount.appendChild(row);
    }
    mount.scrollTop = mount.scrollHeight;
    return mount;
  }
};
