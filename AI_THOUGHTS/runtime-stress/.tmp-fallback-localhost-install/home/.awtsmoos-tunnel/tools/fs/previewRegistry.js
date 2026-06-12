// B"H

const previews = new Map();
let nextId = 1;

function create(record) {
    const id = record.id || `preview-${nextId++}`;
    const preview = {
        id,
        createdAt: new Date().toISOString(),
        status: 'running',
        ...record
    };
    previews.set(id, preview);
    return preview;
}

function get(id) {
    return previews.get(id) || null;
}

function list() {
    return [...previews.values()];
}

function stop(id) {
    const preview = get(id);
    if (!preview) return null;
    preview.status = 'stopped';
    return preview;
}

module.exports = { create, get, list, stop };
