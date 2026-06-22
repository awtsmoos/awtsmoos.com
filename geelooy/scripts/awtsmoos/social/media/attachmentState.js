// B"H
/**
 * @module AttachmentState
 * @description
 * Chapter 471: A tiny vessel remembers which uploaded sparks are about to enter
 * a post, question, answer, verse, subsection, or comment. It does not own the
 * files; it only carries manifests already born through `/api/social/assets`.
 */

export function createAttachmentState(initial = []) {
  let assets = Array.isArray(initial) ? [...initial] : [];
  const listeners = new Set();
  const snapshot = () => [...assets];
  const emit = () => listeners.forEach(listener => listener(snapshot()));
  return {
    add(asset) {
      if (!asset || !asset.id) return snapshot();
      assets = [...assets.filter(item => item.id !== asset.id), asset];
      emit();
      return snapshot();
    },
    remove(assetId) {
      assets = assets.filter(item => item.id !== assetId);
      emit();
      return snapshot();
    },
    clear() {
      assets = [];
      emit();
      return snapshot();
    },
    list: snapshot,
    toJSON() { return JSON.stringify(snapshot()); },
    onChange(listener) {
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    }
  };
}
