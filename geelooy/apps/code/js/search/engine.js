
// B"H
import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';

export const SearchEngine = {
    async performSearch(uiContext, query, searchContent, scopeItem) {
        let matchCount = 0;
        const lowerQuery = query.toLowerCase();

        let roots = scopeItem ? [scopeItem] : State.workspaces.map(ws => ({ ...ws, path: '/', kind: 'directory', workspaceId: ws.id }));

        for (const root of roots) {
            if (uiContext.stopSearchFlag) break;
            await this._searchRecursive(root, lowerQuery, searchContent, uiContext, (item, matchType, snippet) => {
                matchCount++;
                uiContext.onMatchFound(matchCount, item, matchType, snippet, query);
            });
        }
        
        uiContext.onSearchComplete(matchCount);
    },

    async _searchRecursive(item, query, searchContent, uiContext, onFound) {
        if (uiContext.stopSearchFlag) return;

        let children = [];
        try {
            if (['github', 'local', 'indexeddb', 'opfs'].includes(item.type)) {
                children = await FileSystemProvider.listAllFiles(item);
                
                const chunkSize = 100;
                for (let i = 0; i < children.length; i += chunkSize) {
                    if (uiContext.stopSearchFlag) return;
                    const chunk = children.slice(i, i + chunkSize);
                    await new Promise(r => setTimeout(r, 0)); 

                    for (const child of chunk) {
                        if (uiContext.stopSearchFlag) return;
                        const fullChild = { ...item, ...child }; 
                        
                        if (child.name.toLowerCase().includes(query)) {
                            onFound(fullChild, 'filename', null);
                        } else if (searchContent && child.kind === 'file') {
                            await this._checkContent(fullChild, query, onFound);
                        }
                    }
                }
                return; 
            } 
            children = await FileSystemProvider.list(item);
        } catch (e) {
            console.warn("Search iteration failed:", item.name, e);
            return;
        }

        for (const child of children) {
            if (uiContext.stopSearchFlag) return;
            const fullChild = { ...item, ...child };
            
            if (child.name.toLowerCase().includes(query)) {
                onFound(fullChild, 'filename', null);
            } else if (searchContent && child.kind === 'file') {
                await this._checkContent(fullChild, query, onFound);
            }

            if (child.kind === 'directory') {
                await this._searchRecursive(fullChild, query, searchContent, uiContext, onFound);
            }
        }
    },
    
    async _checkContent(item, query, onFound) {
        const ext = item.name.split('.').pop().toLowerCase();
        if (['png','jpg','zip','mp4','mp3','exe','bin','pdf','iso'].includes(ext)) return;
        
        try {
            const content = await FileSystemProvider.read(item);
            const text = (typeof content === 'string') ? content : (content instanceof Blob ? await content.text() : '');
            
            if (text.toLowerCase().includes(query)) {
                const idx = text.toLowerCase().indexOf(query);
                const snippet = text.substring(Math.max(0, idx - 30), Math.min(text.length, idx + 50));
                onFound(item, 'content', snippet);
            }
        } catch (e) {}
    }
};
