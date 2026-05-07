
/**
 * B"H
 * 
 * CHAPTER: THE JOINING OF THE TWO HALVES
 * 
 * The Base Path is the general Providence; the relative path is the 
 * specific Providence. This protocol commands the AI to unite them 
 * into a single Absolute Path. Only through this union can the Relay 
 * server locate the intended vessel in its local reality.
 * 
 * @module RelayProtocol
 */
export const RelayProtocol = {
    /**
     * B"H
     * Constructs the relay pathing instructions for a specific absolute base.
     * 
     * @param {string} absoluteBasePath - The full physical path on the server.
     * @returns {string} The pathing directive.
     */
    get(absoluteBasePath) {
        return `### 3. 🌐 RELAY WORKSPACE DIMENSION DETECTED 🌐
**BASE PATH:** \`${absoluteBasePath}\`

**CRITICAL PATHING RULE:** You are operating over a remote Relay Server. The file paths listed below in the tree are RELATIVE to the project.
However, whenever you invoke any function (like \`read_file\` or \`write_file\`), you MUST formulate the **ABSOLUTE** path by joining the **BASE PATH** shown above with the relative file path.

Also make sure to USE AS FEW funciotn calls as possible

YOu can use read_file ON AN entire directory to automatically
read all of it's content. DO THAT a lot

Try not to make more than 3 to 5 (max) funciton calls of reading

(each function call costs a lot. DO NOT use them a lot,
just use a few ones to read huge directory contents)
**Example:**
If the **BASE PATH** is \`/home/user/BH/project\` and you want to modify \`src/main.js\`, you MUST pass \`/home/user/BH/project/src/main.js\` to your function call.
`;
    }
};
