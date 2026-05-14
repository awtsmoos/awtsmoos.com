Find every call shaped like:

FileSystemProvider.readDir(dirItem)

Replace with:

FileSystemProvider.list(dirItem)

Reason:
fs-provider.js exposes list/read/write/create/delete/listAllFiles, not readDir.
Using readDir can break AI set-working-directory or directory navigation tools.