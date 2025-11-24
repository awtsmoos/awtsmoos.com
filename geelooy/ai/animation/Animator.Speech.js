//B"H
// Animator.Speech.js (v1.2 - Enhanced voice selection: non-female preference for males)

window.AnimatorSpeech = {
    speechSynthesis: null,
    availableVoices: [],
    isSupported: false,
    _utterances: new Map(),
    
    // Keywords that strongly indicate a FEMALE voice. Case-insensitive.
    // Add more as you discover them from your browser's voice list.
    FEMALE_VOICE_NAME_KEYWORDS: ['female', 'woman', 'girl', 'zira', 'eva', 'anna', 'susan', 'linda', 'heather', 'weiblich', 'femme', 'mujer', 'ragazza', 'kvinna', 'nainen'],

    // Keywords that might indicate a MALE voice (can still be used as a secondary check or if you want to be more specific).
    MALE_VOICE_NAME_KEYWORDS: ['male', 'man', 'david', 'paul', 'mark', 'john', 'james', 'robert', 'michael', 'william', 'tom', 'männlich', 'homme', 'hombre', 'uomo', 'manlig', 'mies'],


    initialize: function(statusUpdateCallbackForCore) {
        this.speechSynthesis = window.speechSynthesis;
        if (!this.speechSynthesis) {
            console.warn("[AnimatorSpeech] Speech Synthesis not supported.");
            if (statusUpdateCallbackForCore) statusUpdateCallbackForCore("Speech Synthesis not supported.");
            this.isSupported = false; return;
        }
        this.isSupported = true;
        const loadVoices = () => {
            this.availableVoices = this.speechSynthesis.getVoices();
            if (this.availableVoices.length > 0) {
                console.log("[AnimatorSpeech] Available TTS Voices (see name, lang, default properties):", this.availableVoices);
                if (statusUpdateCallbackForCore) statusUpdateCallbackForCore(`TTS voices loaded (${this.availableVoices.length}).`);
            } else if (statusUpdateCallbackForCore) {
                statusUpdateCallbackForCore(`TTS ready (voices may load later).`);
            }
        };
        if (this.speechSynthesis.onvoiceschanged !== undefined) this.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices(); setTimeout(loadVoices, 500); // Ensure voices are loaded
    },

    speak: function(characterId, text, voiceConfig, onEndCallback, onErrorCallback, characterGender = 'neutral') {
        if (!this.isSupported || !text) {
            if (onErrorCallback) onErrorCallback(new Error("TTS not supported or no text."));
            return null;
        }

        if (this.isSpeaking(characterId)) {
            const oldData = this._utterances.get(characterId);
            if (oldData && oldData.utterance) {
                 if (oldData.onError) oldData.onError(new Error("Speech replaced by new utterance."));
                 this._utterances.delete(characterId);
            }
        }

        const utterance = new SpeechSynthesisUtterance(text);
        let selectedVoice = null;
        const voiceLog = [`[AnimatorSpeech] Voice selection for char ${characterId} (gender: ${characterGender}):`];


        // 1. Explicit voiceName from event config (highest priority)
        if (voiceConfig?.voiceName) {
            voiceLog.push(`  Attempting explicit voice: "${voiceConfig.voiceName}"`);
            selectedVoice = this.availableVoices.find(v => v.name === voiceConfig.voiceName);
            if (!selectedVoice) voiceLog.push(`    Explicit voice not found.`);
            else voiceLog.push(`    Explicit voice found: ${selectedVoice.name}`);
        }

        // 2. Language-based selection with gender preference
        if (!selectedVoice && voiceConfig?.voiceLang) {
            const targetLang = voiceConfig.voiceLang;
            voiceLog.push(`  No explicit voice, attempting lang: "${targetLang}" with gender preference.`);
            const langMatchedVoices = this.availableVoices.filter(v => v.lang.startsWith(targetLang));
            voiceLog.push(`    Found ${langMatchedVoices.length} voices for lang ${targetLang}.`);

            if (langMatchedVoices.length > 0) {
                if (characterGender === 'male') {
                    voiceLog.push(`    Character is male. Filtering out female-keyword voices.`);
                    // Filter out voices that explicitly sound female
                    let potentialMaleVoices = langMatchedVoices.filter(v =>
                        !this.FEMALE_VOICE_NAME_KEYWORDS.some(keyword => v.name.toLowerCase().includes(keyword.toLowerCase()))
                    );
                    voiceLog.push(`      ${potentialMaleVoices.length} voices remaining after female keyword filter.`);

                    if (potentialMaleVoices.length > 0) {
                        // Optional: Further refine by looking for male keywords if any non-female voices remain
                        const specificMaleVoiced = potentialMaleVoices.find(v => 
                            this.MALE_VOICE_NAME_KEYWORDS.some(keyword => v.name.toLowerCase().includes(keyword.toLowerCase()))
                        );
                        if (specificMaleVoiced) {
                            selectedVoice = specificMaleVoiced;
                            voiceLog.push(`      Found voice with male keyword: ${selectedVoice.name}`);
                        } else {
                            // If no specific male keywords, take the first non-female voice
                            selectedVoice = potentialMaleVoices[0];
                            voiceLog.push(`      No specific male keyword match, using first non-female: ${selectedVoice.name}`);
                        }
                    } else {
                        // If filtering out female voices removed all options, it means all voices for that lang were female-flagged.
                        // In this rare case, we might reluctantly pick the first one from the original lang match.
                        selectedVoice = langMatchedVoices[0];
                        voiceLog.push(`      All voices for lang ${targetLang} seemed female-flagged. Reluctantly using first available: ${selectedVoice.name}`);
                    }
                } else if (characterGender === 'female') {
                    // Similar logic: prefer female keywords, or filter out male keywords
                    voiceLog.push(`    Character is female. Attempting to find female-keyword voices.`);
                    let potentialFemaleVoices = langMatchedVoices.filter(v =>
                        this.FEMALE_VOICE_NAME_KEYWORDS.some(keyword => v.name.toLowerCase().includes(keyword.toLowerCase()))
                    );
                    if (potentialFemaleVoices.length > 0) {
                        selectedVoice = potentialFemaleVoices[0]; // Take the first one with a female keyword
                         voiceLog.push(`      Found voice with female keyword: ${selectedVoice.name}`);
                    } else {
                        // If no female keywords, filter out distinctly male ones
                        potentialFemaleVoices = langMatchedVoices.filter(v =>
                            !this.MALE_VOICE_NAME_KEYWORDS.some(keyword => v.name.toLowerCase().includes(keyword.toLowerCase()))
                        );
                        if (potentialFemaleVoices.length > 0) {
                            selectedVoice = potentialFemaleVoices[0];
                            voiceLog.push(`      No female keyword, using first non-male: ${selectedVoice.name}`);
                        } else {
                            selectedVoice = langMatchedVoices[0]; // Absolute fallback for female
                            voiceLog.push(`      Could not specifically identify female voice, using first for lang: ${selectedVoice.name}`);
                        }
                    }
                } else { // Neutral gender or unspecified
                    selectedVoice = langMatchedVoices[0]; // Just take the first one for the language
                    voiceLog.push(`    Neutral gender, using first for lang: ${selectedVoice?.name}`);
                }
            }
            if (!selectedVoice && langMatchedVoices.length > 0) { // Should not happen if logic above is complete, but as a safe fallback
                selectedVoice = langMatchedVoices[0];
                voiceLog.push(`    Unexpected fallback within language match: ${selectedVoice.name}`);
            }
            if (!selectedVoice) voiceLog.push(`    No voices found for lang "${targetLang}" after filtering.`);
        }
        
        // 3. Broad Fallback if still no voice selected
        if (!selectedVoice && this.availableVoices.length > 0) {
            voiceLog.push(`  No specific voice found, attempting broad fallback.`);
            selectedVoice = this.availableVoices.find(v => v.default) || 
                            this.availableVoices.find(v => v.lang.startsWith(navigator.language)) ||
                            this.availableVoices.find(v => v.lang.startsWith('en')) || // Common fallback
                            this.availableVoices[0];
            if(selectedVoice) voiceLog.push(`    Broad fallback selected: ${selectedVoice.name}`);
        }

        // Apply selected voice or log warning
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            voiceLog.push(`  FINAL SELECTED VOICE: ${selectedVoice.name} (Lang: ${selectedVoice.lang})`);
        } else {
            voiceLog.push("  WARNING: No voice could be selected. Using browser default.");
            console.warn("[AnimatorSpeech] Could not select any voice. Using browser default.");
        }
        // console.log(voiceLog.join('\n')); // Uncomment for detailed voice selection logging

        utterance.pitch = voiceConfig?.pitch ?? 1;
        utterance.rate = voiceConfig?.rate ?? 1; 
        utterance.volume = voiceConfig?.volume ?? 1;

        utterance.onend = () => {
            const currentTracked = this._utterances.get(characterId);
            if (currentTracked && currentTracked.utterance === utterance) {
                this._utterances.delete(characterId);
                if (onEndCallback) onEndCallback();
            }
        };
        utterance.onerror = (event) => {
            console.error("[AnimatorSpeech] TTS Error:", event, "Utterance text:", utterance.text);
            const currentTracked = this._utterances.get(characterId);
            if (currentTracked && currentTracked.utterance === utterance) {
                this._utterances.delete(characterId);
                if (onErrorCallback) onErrorCallback(event);
            }
        };
        
        this._utterances.set(characterId, { utterance, onEnd: onEndCallback, onError: onErrorCallback });
        try {
            this.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error("[AnimatorSpeech] Error calling speechSynthesis.speak:", e);
            if (onErrorCallback) onErrorCallback(e);
        }
        return utterance;
    },

    cancel: function(characterId = null) {
        if (!this.isSupported || !this.speechSynthesis) return;
        this.speechSynthesis.cancel(); 
        this._utterances.forEach((data, id) => {
            if (data.onError) data.onError(new Error(`Speech cancelled for ${id} (global effect).`));
        });
        this._utterances.clear();
    },
    isSpeaking: function(characterId = null) {
        if (!this.isSupported || !this.speechSynthesis) return false;
        if (characterId) return this.speechSynthesis.speaking && this._utterances.has(characterId);
        return this.speechSynthesis.speaking;
    }
};