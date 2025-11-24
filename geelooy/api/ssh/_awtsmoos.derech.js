// B"H
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// A helper to execute shell commands
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
            if (error) {
                // For SSH, "Permission denied" often goes to stderr
                reject(new Error(`Exec error: ${error.message}\nStderr: ${stderr}`));
                return;
            }
            resolve(stdout.trim());
        });
    });
}

// A helper to safely escape arguments for cmd.exe
function shellescape(arg) {
    if (/[^A-Za-z0-9_\/:=.-]/.test(arg)) {
        return `"${arg.replace(/"/g, '""')}"`;
    }
    return arg;
}

module.exports = async ($i) => {
    // Standard options for SSH to avoid getting stuck on prompts
    const getSshOptions = () => {
        // -n redirects stdin from /dev/null, which is needed to stop ssh from consuming the password echo prematurely
        return `-n -o "StrictHostKeyChecking=no" -o "ConnectTimeout=10" -o "PasswordAuthentication=yes"`;
    };

    const getCommandPrefix = (password) => {
        // This creates the 'echo "password" |' part of the command
        return `echo ${shellescape(password)} |`;
    };

    await $i.use({
        "/connect/:username/:host": async vars => {
            const { username, host } = vars;
            const password = $i.$_POST.password;
            if (!password) return { success: false, message: "Password is required." };

            try {
                const prefix = getCommandPrefix(password);
                const sshOpts = getSshOptions();
                const remoteAddr = `${shellescape(username)}@${shellescape(host)}`;
                const command = `${prefix} ssh ${sshOpts} ${remoteAddr} "echo Connection successful"`;
                
                const message = await executeCommand(command);
                if (message.includes("Connection successful")) {
                    return { success: true, message: "Connection successful!" };
                }
                return { success: false, message: "Connection failed. Check credentials." };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },

        "/getFolderList/:username/:host": async vars => {
            const { username, host } = vars;
            const password = $i.$_POST.password;
            const folderPath = $i.$_POST.folderPath || '.';

            try {
                const prefix = getCommandPrefix(password);
                const sshOpts = getSshOptions();
                const remoteAddr = `${shellescape(username)}@${shellescape(host)}`;
                const lsCommand = `ls -l ${shellescape(folderPath)}`;
                const command = `${prefix} ssh ${sshOpts} ${remoteAddr} ${lsCommand}`;
                
                const output = await executeCommand(command);

                const files = output.split(/[\r\n]+/).slice(1).map(line => {
                    const parts = line.split(/\s+/);
                    if (parts.length < 9) return null;
                    const type = parts[0][0];
                    const name = parts.slice(8).join(' ');
                    return { name, kind: type === 'd' ? 'directory' : 'file' };
                }).filter(Boolean);

                return { success: true, files };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },
        
        "/getFileContent/:username/:host": async vars => {
            const { username, host } = vars;
            const password = $i.$_POST.password;
            const filePath = $i.$_POST.filePath;

            try {
                const prefix = getCommandPrefix(password);
                const sshOpts = getSshOptions();
                const remoteFile = `${shellescape(username)}@${shellescape(host)}:${shellescape(filePath)}`;
                // Reading a file with SCP is difficult this way, so we use ssh and cat instead.
                const command = `${prefix} ssh ${sshOpts} ${shellescape(username)}@${shellescape(host)} "cat ${shellescape(filePath)}"`;

                const content = await executeCommand(command);
                return { success: true, content };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },

        "/writeFile/:username/:host": async vars => {
            const { username, host } = vars;
            const password = $i.$_POST.password;
            const filePath = $i.$_POST.filePath;
            const content = $i.$_POST.content;

            // This is the more complex process for writing files
            const tempDir = os.tmpdir();
            const tempFileName = `awtsmoos-upload-${crypto.randomBytes(6).toString('hex')}`;
            const tempFilePath = path.join(tempDir, tempFileName);

            try {
                // 1. Write content to a local temp file
                await fs.writeFile(tempFilePath, content);
                
                // 2. Use SCP to copy the file
                const prefix = getCommandPrefix(password);
                const sshOpts = getSshOptions();
                const remoteFile = `${shellescape(username)}@${shellescape(host)}:${shellescape(filePath)}`;
                const command = `${prefix} scp ${sshOpts} ${shellescape(tempFilePath)} ${remoteFile}`;

                await executeCommand(command);
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            } finally {
                // 3. IMPORTANT: Delete the local temp file
                await fs.unlink(tempFilePath).catch(err => {
                    console.error(`Failed to delete temporary upload file: ${tempFilePath}`, err);
                });
            }
        },
        
        "/makeFolder/:username/:host": async vars => {
            const { username, host } = vars;
            const password = $i.$_POST.password;
            const folderPath = $i.$_POST.folderPath; // This is the full path of the new folder

            if (!password || !folderPath) {
                return { success: false, message: "Password and folderPath are required." };
            }

            try {
                const prefix = getCommandPrefix(password);
                const sshOpts = getSshOptions();
                const remoteAddr = `${shellescape(username)}@${shellescape(host)}`;
                // The `mkdir -p` command creates parent directories as needed, which is very useful.
                const mkdirCommand = `mkdir -p ${shellescape(folderPath)}`;
                const command = `${prefix} ssh ${sshOpts} ${remoteAddr} ${mkdirCommand}`;
                
                await executeCommand(command);
                return { success: true, message: `Folder created at ${folderPath}` };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },
        
        "/deleteAtPath/:username/:host": async vars => {
            const { username, host } = vars;
            const password = $i.$_POST.password;
            const deletePath = $i.$_POST.deletePath; // The full path of the file or folder to delete

            if (!password || !deletePath) {
                return { success: false, message: "Password and deletePath are required." };
            }

            try {
                const prefix = getCommandPrefix(password);
                const sshOpts = getSshOptions();
                const remoteAddr = `${shellescape(username)}@${shellescape(host)}`;
                // The `rm -rf` command forcefully and recursively deletes. 
                // It works for both single files and entire directories.
                const rmCommand = `rm -rf ${shellescape(deletePath)}`;
                const command = `${prefix} ssh ${sshOpts} ${remoteAddr} ${rmCommand}`;
                
                await executeCommand(command);
                return { success: true, message: `Deleted path ${deletePath}` };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },
    });
};