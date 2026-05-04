
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

**Example:**
If the **BASE PATH** is \`/home/user/BH/project\` and you want to modify \`src/main.js\`, you MUST pass \`/home/user/BH/project/src/main.js\` to your function call.
`;
    }
};
