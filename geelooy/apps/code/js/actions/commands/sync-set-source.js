// B"H
export default async function run(context) {
    const { FolderSync } = await import('../../sync/folder-sync.js');
    const item = context?.item || context?.target || context;
    return FolderSync.setSource(item);
}
