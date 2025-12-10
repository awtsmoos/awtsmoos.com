//B"H
// modules/network.js
// THE NEXUS - AGGREGATOR

import { YEARS } from './store.js';
import { fetchYearFolders, fetchFolderTracks } from './network/archive.js';
import { fetchBlob } from './network/transport.js';
import { searchArchive } from '../search.js';

export { fetchBlob };

export async function fetchIndex() {
    return YEARS;
}

export async function fetchYear(yearKey) {
    const archiveId = YEARS[yearKey];
    if (!archiveId) throw new Error(`NEXUS ERROR: Year ${yearKey} invalid`);
    return await fetchYearFolders(archiveId);
}

export async function fetchFolder(yearKey, folderName) {
    const archiveId = YEARS[yearKey];
    if (!archiveId) throw new Error(`NEXUS ERROR: Year ${yearKey} invalid`);
    return await fetchFolderTracks(archiveId, folderName);
}

export const search = searchArchive;