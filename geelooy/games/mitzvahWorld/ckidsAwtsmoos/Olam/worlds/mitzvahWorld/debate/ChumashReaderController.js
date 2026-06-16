// B"H
/** @file ChumashReaderController.js @description Chumash reader without optional parser paths. */
function passages(book) { return book && Array.isArray(book.passageIds) ? book.passageIds : []; }
function passageMap(library) { return library && library.passages ? library.passages : {}; }
export class ChumashReaderController {
  constructor(library = {}, inventory = null) { this.library = library; this.inventory = inventory; this.book = null; }
  openItem(item) { if (!item || !item.readable || !Array.isArray(item.passageIds)) return false; this.book = item; return true; }
  hasPassage(passageId) { return passages(this.book).includes(passageId); }
  read(passageId) { if (!this.hasPassage(passageId)) return null; return passageMap(this.library)[passageId] || null; }
  pirushim(passageId) { const passage = this.read(passageId); if (!passage || !passage.pirushim) return []; return Object.keys(passage.pirushim); }
}
export default ChumashReaderController;
