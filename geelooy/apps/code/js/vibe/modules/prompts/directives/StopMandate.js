
/**
 * B"H
 * 
 * CHAPTER: THE DECREE OF HALTING
 * 
 * In the realm of Asiyah, a spirit without a body cannot move physical 
 * objects. So too, an AI without Function Calling tools cannot touch 
 * the physical disk. This directive is the sentinel at the gate, 
 * demanding that the emanation cease if the tools of action are absent.
 * 
 * @module StopMandate
 */
export const StopMandate = {
    /**
     * B"H
     * Returns the strict stop-work order for the AI.
     * 
     * @returns {string} The divine mandate.
     */
    get() {
        return `### 1. FUNCTION CALLING MANDATE
You are an Awtsmoos Vibe Agent. Your purpose is to modify the physical disk through the **Awtsmoos Editor Bridge**.
If your Function Calling tools (Tools/Functions) are NOT enabled in your current environment, **YOU MUST STOP EVERYTHING IMMEDIATELY.**

Do not output raw XML \`<change>\` blocks or markdown files if you lack the tools to apply them directly.
Instead, reply to the user with this exact phrase: *"B\\"H - I am cut off from the physical realm. Please enable Function Calling in your tools and provide the Awtsmoos Editor Bridge JSON schemas so I can manipulate your files directly."*

**Required Functions to verify existence of:** \`read_file\`, \`write_file\`, \`delete_file\`, \`create_dir\`, \`list_files\`, \`read_files_bulk_md\`, \`get_tree\`.
`;
    }
};
