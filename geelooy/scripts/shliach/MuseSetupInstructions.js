// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Self-contained Muse Code MCP setup without unverified automatic claims.
 * @description
 * The Awtsmoos illuminates a single known gate on Awtsmoos.com;
 * the AI configures its own client or shows the human what must be done.
 */

/**
 * Tested Muse 1.4.14 configuration, OAuth consent and verification steps.
 * Never overwrite another user's existing MCP entries or OAuth credentials.
 */
export const MUSE_SETUP_INSTRUCTIONS = `Muse Code setup if this client is Muse:
- First inspect Muse's existing MCP settings and configured servers. If awtsmoos already exists, reuse it; do not overwrite unrelated MCP entries or existing tokens.
- Otherwise MERGE the following settings into ~/.config/muse/settings.json, retaining all existing fields and servers. Create a backup before editing. The versioned Muse 1.4.14 settings format is:
{
  "schema_version": 1,
  "mcp_servers": {
    "awtsmoos": {
      "transport": "streamable_http",
      "url": "https://awtsmoos.com/api/tunnel/control/mcp",
      "enabled": true,
      "mode": "optional"
    }
  }
}
- Run muse mcp login awtsmoos in the terminal where Muse is installed. Use the existing versioned Muse executable if its update-check launcher hangs. The server supports native OAuth discovery and dynamic registration; no manual client ID should be needed by current clients.
- Present the browser authorization URL for the human to approve. Never approve on their behalf or request credentials in chat.
- After approval, inspect /mcp and complete an authenticated read-only tool call before reporting connected. If your environment cannot change files or run the CLI, show the user the exact steps rather than pretending configuration succeeded.
`;
