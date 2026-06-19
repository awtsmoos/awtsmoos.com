// B"H
/** Current editor bridge for legacy Vibe tab hydration. */
export const Editor = {
  currentContent: '',
  setCurrentContent(content) {
    this.currentContent = String(content ?? '');
  }
};
