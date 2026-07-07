// B"H
/** @file ChumashReaderController.js @description Inventory-readable Chumash controller for UI, debate, and tests. */
import { CHUMASH_PASSAGES } from "../data/manifests/ChumashPassages.js";

function passages(book) {
  return book && Array.isArray(book.passageIds) ? book.passageIds : [];
}

function passageMap(library) {
  if (library?.passages) return library.passages;
  return library && Object.keys(library).length ? library : CHUMASH_PASSAGES;
}

function stateOf(controller) {
  return {
    book:controller.book,
    currentPassageId:controller.currentPassageId,
    currentPassage:controller.currentPassageId ? passageMap(controller.library)[controller.currentPassageId] || null : null,
    passages:controller.listPassages()
  };
}

export class ChumashReaderController {
  constructor(library = CHUMASH_PASSAGES, inventory = null) {
    this.library = library;
    this.inventory = inventory;
    this.book = null;
    this.currentPassageId = null;
  }

  openItem(item) {
    if (!item || !item.readable || !Array.isArray(item.passageIds)) return false;
    this.book = item;
    if (!this.currentPassageId || !this.hasPassage(this.currentPassageId)) this.currentPassageId = item.passageIds[0] || null;
    return true;
  }

  openBook(item) {
    if (!this.openItem(item)) throw new Error("Item is not a readable Chumash book.");
    return stateOf(this);
  }

  hasPassage(passageId) {
    return passages(this.book).includes(passageId);
  }

  read(passageId) {
    if (!this.hasPassage(passageId)) return null;
    return passageMap(this.library)[passageId] || null;
  }

  openPassage(passageId) {
    if (!this.book) throw new Error("No Chumash book is open.");
    if (!this.hasPassage(passageId)) throw new Error(`Passage ${passageId} is not in this Chumash.`);
    const passage = this.read(passageId);
    if (!passage) throw new Error(`Passage ${passageId} is missing from the Chumash library.`);
    this.currentPassageId = passageId;
    return passage;
  }

  listPassages() {
    return passages(this.book).map(id => passageMap(this.library)[id]).filter(Boolean);
  }

  pirushim(passageId = this.currentPassageId) {
    const passage = passageId ? this.read(passageId) : null;
    if (!passage || !passage.pirushim) return [];
    return Object.keys(passage.pirushim);
  }

  listPirushim(passageId = this.currentPassageId) {
    const passage = passageId ? this.openPassage(passageId) : null;
    if (!passage?.pirushim) return [];
    return Object.entries(passage.pirushim).map(([type, value]) => ({ type, ...value }));
  }

  close() {
    this.book = null;
    return stateOf(this);
  }

  snapshot() {
    return stateOf(this);
  }
}

export default ChumashReaderController;
