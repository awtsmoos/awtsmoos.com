//B"H
// services/gemini.js

export async function transcribeAudioStream(audioBlob, apiKey, config, onChunk) {
    if (!apiKey) throw new Error("API KEY REQUIRED");

    const base64Audio = await blobToBase64(audioBlob);
    const model = config.model || "gemini-2.0-flash";
    const useThinking = config.useThinking || false;
    
    // Note: streamGenerateContent endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;

    const promptText = `
    B"H
    SYSTEM_INSTRUCTION:
    You are an expert transcriber and translator of Jewish Audio content.
    The audio source contains a mix of Yiddish, Hebrew, and English spoken by the Lubavitcher Rebbe.
    
    YOUR TASK:
    1. Transcribe the audio precisely in its original language (Yiddish/Hebrew/English).
    2. Provide an accurate English translation for every segment.
    3. Output MUST be a strictly valid JSON Array.
    
    FORMAT:
    [
      {
        "start": 0.0,
        "end": 2.5,
        "text": "Original text here (e.g. אין אנפאנג פון...)",
        "translation": "In the beginning of..."
      }
    ]

    IMPORTANT:
    - Do not wrap in markdown code blocks.
    - Do not add explanation text.
    - Ensure valid JSON syntax (close all braces/brackets).
    `;

    const requestBody = {
        contents: [{
            parts: [
                { text: promptText },
                {
                    inline_data: {
                        mime_type: audioBlob.type || "audio/wav",
                        data: base64Audio
                    }
                }
            ]
        }],
        generationConfig: {
            response_mime_type: "application/json"
        }
    };
    
    if (useThinking && model.includes('thinking')) {
        requestBody.generationConfig.thinking_config = { include_thoughts: true };
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            
            // "Dirty" parsing for real-time visual feedback
            const rawLines = chunk.split('\n');
            for(const line of rawLines) {
                if(line.includes('"text":') || line.includes('"translation":')) {
                    const clean = line.replace(/["{},]/g, '').trim();
                    if(clean.length > 3) onChunk(clean); 
                }
            }
            fullText += chunk;
        }
        
        // For reliability, we trigger a non-stream call to get the final clean JSON
        // because stitching JSON streams manually is error-prone.
        return await transcribeAudio(audioBlob, apiKey, config);

    } catch (e) {
        console.error("Stream Error", e);
        throw e;
    }
}

export async function transcribeAudio(audioBlob, apiKey, config) {
    const base64Audio = await blobToBase64(audioBlob);
    const model = config.model || "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const promptText = `
    Task: Transcribe Yiddish/Hebrew/English audio.
    Return ONLY a JSON array: [{"start": number, "end": number, "text": "original", "translation": "english"}].
    Ensure strict JSON validity.
    `;

    const body = {
        contents: [{
            parts: [
                { text: promptText },
                {
                    inline_data: {
                        mime_type: "audio/wav",
                        data: base64Audio
                    }
                }
            ]
        }],
        generationConfig: {
            response_mime_type: "application/json"
        }
    };

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const json = await res.json();
    if(!json.candidates || !json.candidates[0].content) {
        throw new Error("No transcription candidate returned");
    }
    const text = json.candidates[0].content.parts[0].text;
    
    try {
        return JSON.parse(text);
    } catch(e) {
        // Fallback: try to find array in string
        const match = text.match(/\[.*\]/s);
        if(match) return JSON.parse(match[0]);
        throw e;
    }
}

export async function generateAiImage(prompt, apiKey) {
    const model = 'gemini-2.5-flash-image';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const body = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const json = await res.json();
    
    if(!json.candidates || !json.candidates[0].content) {
        throw new Error("Image generation failed");
    }

    const parts = json.candidates[0].content.parts;
    for(const part of parts) {
        if(part.inline_data) {
            return `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
        }
    }
    throw new Error("No image data found in response");
}

function blobToBase64(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
    });
}