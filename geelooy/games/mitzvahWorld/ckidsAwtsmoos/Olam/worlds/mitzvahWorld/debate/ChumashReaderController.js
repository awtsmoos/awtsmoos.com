/**
 * B"H
 * @file ChumashReaderController.js
 *
 * Chapter 15: The Book That Opens In The Player's Hand.
 *
 * A tiny pure controller for reading Chumash inventory items. It does not
 * render panels; it gives UI code stable snapshots for mobile sheets,
 * desktop sidebars, and debate preparation.
 */

import { CHUMASH_PASSAGES } from '../data/manifests/ChumashPassages.js';

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

export class ChumashReaderController {
  constructor({ passages = CHUMASH_PASSAGES } = {}) {
    this.passages = passages;
    this.book = null;
    this.currentPassageId = null;
  }

  openBook(item) {
    if (!item?.readable || !Array.isArray(item.passageIds)) {
      throw new Error('Inventory item is not a readable Chumash.');
    }
    this.book = copy(item);
    this.currentPassageId = item.passageIds[0] || null;
    return this.snapshot();
  }

  listPassages() {
    if (!this.book) return [];
    return this.book.passageIds
      .map(id => this.passages[id])
      .filter(Boolean)
      .map(passage => ({ id: passage.id, ref: passage.ref, book: passage.book }));
  }

  openPassage(passageId) {
    if (!this.book?.passageIds?.includes(passageId)) {
      throw new Error(`Passage is not in this Chumash: ${passageId}`);
    }
    this.currentPassageId = passageId;
    return copy(this.passages[passageId]);
  }

  listPirushim(passageId = this.currentPassageId) {
    const passage = this.passages[passageId];
    if (!passage?.pirushim) return [];
    return Object.entries(passage.pirushim).map(([type, data]) => ({ type, ...copy(data) }));
  }

  close() {
    const beforeClose = this.snapshot();
    this.book = null;
    this.currentPassageId = null;
    return beforeClose;
  }

  snapshot() {
    return {
      book: this.book ? copy(this.book) : null,
      currentPassageId: this.currentPassageId,
      passages: this.listPassages(),
      pirushim: this.listPirushim()
    };
  }
}

export default ChumashReaderController;
