
// B"H
/**
 * Tokenizer
 * Implements Longest Prefix Match with Byte Fallback for Gemma/Llama.
 */
import { getVocab } from './model_loader.js';

export function tokenize(text) {
    const vocab = getVocab();
    const tokens = [];
    
    if (!vocab || vocab.length === 0) {
        console.error("Tokenizer: Vocab empty");
        return [2]; // Return Gemma BOS (2)
    }

    // Helper: Find ID
    const findId = (str) => {
        let id = vocab.indexOf(str);
        if (id !== -1) return id;
        // Try SPIECE underscore
        id = vocab.indexOf('\u2581' + str);
        if (id !== -1) return id;
        return -1;
    };

    // Helper: Byte Token <0xXX>
    const getByteToken = (charStr) => {
        const code = charStr.charCodeAt(0);
        const hex = code.toString(16).toUpperCase().padStart(2, '0');
        const token = `<0x${hex}>`;
        return vocab.indexOf(token);
    };

    let buffer = text;
    
    while (buffer.length > 0) {
        let match = null;
        let matchLen = 0;
        let matchId = -1;

        // Search window
        const chunk = buffer.substring(0, 48); 
        
        for (let len = chunk.length; len > 0; len--) {
            const candidate = chunk.substring(0, len);
            
            // 1. Direct match or Space prefix match
            const id = findId(candidate);
            
            if (id !== -1) {
                match = candidate;
                matchLen = len;
                matchId = id;
                break;
            }
        }
        
        if (match) {
            tokens.push(matchId);
            buffer = buffer.substring(matchLen);
        } else {
            // Fallback: Byte Token or Unknown
            const char = buffer[0];
            const byteId = getByteToken(char);
            
            if (byteId !== -1) {
                tokens.push(byteId);
            } else {
                // Try just the raw char if it exists (rare)
                const rawId = vocab.indexOf(char);
                if (rawId !== -1) tokens.push(rawId);
                else {
                    const unk = vocab.indexOf('<unk>');
                    if (unk !== -1) tokens.push(unk);
                }
            }
            buffer = buffer.substring(1);
        }
    }

    // BOS is handled by the worker based on model type.
    // We return raw tokens of the input text here.
    return tokens;
}
