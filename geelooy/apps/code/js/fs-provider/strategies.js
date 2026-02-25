
// B"H
// FILE: js/fs-provider/strategies.js

import { LocalProvider } from '../fs/local.js';
import { IndexedDBProvider } from '../fs/indexeddb.js';
import { GitHubProvider } from '../fs/github.js';
import { SSHProvider } from '../fs/ssh.js';
import { OSFolderProvider } from '../fs/os-folder.js';
import { PostMessageProvider } from '../fs/post-message.js';
import { OPFSProvider } from '../fs/opfs.js';
import { ZipExplorer } from '../zip/zip-explorer.js';

/**
 * @class ProviderStrategies
 * @description The Awtsmoos manifests through infinite paths. 
 * 
 * THE POEM OF THE MAPPING:
 * One light, yet refracted through seven colors,
 * One source, yet channeled through distinct rivers.
 * Here, the abstract 'Type' of the world 
 * is bound to its physical executioner.
 * We seek not through nested questions,
 * but call the worker by its true name.
 */
export const ProviderStrategies = {
    local: LocalProvider,
    ssh: SSHProvider,
    indexeddb: IndexedDBProvider,
    github: GitHubProvider,
    osfolder: OSFolderProvider,
    'zip-entry': ZipExplorer.fs,
    opfs: OPFSProvider,
    postmessage: PostMessageProvider
};
