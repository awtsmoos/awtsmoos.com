
// B"H
// FILE: js/terminal/help-text.js

export const DetailedHelp = {
    header: `<div class="terminal-welcome">Awtsmoos Terminal Help System\nRevealing the functionality of the vessels.</div>`,
    
    commands: {
        ls: `<b>ls [path]</b>\nList directory contents.\n  -a : Show hidden entries (if applicable).\n  -l : Detailed view (shows kind and size).`,
        cd: `<b>cd [path]</b>\nChange the current working directory.\n  .. : Go to parent folder.\n  /  : Go to global Workspaces root.`,
        pwd: `<b>pwd</b>\nPrint the absolute path of the current directory.`,
        mkdir: `<b>mkdir [dir_name]</b>\nCreate a new directory vessel in the current location.`,
        touch: `<b>touch [file_name]</b>\nCreate a new empty file vessel.`,
        rm: `<b>rm [-rf] [path]</b>\nRemove files or directories.\n  -rf : Recursive force (deletes folders and their content).`,
        cp: `<b>cp [src] [dst]</b>\nCopy source file to destination.`,
        mv: `<b>mv [src] [dst]</b>\nMove or rename a file/directory.`,
        cat: `<b>cat [file]</b>\nRead and print the entire contents of a file.`,
        echo: `<b>echo [text] [> file]</b>\nDisplay text or redirect it to create/overwrite a file.`,
        head: `<b>head [-n count] [file]</b>\nShow the first few lines of a file. Default is 10.`,
        tail: `<b>tail [-n count] [file]</b>\nShow the last few lines of a file. Default is 10.`,
        grep: `<b>grep [pattern] [file]</b>\nSearch for a specific string pattern within a file.`,
        wc: `<b>wc [file]</b>\nPrint line, word, and byte counts for a file.`,
        dd: `<b>dd if=[file] skip=[offset] count=[length]</b>\nRead file data at a specific byte offset.`,
        stat: `<b>stat [path]</b>\nDisplay detailed metadata about a file or folder.`,
        zip: `<b>zip [zip_name.zip] [file1] [file2...]</b>\nCompress specified files into a new ZIP archive.`,
        unzip: `<b>unzip [zip_name.zip] [target_dir]</b>\nExtract the contents of a ZIP archive.`,
        git: `<b>git [subcommand]</b>\nInteract with the repository timeline.\n  init : Initialize a new repo.\n  status : Show changes.\n  add [file] : Stage changes.\n  commit -m "msg" : Save staged changes.\n  push : Manifest changes to remote.`,
        open: `<b>open [path]</b>\nManifest the item in the Editor (if file) or Commander (if folder).`,
        clear: `<b>clear</b>\nPurge the terminal output buffer.`,
        history: `<b>history</b>\nShow the scroll of previous commands.`,
        uptime: `<b>uptime</b>\nShow how long the current session has been active.`,
        whoami: `<b>whoami</b>\nReveal the current identity in the system.`
    },

    getGeneralHelp() {
        let text = this.header + "\nAvailable Commands:\n";
        const keys = Object.keys(this.commands).sort();
        for (let i = 0; i < keys.length; i += 4) {
            text += "  " + keys.slice(i, i + 4).join("\t\t") + "\n";
        }
        text += "\nType 'help [command]' for deep details.";
        return text;
    }
};
