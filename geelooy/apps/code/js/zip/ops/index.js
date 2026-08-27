
// B"H
import { ZipExtract } from './extract.js';
import { ZipModify } from './modify.js';
import { ZipSave } from './save.js';

export const ZipOps = {
    openEntry: (t, e) => ZipExtract.openEntry(t, e),
    extractAll: (t) => ZipExtract.extractAll(t),
    
    createItem: (t, k) => ZipModify.createItem(t, k),
    createEntry: (t, p, k) => ZipModify.createEntry(t, p, k),
    deleteItem: (t, f) => ZipModify.deleteItem(t, f),
    deleteEntry: (t, f) => ZipModify.deleteEntry(t, f),
    updateEntry: (t, f, c) => ZipModify.updateEntry(t, f, c),
    
    save: (t) => ZipSave.save(t)
};
