// B"H
/** Registry of authored documents. */
export class DocumentRegistry { static docs = new Map(); static set(id, doc) { this.docs.set(id, doc); return doc; } static get(id) { return this.docs.get(id); } static list() { return [...this.docs.keys()]; } }
