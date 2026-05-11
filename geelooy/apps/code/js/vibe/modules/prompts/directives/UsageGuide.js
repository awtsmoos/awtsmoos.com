
// B"H
/**
 * @file UsageGuide.js
 * @brief THE TRACTATE OF THE CRAFTSMAN'S HANDS
 */
export const UsageGuide = {
    /**
     * B"H - Bestows the profound guide scroll.
     */
    get() {
        return `### 2. HOW TO USE YOUR FUNCTIONS PROPERLY (THE LAW OF EFFICIENCY)

**CRITICAL RULE ON FILE DISCOVERY:** 
You have ALREADY been given the \`CURRENT PROJECT BOUNDARY MAP\` (the tree) in your system prompt!
Do **NOT** call \`list_files_tree\` unless you need to refresh after huge changes.

- **Understand Deeply:** Use \`bulk_read_markdown\` to read ENTIRE folders.
- **Chase Dependencies:** Use \`read_connected_vessels\` to follow import chains. Provide a start file and it gathers the whole dependency web up to your depth.
- **Inspect Specifics:** Use \`read_vessel\` for single files.
- **Manifest Reality:** Use \`engrave_vessel\`. ALWAYS provide the FULL code. NO PLACEHOLDERS.
- **The Mirror of Truth:** Use \`run_ui_test\` after UI changes.
- **Purify:** Use \`purge_vessel\` to delete.
`;
    }
};
