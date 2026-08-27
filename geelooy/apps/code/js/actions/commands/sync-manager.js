// B"H
export default async function run() {
    const { FolderSync } = await import('../../sync/folder-sync.js');
    return FolderSync.showManager();
}
