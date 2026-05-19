//B"H

/**
 * B"H — A small sidebar vessel for conversation pagination.
 *
 * The Awtsmoos reveals the older chats in measured windows, not one devouring
 * flood. The list gets a previous gate above, a next gate below, and the offset
 * is carried like a quiet coordinate through the provider layer.
 */
export class ConversationListPager {
  constructor({ controller, limit = 26 } = {}) {
    this.controller = controller;
    this.limit = limit;
    this.offset = 0;
    this.total = null;
  }

  async reset(list) {
    this.offset = 0;
    this.total = null;
    await this.render(list);
  }

  async previous(list) {
    this.offset = Math.max(0, this.offset - this.limit);
    await this.render(list);
  }

  async next(list) {
    this.offset += this.limit;
    await this.render(list);
  }

  async render(list) {
    list.innerHTML = `<li class="is-loading">Loading conversations…</li>`;
    const response = await this.controller.loadConversationListWithRetries(list, {
      offset: this.offset,
      limit: this.limit
    });
    const items = Array.isArray(response?.items) ? response.items : [];
    if (Number.isFinite(response?.total)) this.total = response.total;
    list.innerHTML = "";
    if (this.offset > 0) list.appendChild(this.makeGate("previous"));
    for (const conversation of items) list.appendChild(this.makeConversation(conversation));
    if (!items.length) this.controller.renderEmptyList(list, response);
    if (this.hasNext(items)) list.appendChild(this.makeGate("next", items.length));
  }

  hasNext(items) {
    if (!items.length) return false;
    if (Number.isFinite(this.total)) return this.offset + items.length < this.total;
    return items.length >= this.limit;
  }

  makeGate(kind, count = this.limit) {
    const li = document.createElement("li");
    li.className = `conversation-page-gate is-${kind}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = kind === "previous"
      ? `Load previous ${this.limit} conversations`
      : `Load next ${count || this.limit} conversations`;
    button.onclick = () => kind === "previous"
      ? this.previous(li.parentElement)
      : this.next(li.parentElement);
    li.appendChild(button);
    return li;
  }

  makeConversation(conversation) {
    const li = document.createElement("li");
    li.textContent = conversation.title || conversation.id || "Untitled";
    li.dataset.id = conversation.id;
    if (conversation.gizmo_id) li.dataset.gizmo = conversation.gizmo_id;
    li.onclick = () => this.controller.loadConversation(conversation.id);
    return li;
  }
}
