// B"H
/**
 * @file terminal/commands/archive.js
 * @brief ZIP and unzip virtual-terminal commands with repo-relative archive imports.
 */
import { FileSystemProvider } from '../../fs-provider.js';
import { ZipFile } from '/scripts/awtsmoos/zip/encoder.js';
import { ZipReader } from '/scripts/awtsmoos/zip/decoder.js';

async function addItemToZip(zip, item, pathInZip) {
    if (item.kind === 'directory') {
        zip.addFolder(pathInZip);
        const listed = await FileSystemProvider.list(item);
        for (const child of listed?.entries || []) {
            await addItemToZip(zip, child, `${pathInZip}/${child.name}`);
        }
        return;
    }

    const content = await FileSystemProvider.read(item);
    const bytes = content instanceof Blob
        ? new Uint8Array(await content.arrayBuffer())
        : new TextEncoder().encode(String(content));
    zip.addFile(pathInZip, bytes);
}

export const ArchiveCommands = {
    /**
     * Creates a zip archive from virtual filesystem vessels.
     *
     * @param {object} shell Virtual terminal shell.
     * @param {Array<string>} args Command arguments.
     * @returns {Promise<string>} Command report.
     */
    async zip(shell, args) {
        if (args.length < 2) throw new Error("usage: zip out.zip file1 [file2...]");
        const zipName = args.shift();
        const zip = new ZipFile();

        for (const fileName of args) {
            const item = await shell.resolveItem(fileName);
            await addItemToZip(zip, item, item.name);
        }

        const blob = zip.build();
        await shell.writeToFile(zipName, blob);
        return `Zipped ${args.length} files into ${zipName}`;
    },

    /**
     * Extracts a zip archive into a target virtual directory.
     *
     * @param {object} shell Virtual terminal shell.
     * @param {Array<string>} args Command arguments.
     * @returns {Promise<string>} Command report.
     */
    async unzip(shell, args) {
        if (args.length < 1) throw new Error("usage: unzip file.zip [target_dir]");
        const zipFile = args[0];
        const targetPath = args[1] || '.';
        const targetDir = await shell.resolveItem(targetPath);

        const zipItem = await shell.resolveItem(zipFile);
        const blob = await FileSystemProvider.read(zipItem);

        const reader = new ZipReader();
        await reader.load(blob);
        const entries = reader.getEntries();

        for (const entry of entries) {
            if (entry.isDir) {
                await FileSystemProvider.create(targetDir, entry.filename, 'directory');
            } else {
                const data = await entry.getData();
                await FileSystemProvider.create(targetDir, entry.filename, 'file');
                const fileItem = await shell.resolveItem(targetPath + '/' + entry.filename);
                await FileSystemProvider.write(fileItem, data);
            }
        }
        return `Extracted ${entries.length} items to ${targetDir.name}`;
    }
};
