
// B"H
// FILE: js/fs-provider/strategies.js

import { LocalProvider } from '../fs/local/index.js';
import { IndexedDBProvider } from '../fs/indexeddb.js';
import { GitHubProvider } from '../fs/github.js';
import { SSHProvider } from '../fs/ssh.js';
import { OSFolderProvider } from '../fs/os-folder.js';
import { PostMessageProvider } from '../fs/post-message.js';
import { OPFSProvider } from '../fs/opfs.js';
import { ZipExplorer } from '../zip/zip-explorer.js';

/**
 * @class ProviderStrategies
 * @description The map of emanations.
 * It binds the physical 'Type' to its corresponding worker vessel.
 * 
 * B"H RECTIFICATION:
 * Added PascalCase aliases to ensure calls to FileSystemProvider.IndexedDB
 * or .Local do not fail when coming from legacy code or specific namespaces.
 */
export const ProviderStrategies = {
    local: LocalProvider,
    Local: LocalProvider,
    
    ssh: SSHProvider,
    SSH: SSHProvider,
    
    indexeddb: IndexedDBProvider,
    IndexedDB: IndexedDBProvider,
    
    github: GitHubProvider,
    GitHub: GitHubProvider,
    
    osfolder: OSFolderProvider,
    OSFolder: OSFolderProvider,
    
    'zip-entry': ZipExplorer.fs,
    ZipEntry: ZipExplorer.fs,
    
    opfs: OPFSProvider,
    OPFS: OPFSProvider,
    
    postmessage: PostMessageProvider,
    PostMessage: PostMessageProvider
};
