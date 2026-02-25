
// B"H
// FILE: js/terminal/commands/archive.js
import { FileSystemProvider } from '../../fs-provider.js';
import { ZipFile } from '/scripts/awtsmoos/zip/encoder.js';
import { ZipReader } from '/scripts/awtsmoos/zip/decoder.js';

export const ArchiveCommands = {
    async zip(shell, args) {
        if (args.length < 2) throw new Error("zip: usage: zip out.zip file1 [file2...]");
        const zipName = args.shift();
        const zip = new ZipFile();

        for (const fileName of args) {
            const item = await shell.resolveItem(fileName);
            const content = await FileSystemProvider.read(item);
            const bytes = (content instanceof Blob) ? new Uint8Array(await content.arrayBuffer()) : new TextEncoder().encode(String(content));
            zip.addFile(item.name, bytes);
        }

        const blob = zip.build();
        await shell.writeToFile(zipName, blob);
        return `Zipped ${args.length} files into ${zipName}`;
    },

    async unzip(shell, args) {
        if (args.length < 1) throw new Error("unzip: usage: unzip file.zip [target_dir]");
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
