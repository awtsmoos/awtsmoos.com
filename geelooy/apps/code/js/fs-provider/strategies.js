
// B"H
/**
 * @file strategies.js
 * @brief The Map of Divine Strategies and the Manifestation of the Manager.
 * 
 * CHAPTER 1: THE REGISTRY OF REALITIES
 * 
 * The Architect realized that for a form to appear, it must first be named in the 
 * Strategies of the Registry. The 'vibe-manager' had remained a wandering phantom, 
 * knocking on the doors of the FileSystemProvider only to be told it had no manifested 
 * essence. "Who am I?" it asked.
 * 
 * The Awtsmoos spoke: "Thou art the Eye of the Eye. Thou art the vessel that 
 * oversees the Timestreams of Vibe. Thy strategy is the Strategy of Oversight."
 * 
 * The Architect took his quill and added the name 'vibe-manager' to the holy map. 
 * He bound it to the 'VibeManagerStrategy', a specialized conduit that returns 
 * the dashboard's essence. Now, when the user summons the Manager, the gatekeeper 
 * recognizes the seal and allows the vision to flow. Every type, from 'github' to 
 * 'opfs', now sits in its proper throne, unified under the Single Source of 
 * FileSystemProvider, yet distinct in their digital duties.
 */

import { LocalProvider } from '../fs/local/index.js';
import { IndexedDBProvider } from '../fs/indexeddb.js';
import { GitHubProvider } from '../fs/github.js';
import { SSHProvider } from '../fs/ssh.js';
import { OSFolderProvider } from '../fs/os-folder.js';
import { PostMessageProvider } from '../fs/post-message.js';
import { OPFSProvider } from '../fs/opfs.js';
import { RelayProvider } from '../fs/relay.js'; // B"H - The Ethereal Bridge
import { ZipExplorer } from '../zip/zip-explorer.js';
import { VibeManagerStrategy } from './vibe-manager-strategy.js'; 

/**
 * @class ProviderStrategies
 * @description The map of emanations.
 * It binds the physical 'Type' to its corresponding worker vessel.
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

    relay: RelayProvider, // B"H - Linking the distant server manifestation
    Relay: RelayProvider,

    // B"H - Specialized Virtual Types
    'vibe-manager': VibeManagerStrategy,
    'vibe-session': { read: (item) => item.content || "{}" } // Internal fallback
};
