// B"H
/**
 * @file RuntimeRegistry.js
 * @brief Tracks virtual preview worlds without assuming a physical machine.
 */
export const RuntimeRegistry = {
    previews: new Map(),
    nextId: 1,

    create(record) {
        const id = record.id || `vibe-preview-${this.nextId++}`;
        const stamped = {
            id,
            createdAt: new Date().toISOString(),
            status: 'running',
            logs: [],
            ...record
        };
        this.previews.set(id, stamped);
        return stamped;
    },

    get(id) {
        return this.previews.get(id) || null;
    },

    list() {
        return [...this.previews.values()].map(preview => ({
            id: preview.id,
            kind: preview.kind,
            status: preview.status,
            url: preview.url,
            projectPath: preview.projectPath,
            entry: preview.entry,
            port: preview.port || null,
            createdAt: preview.createdAt
        }));
    },

    appendLog(id, text) {
        const preview = this.get(id);
        if (!preview) return false;
        preview.logs.push(String(text));
        preview.logs = preview.logs.slice(-300);
        return true;
    },

    stop(id) {
        const preview = this.get(id);
        if (!preview) return null;
        preview.status = 'stopped';
        if (preview.objectUrl && URL?.revokeObjectURL) {
            try { URL.revokeObjectURL(preview.objectUrl); } catch (e) {}
        }
        return preview;
    }
};
