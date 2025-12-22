
// B"H
export const TokenizerSource = () => {
    
    self.tokenizerInstance = null;

    self.tokenize = function(text) {
        if (!self.env.vocab || self.env.vocab.length === 0) return [];

        // Initialize SPM Tokenizer if not ready
        if (!self.tokenizerInstance) {
            self.logDB("Initializing SPM Tokenizer...", "info");
            if (self.SPMTokenizer) {
                // Check if add_space_prefix is defined in metadata
                let addSpace = true; // default for SPM
                if (self.env.metaKV && self.env.metaKV['tokenizer.ggml.add_space_prefix'] === false) {
                    addSpace = false;
                }
                self.logDB(`[TOKENIZER] add_space_prefix: ${addSpace}`, 'info');
                
                self.tokenizerInstance = new self.SPMTokenizer(self.env.vocab, self.env.scores, addSpace);
            } else {
                self.logDB("CRITICAL: SPMTokenizer class missing!", "error");
                return [];
            }
        }

        // Pass a logger that wraps logDB but marks it as tokenizer
        const logger = (msg) => self.logDB(msg, 'read');
        return self.tokenizerInstance.tokenize(text, logger);
    };
};
