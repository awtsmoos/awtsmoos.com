//B"H
// Animator.Speech.js
// B"H - Dedicated Text-to-Speech Handler

window.AnimatorSpeech = {
    speechSynthesis: null,
    availableVoices: [],
    isSupported: false,
    _utterances: new Map(), // characterId -> { utterance, onEnd, onError }

    initialize: function(statusUpdateCallbackForCore) {
        this.speechSynthesis = window.speechSynthesis;
        if (!this.speechSynthesis) {
            console.warn("[AnimatorSpeech] Speech Synthesis not supported by this browser.");
            if (statusUpdateCallbackForCore) statusUpdateCallbackForCore("Speech Synthesis not supported.");
            this.isSupported = false;
            return;
        }
        this.isSupported = true;

        const loadVoices = () => {
            this.availableVoices = this.speechSynthesis.getVoices();
            if (this.availableVoices.length > 0) {
                console.log("[AnimatorSpeech] Available TTS Voices:", this.availableVoices.map(v => ({name: v.name, lang: v.lang})));
                if (statusUpdateCallbackForCore) statusUpdateCallbackForCore(`TTS voices loaded (${this.availableVoices.length}).`);
            } else {
                 if (statusUpdateCallbackForCore) statusUpdateCallbackForCore(`TTS ready (voices may load asynchronously or none available).`);
            }
        };

        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices(); 
        setTimeout(loadVoices, 500); 
    },

    speak: function(characterId, text, voiceConfig, onEndCallback, onErrorCallback) {
        if (!this.isSupported || !text) {
            if (onErrorCallback) onErrorCallback(new Error("TTS not supported or no text provided."));
            return null;
        }
        
        // Do NOT preemptively cancel here. Let utterances queue or be managed by explicit cancel calls or new speak events for the SAME character implicitly.
        // If a character is already speaking and a new utterance for THE SAME character comes, 
        // the browser's TTS engine typically handles queuing or replacing.
        // We will still replace the entry in _utterances map for the character.
        // If `this.speechSynthesis.speaking` is true AND the current utterance belongs to this character, THEN consider cancelling.
        // For now, let it queue to simplify and avoid cross-character cancellation side effects.
        
        // If this character had a previous utterance tracked, its callbacks might not fire if overwritten.
        // This is a tricky part: if a character gets a new line before the old one finished its 'onend' event for the Core,
        // the old dialogue event in Core.js might get stuck.
        // The simplest is that `speechSynthesis.speak` will queue. The old utterance will eventually end and call its `onend`.
        // Or, if a character *is* speaking, we should `cancel(characterId)` just for them.

        if (this.isSpeaking(characterId)) {
             // console.warn(`[AnimatorSpeech] Character ${characterId} is already speaking. Cancelling previous and starting new.`);
             this.cancel(characterId); // Cancel only this character's current speech if any, this will also clear their old _utterance map entry.
        }


        const utterance = new SpeechSynthesisUtterance(text);

        const voiceName = voiceConfig?.voiceName;
        const voiceLang = voiceConfig?.voiceLang;

        let selectedVoice = null;
        if (voiceName) {
            selectedVoice = this.availableVoices.find(v => v.name === voiceName);
            if (!selectedVoice) console.warn(`[AnimatorSpeech] Voice name "${voiceName}" not found.`);
        }
        if (!selectedVoice && voiceLang) {
            const langMatchedVoices = this.availableVoices.filter(v => v.lang.startsWith(voiceLang));
            if (langMatchedVoices.length > 0) selectedVoice = langMatchedVoices[0]; 
            else console.warn(`[AnimatorSpeech] No voices for lang "${voiceLang}" found.`);
        }
        if(selectedVoice) utterance.voice = selectedVoice;
        
        utterance.pitch = voiceConfig?.pitch ?? 1;
        utterance.rate = voiceConfig?.rate ?? 1; 
        utterance.volume = voiceConfig?.volume ?? 1;

        utterance.onend = () => {
            // Only remove and callback if this specific utterance is the one we're tracking.
            const currentTracked = this._utterances.get(characterId);
            if (currentTracked && currentTracked.utterance === utterance) {
                this._utterances.delete(characterId);
                if (onEndCallback) onEndCallback();
            } else {
                // This onend belongs to an utterance that's no longer the primary one for this character (e.g. cancelled and replaced).
                // console.log(`[AnimatorSpeech] onEnd for an old/replaced utterance for ${characterId}.`);
            }
        };

        utterance.onerror = (event) => {
            console.error("[AnimatorSpeech] TTS Error:", event);
            const currentTracked = this._utterances.get(characterId);
            if (currentTracked && currentTracked.utterance === utterance) {
                this._utterances.delete(characterId);
                if (onErrorCallback) onErrorCallback(event);
            }
        };
        
        // Store this new utterance as the current one for the character
        this._utterances.set(characterId, { utterance, onEnd: onEndCallback, onError: onErrorCallback });
        this.speechSynthesis.speak(utterance);
        return utterance;
    },

    cancel: function(characterId = null) {
        if (!this.isSupported || !this.speechSynthesis) return;

        // SpeechSynthesis.cancel() is global, it stops all current and pending utterances.
        this.speechSynthesis.cancel(); 

        const toClearAndNotify = [];

        if (characterId) {
            // If a specific character is targeted for cancellation
            const data = this._utterances.get(characterId);
            if (data) {
                toClearAndNotify.push({ id: characterId, d: data, reason: `Speech for ${characterId} specifically cancelled.` });
            }
            // Since cancel() is global, all other _utterances are also now invalid and won't fire onend.
            // We should notify them via onError.
            this._utterances.forEach((otherData, otherId) => {
                if (otherId !== characterId) { // Avoid double-processing if already added
                     toClearAndNotify.push({ id: otherId, d: otherData, reason: `Speech for ${otherId} cancelled due to global effect while cancelling ${characterId}.` });
                }
            });

        } else { // Cancel all speech globally (e.g. Stop button)
            this._utterances.forEach((data, id) => {
                toClearAndNotify.push({ id: id, d: data, reason: "Speech cancelled globally." });
            });
        }

        // Process notifications and clear map
        toClearAndNotify.forEach(item => {
            if (item.d.onError) {
                item.d.onError(new Error(item.reason));
            }
            this._utterances.delete(item.id);
        });
        
        // Ensure map is empty if global cancel intended for all.
        if (!characterId) {
            this._utterances.clear();
        }
    },

    isSpeaking: function(characterId = null) {
        if (!this.isSupported || !this.speechSynthesis || !this.speechSynthesis.speaking) return false;
        
        if (characterId) {
            // Check if the character we are interested in has an active utterance tracked.
            // This is an approximation because `speechSynthesis.speaking` is global.
            // It's true if *someone* is speaking AND this character *has an utterance we think is active*.
            return this._utterances.has(characterId); 
        }
        return this.speechSynthesis.speaking; // Global status
    }
};