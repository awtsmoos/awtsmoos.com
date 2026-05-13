
// B"H
/**
 * @file ProjectIntelligence.js
 * @description
 * Lightweight project map for future full agent loops.
 */

export class ProjectIntelligence {
    constructor() {
        this.files = new Map();
        this.rules = new Set([
            'Use dynamic HTML generator',
            'Avoid inline styles except geometry CSS variables',
            'Split files into small modules',
            'No placeholders',
            'Preserve existing app engines',
            'Use host adapters before creating clone runtimes'
        ]);
        this.knownContracts = new Map([
            ['TerminalRenderer', 'Must expose render(tab, container) and close(tabId).'],
            ['VirtualOSAppRenderer', 'Signature: (windowState, container, desktopState, env).'],
            ['FileSystemProvider', 'Items must carry type/originalType/workspaceId/path/kind.']
        ]);
    }

    rememberFile(path, meta = {}) {
        this.files.set(path, {
            path,
            ...meta,
            updatedAt: Date.now()
        });
    }

    rememberContract(name, value) {
        this.knownContracts.set(name, value);
    }

    summarize() {
        return {
            fileCount: this.files.size,
            rules: [...this.rules],
            contracts: Object.fromEntries(this.knownContracts)
        };
    }
}

export const GlobalProjectIntelligence = new ProjectIntelligence();
