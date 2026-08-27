// B"H
/** Minimal tab registry for preview-safe legacy Vibe timeline operations. */
export const Tabs = {
  items: [],
  create(item, activate = true, dirty = false, temporary = false) {
    const tab = {
      id: `tab_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      item,
      content: item?.content ?? '',
      isDirty: Boolean(dirty),
      temporary: Boolean(temporary)
    };
    this.items.push(tab);
    if (globalThis.document && globalThis.CustomEvent) {
      if (globalThis.document && globalThis.CustomEvent) {
      document.dispatchEvent(new CustomEvent('awtsmoos:tabs:create', { detail: { tab, activate } }));
    }
    }
    return tab;
  }
};
