
// B"H
// FILE: js/fs/post-message.js

export const PostMessageProvider = {
    async read(item) {
        // B"H - Return hidden initial content if available (for OS load alignment)
        if (item._initialContent !== undefined) return item._initialContent;
        return item.content || ''; 
    },
    async write(item, content) {
        return new Promise((resolve, reject) => {
            window.parent.postMessage({
                type: 'saveFile',
                payload: {
                    content: content,
                    saveContext: item.saveContext
                }
            }, '*');
            const responseListener = (event) => {
                if (event.data.type === 'saveSuccess') {
                    window.removeEventListener('message', responseListener);
                    resolve();
                } else if (event.data.type === 'saveError') {
                    window.removeEventListener('message', responseListener);
                    reject(new Error(event.data.error));
                }
            };
            window.addEventListener('message', responseListener);
        });
    },
    async list(item) { throw new Error('File listing is not supported in embedded mode.'); },
    async create(parentDir, name, kind) { throw new Error('File creation is not supported in embedded mode.'); },
    async delete(item) { throw new Error('File deletion is not supported in embedded mode.'); }
};
