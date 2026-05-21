// B"H
/**
 * @file overwrite.js
 * Chapter 2: the cloud-river descends with patience.
 * Bad stones are marked and stepped around; the river keeps flowing.
 */

import { FileSystemProvider } from '../../fs-provider.js';

/**
 * B"H - Pulls selected remote blobs into the local clone with retries and skips.
 * @param {object} gitContextItem Local item inside the clone.
 * @param {object} gitInfo Clone metadata.
 * @param {object} report Fresh report from checkExternalChanges.
 * @param {Function} onStatus Receives progress text and numeric percentage.
 * @param {object} options Optional selectedPaths set.
 * @returns {Promise<object>} Pull result counts and skipped failures.
 */
export async function overwriteFromRemote(gitContextItem, gitInfo, report, onStatus = () => {}, options = {}) {
    const selectedPaths = options.selectedPaths || null;
    const shouldPull = path => !selectedPaths || selectedPaths.has(path);
    const blobs = (report.remoteTree || []).filter(node => node.type === 'blob' && shouldPull(node.path));
    const repoRoot = normalizeRoot(gitInfo.path || gitContextItem.path || '/');
    const type = gitContextItem.originalType || gitContextItem.type;
    const workspaceId = gitContextItem.workspaceId || gitInfo.workspaceId || gitContextItem.id;
    const livePaths = new Set(blobs.map(node => node.path));
    const skipped = [];
    let written = 0;
    let removed = 0;

    for (let i = 0; i < blobs.length; i++) {
        const node = blobs[i];
        const percent = Math.round((i / Math.max(blobs.length, 1)) * 85);
        onStatus(`Downloading ${node.path}`, percent);
        const ok = await pullOneBlob(node, gitInfo, repoRoot, type, workspaceId, skipped, onStatus);
        if (ok) written++;
    }

    for (const oldNode of (gitInfo.remoteTree || []).filter(node => node.type === 'blob')) {
        if (livePaths.has(oldNode.path) || !shouldPull(oldNode.path)) continue;
        onStatus(`Removing ${oldNode.path}`, 90);
        try {
            await withRetries(() => FileSystemProvider.delete(localFile(repoRoot, oldNode.path, type, workspaceId)), oldNode.path, 'delete');
            removed++;
        } catch (error) {
            skipped.push({ path: oldNode.path, phase: 'delete', message: error.message || String(error) });
            console.warn('[GitPull] Skipped delete:', oldNode.path, error);
        }
    }

    if (!selectedPaths && skipped.length === 0) {
        onStatus('Writing clone metadata...', 96);
        await writeIkar(gitContextItem, gitInfo, report, repoRoot, type, workspaceId);
    } else if (skipped.length > 0) {
        onStatus(`Pull finished with ${skipped.length} skipped item(s); metadata kept at previous commit.`, 96);
    } else {
        onStatus('Partial pull finished; metadata kept at previous commit.', 96);
    }

    return { written, removed, skipped, commit: (!selectedPaths && skipped.length === 0) ? report.latestSHA : gitInfo.baseCommitSHA };
}

async function pullOneBlob(node, gitInfo, repoRoot, type, workspaceId, skipped, onStatus) {
    try {
        const content = await withRetries(() => readRemoteBlob(gitInfo.repoInfo, node.sha), node.path, 'download');
        await withRetries(() => FileSystemProvider.write(localFile(repoRoot, node.path, type, workspaceId), content), node.path, 'write');
        return true;
    } catch (error) {
        skipped.push({ path: node.path, phase: 'pull', message: error.message || String(error) });
        onStatus(`Skipped ${node.path}: ${error.message || error}`, 90);
        console.warn('[GitPull] Skipped file:', node.path, error);
        return false;
    }
}

async function withRetries(operation, path, phase, maxAttempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.warn(`[GitPull] ${phase} failed for ${path}, attempt ${attempt}/${maxAttempts}`, error);
            if (attempt < maxAttempts) await delay(250 * attempt);
        }
    }
    throw lastError;
}

async function readRemoteBlob(repoInfo, sha) {
    const blob = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs/${sha}`);
    if (blob.encoding !== 'base64') return String(blob.content || '');
    return base64ToBlob(String(blob.content || '').replace(/\s/g, ''));
}

function base64ToBlob(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes]);
}

function localFile(repoRoot, relativePath, type, workspaceId) {
    return {
        path: `${repoRoot === '/' ? '' : repoRoot}/${relativePath}`,
        name: relativePath.split('/').pop(),
        kind: 'file',
        type,
        originalType: type,
        workspaceId
    };
}

async function writeIkar(gitContextItem, gitInfo, report, repoRoot, type, workspaceId) {
    const nextInfo = {
        ...gitInfo,
        baseCommitSHA: report.latestSHA,
        remoteTree: report.remoteTree,
        isClone: true
    };
    Object.assign(gitInfo, nextInfo);
    const content = `// B"H\n\nconst ikar = ${JSON.stringify(nextInfo, null, 4)};`;
    await FileSystemProvider.write(localFile(repoRoot, '.awtsmoos-repo/ikar.js', type, workspaceId), content);
}

function normalizeRoot(path) {
    const root = String(path || '/').replace(/\\/g, '/').replace(/\/+$/, '');
    return root || '/';
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
