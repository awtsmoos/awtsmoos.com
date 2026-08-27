// B"H
/** Binds the Vibe chat form into the controller command stream. */
export const ChatInput = {
  bind(container, tab, controller) {
    const form = container?.querySelector?.('#vibe-chat-input-form');
    const input = container?.querySelector?.('#vibe-chat-input');
    if (!form || !input || form.dataset.bound === 'yes') return;
    form.dataset.bound = 'yes';
    form.addEventListener('submit', event => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      controller?.sendMessage?.(text, tab);
    });
  }
};
