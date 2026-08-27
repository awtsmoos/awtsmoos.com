
// B"H
/**
 * @file strategies.js
 * @brief The Map of Divine Strategies.
 */

import { LocalProvider } from '../fs/local/index.js';
import { IndexedDBProvider } from '../fs/indexeddb.js';
import { GitHubProvider } from '../fs/github.js';
import { SSHProvider } from '../fs/ssh.js';
import { OSFolderProvider } from '../fs/os-folder.js';
import { PostMessageProvider } from '../fs/post-message.js';
import { OPFSProvider } from '../fs/opfs.js'; 
import { RelayProvider } from '../fs/relay.js';
import { AwtsmoosOSProvider } from '../fs/awtsmoos-os.js';
import { ZipExplorer } from '../zip/zip-explorer.js';
import { VibeManagerStrategy } from './vibe-manager-strategy.js'; 

const VirtualNullStrategy = {
    read: async (item) => item.content || "",
    write: async () => true,
    list: async () => [],
    delete: async () => true
};

/**
 * @class ProviderStrategies
 * @description Binds the physical 'Type' to its corresponding worker vessel.
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
    PostMessage: PostMessageProvider,

    relay: RelayProvider,
    Relay: RelayProvider,

    'awtsmoos-os': AwtsmoosOSProvider,
    AwtsmoosOS: AwtsmoosOSProvider,

    // B"H - Virtual Strategies for UI Vessels
    'vibe-manager': VibeManagerStrategy,
    'vibe-session': VirtualNullStrategy,
    'devtools': VirtualNullStrategy, 
    'html-preview-file': VirtualNullStrategy,
    'browser': VirtualNullStrategy
};
