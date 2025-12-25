// B"H
/**
 * @file onnx/worker.js
 * @description 
 * B"H
 * The Neural Heart.
 * 
 * UPGRADES:
 * 1. 1-to-1 Port of `normalize_text` from kokoro-main.
 * 2. UNIVERSAL SCANNING G2P ENGINE (Mini-Espeak).
 * 3. Context-aware phoneme generation (Magic E, Soft C/G, etc).
 * 4. Safe Tokenization.
 */

export const WORKER_SOURCE = `
// B"H
// WORKER CONTEXT START

self.ort = undefined; 
self.vocab = null; 

let session = null;
let voiceBank = null; 
let expectedStyleDim = 256; 

const postLog = (msg, type = 'info') => {
    self.postMessage({ type: 'LOG', payload: { msg: \`[Engine] \${msg}\`, type } });
};

// --- 1. KOKORO NORMALIZATION PORT (1-to-1) ---

function split_num(match) {
  if (match.includes(".")) {
    return match;
  } else if (match.includes(":")) {
    let [h, m] = match.split(":").map(Number);
    if (m === 0) {
      return \`\${h} o'clock\`;
    } else if (m < 10) {
      return \`\${h} oh \${m}\`;
    }
    return \`\${h} \${m}\`;
  }
  let year = parseInt(match.slice(0, 4), 10);
  if (year < 1100 || year % 1000 < 10) {
    return match;
  }
  let left = match.slice(0, 2);
  let right = parseInt(match.slice(2, 4), 10);
  let suffix = match.endsWith("s") ? "s" : "";
  if (year % 1000 >= 100 && year % 1000 <= 999) {
    if (right === 0) {
      return \`\${left} hundred\${suffix}\`;
    } else if (right < 10) {
      return \`\${left} oh \${right}\${suffix}\`;
    }
  }
  return \`\${left} \${right}\${suffix}\`;
}

function flip_money(match) {
  const bill = match[0] === "$" ? "dollar" : "pound";
  if (isNaN(Number(match.slice(1)))) {
    return \`\${match.slice(1)} \${bill}s\`;
  } else if (!match.includes(".")) {
    let suffix = match.slice(1) === "1" ? "" : "s";
    return \`\${match.slice(1)} \${bill}\${suffix}\`;
  }
  const [b, c] = match.slice(1).split(".");
  const d = parseInt(c.padEnd(2, "0"), 10);
  let coins = match[0] === "$" ? (d === 1 ? "cent" : "cents") : d === 1 ? "penny" : "pence";
  return \`\${b} \${bill}\${b === "1" ? "" : "s"} and \${d} \${coins}\`;
}

function point_num(match) {
  let [a, b] = match.split(".");
  return \`\${a} point \${b.split("").join(" ")}\`;
}

const Normalizer = {
    process(text) {
        // B"H - Initial Divine Pre-processing
        let t = text;
        if (t.includes('B"H')) t = t.replace(/B"H/g, 'bɑːrʊx hɑːʃɛm');
        if (t.includes('b"h')) t = t.replace(/b"h/g, 'bɑːrʊx hɑːʃɛm');

        return t
            .replace(/[‘’]/g, "'")
            .replace(/«/g, "“")
            .replace(/»/g, "”")
            .replace(/[“”]/g, '"')
            .replace(/\\(/g, "«")
            .replace(/\\)/g, "»")
            .replace(/、/g, ", ")
            .replace(/。/g, ". ")
            .replace(/！/g, "! ")
            .replace(/，/g, ", ")
            .replace(/：/g, ": ")
            .replace(/；/g, "; ")
            .replace(/？/g, "? ")
            .replace(/[^\\S \\n]/g, " ")
            .replace(/  +/, " ")
            .replace(/(?<=\\n) +(?=\\n)/g, "")
            .replace(/\\bD[Rr]\\.(?= [A-Z])/g, "Doctor")
            .replace(/\\b(?:Mr\\.|MR\\.(?= [A-Z]))/g, "Mister")
            .replace(/\\b(?:Ms\\.|MS\\.(?= [A-Z]))/g, "Miss")
            .replace(/\\b(?:Mrs\\.|MRS\\.(?= [A-Z]))/g, "Mrs")
            .replace(/\\betc\\.(?! [A-Z])/gi, "etc")
            .replace(/\\b(y)eah?\\b/gi, "$1e'a")
            .replace(/\\d*\\.\\d+|\\b\\d{4}s?\\b|(?<!:)\\b(?:[1-9]|1[0-2]):[0-5]\\d\\b(?!:)/g, split_num)
            .replace(/(?<=\\d),(?=\\d)/g, "")
            .replace(/[$£]\\d+(?:\\.\\d+)?(?: hundred| thousand| (?:[bm]|tr)illion)*\\b|[$£]\\d+\\.\\d\\d?\\b/gi, flip_money)
            .replace(/\\d*\\.\\d+/g, point_num)
            .replace(/(?<=\\d)-(?=\\d)/g, " to ")
            .replace(/(?<=\\d)S/g, " S")
            .replace(/(?<=[BCDFGHJ-NP-TV-Z])'?s\\b/g, "'S")
            .replace(/(?<=X')S\\b/g, "s")
            .replace(/(?:[A-Za-z]\\.){2,} [a-z]/g, (m) => m.replace(/\\./g, "-"))
            .replace(/(?<=[A-Z])\\.(?=[A-Z])/gi, "-")
            .trim();
    }
};

// --- 2. UNIVERSAL G2P ENGINE (Scanning Parser) ---

const Phonemizer = {
    // High-frequency exceptions that defy rules
    dict: {
        "the": "ðə", "of": "ʌv", "and": "ænd", "to": "tuː", "a": "ə",
        "in": "ɪn", "is": "ɪz", "you": "juː", "that": "ðæt", "it": "ɪt",
        "he": "hiː", "was": "wʌz", "for": "fɔːɹ", "on": "ɒn", "are": "ɑːɹ",
        "as": "æz", "with": "wɪð", "his": "hɪz", "they": "ðeɪ", "i": "aɪ",
        "all": "ɔːl", "have": "hæv", "one": "wʌn", "by": "baɪ", "word": "wɜːd",
        "but": "bʌt", "not": "nɒt", "what": "wɒt", "all": "ɔːl", "were": "wɜːɹ",
        "we": "wiː", "when": "wɛn", "your": "jɔːɹ", "can": "kæn", "said": "sɛd",
        "there": "ðɛəɹ", "use": "juːz", "an": "æn", "each": "iːtʃ", "which": "wɪtʃ",
        "she": "ʃiː", "do": "duː", "how": "haʊ", "their": "ðɛəɹ", "if": "ɪf",
        "will": "wɪl", "up": "ʌp", "other": "ˈʌðɚ", "about": "əbˈaʊt", "out": "aʊt",
        "many": "mˈɛni", "then": "ðɛn", "them": "ðɛm", "these": "ðiːz", "so": "soʊ",
        "some": "sʌm", "her": "hɜːɹ", "would": "wʊd", "make": "meɪk", "like": "laɪk",
        "him": "hɪm", "into": "ˈɪntuː", "time": "taɪm", "has": "hæz", "look": "lʊk",
        "two": "tuː", "more": "mɔːɹ", "write": "ɹaɪt", "go": "ɡoʊ", "see": "siː",
        "no": "noʊ", "way": "weɪ", "could": "kʊd", "people": "pˈiːpəl", 
        "my": "maɪ", "than": "ðæn", "first": "fˈɜːst", "water": "wˈɔːɾɚ",
        "been": "bɪn", "call": "kɔːl", "who": "huː", "oil": "ɔɪl", "its": "ɪts",
        "now": "naʊ", "find": "faɪnd", "long": "lɔːŋ", "down": "daʊn", "day": "deɪ",
        "did": "dɪd", "get": "ɡɛt", "come": "kʌm", "made": "meɪd", "may": "meɪ",
        "part": "pɑːɹt", "over": "ˈoʊvɚ", "new": "nuː", "sound": "saʊnd", "take": "teɪk",
        "only": "ˈoʊnli", "little": "lˈɪɾəl", "work": "wɜːk", "know": "noʊ", "place": "pleɪs",
        "year": "jɪɹ", "live": "lɪv", "me": "miː", "back": "bæk", "give": "ɡɪv",
        "most": "moʊst", "very": "vˈɛɹi", "after": "ˈæftɚ", "thing": "θɪŋ", "our": "aʊɚ",
        "just": "dʒʌst", "name": "neɪm", "good": "ɡʊd", "sentence": "sˈɛntəns", "man": "mæn",
        "think": "θɪŋk", "say": "seɪ", "great": "ɡɹeɪt", "where": "wɛəɹ", "help": "hɛlp",
        "through": "θɹuː", "much": "mʌtʃ", "before": "bɪfˈɔːɹ", "line": "laɪn", "right": "ɹaɪt",
        "too": "tuː", "mean": "miːn", "old": "oʊld", "any": "ˈɛni", "same": "seɪm",
        "tell": "tɛl", "boy": "bɔɪ", "follow": "fˈɑːloʊ", "came": "keɪm", "want": "wɑːnt",
        "show": "ʃoʊ", "also": "ˈɔːlsoʊ", "around": "əɹˈaʊnd", "form": "fɔːɹm", "three": "θɹiː",
        "small": "smɔːl", "set": "sɛt", "put": "pʊt", "end": "ɛnd", "does": "dʌz",
        "another": "ənˈʌðɚ", "well": "wɛl", "large": "lɑːɹdʒ", "must": "mʌst", "big": "bɪɡ",
        "even": "ˈiːvən", "such": "sʌtʃ", "because": "bɪkˈɔːz", "turn": "tɜːn", "here": "hɪɹ",
        "why": "waɪ", "ask": "æsk", "went": "wɛnt", "men": "mɛn", "read": "ɹiːd",
        "need": "niːd", "land": "lænd", "different": "dˈɪfɹənt", "home": "hoʊm", "us": "ʌs",
        "move": "muːv", "try": "tɹaɪ", "kind": "kaɪnd", "hand": "hænd", "picture": "pˈɪktʃɚ",
        "again": "əɡˈɛn", "change": "tʃeɪndʒ", "off": "ɔːf", "play": "pleɪ", "spell": "spɛl",
        "air": "ɛɹ", "away": "əwˈeɪ", "animal": "ˈænɪməl", "house": "haʊs", "point": "pɔɪnt",
        "page": "peɪdʒ", "letter": "lˈɛɾɚ", "mother": "mˈʌðɚ", "answer": "ˈænsɚ", "found": "faʊnd",
        "study": "stˈʌdi", "still": "stɪl", "learn": "lɜːn", "should": "ʃʊd", "america": "əmˈɛɹɪkə",
        "world": "wɜːld", "high": "haɪ", "every": "ˈɛvɹi", "near": "nɪɹ", "add": "æd",
        "food": "fuːd", "between": "bɪtwˈiːn", "own": "oʊn", "below": "bɪlˈoʊ", "country": "kˈʌntɹi",
        "plant": "plænt", "last": "læst", "school": "skuːl", "father": "fˈɑːðɚ", "keep": "kiːp",
        "tree": "tɹiː", "never": "nˈɛvɚ", "start": "stɑːɹt", "city": "sˈɪɾi", "earth": "ɜːθ",
        "eye": "aɪ", "light": "laɪt", "thought": "θɔːt", "head": "hɛd", "under": "ˈʌndɚ",
        "story": "stˈɔːɹi", "saw": "sɔː", "left": "lɛft", "don't": "doʊnt", "few": "fjuː",
        "while": "waɪl", "along": "əlˈɔːŋ", "might": "maɪt", "close": "kloʊs", "something": "sˈʌmθɪŋ",
        "seem": "siːm", "next": "nɛkst", "hard": "hɑːɹd", "open": "ˈoʊpən", "example": "ɪɡzˈæmpəl",
        "begin": "bɪɡˈɪn", "life": "laɪf", "always": "ˈɔːlweɪz", "those": "ðoʊz", "both": "boʊθ",
        "paper": "pˈeɪpɚ", "together": "təɡˈɛðɚ", "got": "ɡɑːt", "group": "ɡɹuːp", "often": "ˈɔːfən",
        "run": "ɹʌn", "important": "ɪmpˈɔːɹtənt", "until": "ʌntˈɪl", "children": "tʃˈɪldɹən", "side": "saɪd",
        "feet": "fiːt", "car": "kɑːɹ", "mile": "maɪl", "night": "naɪt", "walk": "wɔːk",
        "white": "waɪt", "sea": "siː", "began": "bɪɡˈæn", "grow": "ɡɹoʊ", "took": "tʊk",
        "river": "ɹˈɪvɚ", "four": "fɔːɹ", "carry": "kˈæɹi", "state": "steɪt", "once": "wʌns",
        "book": "bʊk", "hear": "hɪɹ", "stop": "stɑːp", "without": "wɪðˈaʊt", "second": "sˈɛkənd",
        "later": "lˈeɪɾɚ", "miss": "mɪs", "idea": "aɪdˈiːə", "enough": "ɪnˈʌf", "eat": "iːt",
        "face": "feɪs", "watch": "wɑːtʃ", "far": "fɑːɹ", "indian": "ˈɪndiən", "really": "ɹˈiːli",
        "almost": "ˈɔːlmoʊst", "let": "lɛt", "above": "əbˈʌv", "girl": "ɡɜːl", "sometimes": "sˈʌmtaɪmz",
        "mountain": "mˈaʊntən", "cut": "kʌt", "young": "jʌŋ", "talk": "tɔːk", "soon": "suːn",
        "list": "lɪst", "song": "sɔːŋ", "being": "bˈiːɪŋ", "leave": "liːv", "family": "fˈæməli",
        "bɑːrʊx": "bɑːrʊx", "hɑːʃɛm": "hɑːʃɛm", "kokoro": "kˈoʊkəroʊ",
        "creator": "kriˈeɪtəɹ", "blessed": "blˈɛsɪd", "existence": "ɪɡzˈɪstəns"
    },

    // Scan the word and generate phonemes using context rules
    processWord(word) {
        let w = word.toLowerCase();
        
        // 1. Dictionary Check (Full Word)
        if (this.dict[w]) return this.dict[w];

        // 2. Prefixes / Suffixes stripping (Recursive strategy could be better but sticking to rules)
        // ... (omitted for speed, relying on scanning)

        let phonemes = "";
        let i = 0;
        let len = w.length;

        // Helper to check lookahead
        const peek = (n = 1) => i + n < len ? w[i + n] : "";
        const isVowel = (c) => /[aeiouy]/.test(c);
        
        // Stress heuristic: If word length > 4, assume stress on first syllable.
        // Kokoro expects ˈ for stress. 
        // We will just prepend stress if it's a longish word and not a function word.
        if (len > 3 && !['with','from','that'].includes(w)) {
             phonemes += "ˈ";
        }

        while (i < len) {
            let c = w[i];
            let handled = false;

            // --- Magic E Detection ---
            // Pattern: Vowel + Consonant + E (at end or before s/d)
            // e.g. "make", "likes", "hoped"
            let isMagicE = false;
            if (isVowel(c)) {
                // Check for V + C + e
                if (i + 2 < len && !isVowel(w[i+1]) && w[i+2] === 'e') {
                    // Check if 'e' is ending or followed by s/d
                    let afterE = (i + 3 < len) ? w[i+3] : "";
                    if (i + 2 === len - 1 || afterE === 's' || afterE === 'd') {
                        isMagicE = true;
                    }
                }
            }

            // --- Multi-Character Graphemes ---
            
            // 'tion', 'sion' -> ʃən / ʒən
            if (c === 't' && w.substr(i, 4) === 'tion') {
                phonemes += "ʃən"; i += 4; continue;
            }
            if (c === 's' && w.substr(i, 4) === 'sion') {
                phonemes += "ʒən"; i += 4; continue;
            }
            
            // 'igh' -> aɪ
            if (c === 'i' && w.substr(i, 3) === 'igh') {
                phonemes += "aɪ"; i += 3; continue;
            }

            // 'ph' -> f
            if (c === 'p' && peek() === 'h') {
                phonemes += "f"; i += 2; continue;
            }
            
            // 'sh' -> ʃ
            if (c === 's' && peek() === 'h') {
                phonemes += "ʃ"; i += 2; continue;
            }

            // 'ch' -> tʃ
            if (c === 'c' && peek() === 'h') {
                phonemes += "tʃ"; i += 2; continue;
            }

            // 'th' -> θ (default, tough to guess ð without dict)
            if (c === 't' && peek() === 'h') {
                phonemes += "θ"; i += 2; continue;
            }

            // 'wh' -> w
            if (c === 'w' && peek() === 'h') {
                phonemes += "w"; i += 2; continue;
            }
            
            // 'ng' -> ŋ (at end)
            if (c === 'n' && peek() === 'g' && (i+2 === len)) {
                phonemes += "ŋ"; i += 2; continue;
            }

            // 'qu' -> kw
            if (c === 'q' && peek() === 'u') {
                phonemes += "kw"; i += 2; continue;
            }

            // --- Vowels & Teams ---
            
            if (isMagicE) {
                // Long Vowels
                if (c === 'a') phonemes += "eɪ";
                else if (c === 'e') phonemes += "iː";
                else if (c === 'i') phonemes += "aɪ";
                else if (c === 'o') phonemes += "oʊ";
                else if (c === 'u') phonemes += "juː";
                else phonemes += c; // fallback
                i += 1;
                // Skip consonant
                phonemes += w[i]; 
                i += 1;
                // Skip 'e'
                i += 1; 
                continue;
            }

            if (c === 'e' && peek() === 'e') { phonemes += "iː"; i += 2; continue; }
            if (c === 'o' && peek() === 'o') { phonemes += "uː"; i += 2; continue; }
            if (c === 'e' && peek() === 'a') { phonemes += "iː"; i += 2; continue; } // 'bead'
            if (c === 'o' && peek() === 'u') { phonemes += "aʊ"; i += 2; continue; } // 'out'
            if (c === 'a' && peek() === 'i') { phonemes += "eɪ"; i += 2; continue; } // 'rain'
            if (c === 'a' && peek() === 'y') { phonemes += "eɪ"; i += 2; continue; } // 'day'
            if (c === 'o' && peek() === 'a') { phonemes += "oʊ"; i += 2; continue; } // 'boat'
            if (c === 'o' && peek() === 'i') { phonemes += "ɔɪ"; i += 2; continue; } // 'oil'
            if (c === 'o' && peek() === 'y') { phonemes += "ɔɪ"; i += 2; continue; } // 'boy'
            if (c === 'a' && peek() === 'u') { phonemes += "ɔː"; i += 2; continue; } // 'auto'
            if (c === 'a' && peek() === 'w') { phonemes += "ɔː"; i += 2; continue; } // 'law'

            // --- R-Controlled ---
            if (isVowel(c) && peek() === 'r') {
                if (c === 'a') phonemes += "ɑːɹ";
                else if (c === 'o') phonemes += "ɔːɹ";
                else phonemes += "ɜːɹ"; // er, ir, ur
                i += 2; continue;
            }

            // --- Contextual Consonants ---
            if (c === 'c') {
                const next = peek();
                if (['e', 'i', 'y'].includes(next)) phonemes += "s";
                else phonemes += "k";
                i++; continue;
            }
            
            if (c === 'g') {
                const next = peek();
                // Soft G rule is flaky but ʤ is better before e/i often
                // defaulting to hard g for safety unless obvious
                if (['e', 'i', 'y'].includes(next)) phonemes += "ʤ";
                else phonemes += "ɡ";
                i++; continue;
            }

            if (c === 'x') {
                // ex + vowel -> igz
                if (i === 0 && peek() === 'e' && isVowel(w[2])) {
                    // actually this is handled by scanning 'e' first
                }
                phonemes += "ks"; i++; continue;
            }

            // --- Single Vowels (Short) ---
            if (c === 'a') { phonemes += "æ"; i++; continue; }
            if (c === 'e') { 
                // Silent E at end?
                if (i === len - 1 && len > 2) { 
                    // silent
                } else {
                    phonemes += "ɛ"; 
                }
                i++; continue; 
            }
            if (c === 'i') { 
                // y ending rule? handled by y
                phonemes += "ɪ"; i++; continue; 
            }
            if (c === 'o') { phonemes += "ɒ"; i++; continue; }
            if (c === 'u') { phonemes += "ʌ"; i++; continue; }
            if (c === 'y') {
                // End of word y -> i
                if (i === len - 1) phonemes += "i";
                else phonemes += "j";
                i++; continue;
            }

            // --- Defaults ---
            if (c === 'j') phonemes += "ʤ";
            else if (c === 'r') phonemes += "ɹ";
            else phonemes += c;
            
            i++;
        }
        
        return phonemes;
    },

    process(text) {
        let t = Normalizer.process(text).toLowerCase();
        // Split by non-alpha but keep delimiters
        const tokens = t.split(/([a-z']+|[0-9]+)/);
        let res = "";
        
        for (const token of tokens) {
            if (!token) continue;
            if (!/[a-z]/.test(token)) {
                res += token;
                continue;
            }
            res += this.processWord(token);
        }
        
        // Post-process cleanup (kokoro specific)
        return res
            .replace(/\\s+/g, ' ')
            .replace(/kəkˈoːɹoʊ/g, "kˈoʊkəɹoʊ")
            .replace(/kəkˈɔːɹəʊ/g, "kˈəʊkəɹəʊ")
            .replace(/ʲ/g, "j")
            .replace(/r/g, "ɹ")
            .replace(/x/g, "k")
            .replace(/ɬ/g, "l")
            .replace(/(?<=[a-zɹː])(?=hˈʌndɹɪd)/g, " ")
            .replace(/ z(?=[;:,.!?¡¿—…"«»“” ]|$)/g, "z")
            .trim();
    }
};

// --- B"H: MAIN HANDLER ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;

    try {
        if (type === 'PING') return self.postMessage({ type: 'PONG' });

        if (type === 'PHONEMIZE') {
            return self.postMessage({ type: 'PHONEMIZE_RESULT', payload: Phonemizer.process(payload.text) });
        }

        if (type === 'INIT_MODEL') {
            postLog("Booting Neural Backend...");
            
            if (payload.vocab) {
                if (payload.vocab.model && payload.vocab.model.vocab) {
                    self.vocab = payload.vocab.model.vocab;
                } else {
                    self.vocab = payload.vocab;
                }
            } else {
                throw new Error("Missing Vocabulary Data.");
            }

            if (typeof self.ort === 'undefined') {
                importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/ort.min.js');
                self.ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
                self.ort.env.wasm.numThreads = 1; 
                self.ort.env.wasm.proxy = false; 
            }

            postLog("Creating Inference Session...");
            session = await self.ort.InferenceSession.create(payload.buffer, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            });

            self.postMessage({ 
                type: 'INIT_SUCCESS', 
                payload: { inputs: session.inputNames, outputs: session.outputNames } 
            });
        }

        if (type === 'LOAD_VOICE') {
            const buffer = payload.buffer;
            voiceBank = new Float32Array(buffer);
            self.postMessage({ type: 'VOICE_SUCCESS' });
        }

        if (type === 'GENERATE') {
            if (!session || !self.vocab) throw new Error("Not Initialized");

            const { text, speed, chunkIndex, isRawMode } = payload;
            
            // 1. Get Phonemes
            const phonemes = isRawMode ? text : Phonemizer.process(text);
            postLog(\`Phonemes: "\${phonemes}"\`);
            
            // 2. Tokenize (Strict Character Loop)
            const tokens = [0]; // Start token
            
            for (const char of phonemes) {
                const id = self.vocab[char];
                if (id !== undefined) {
                    tokens.push(id);
                } else {
                    // console.warn(\`Unknown char: \${char}\`);
                }
            }
            tokens.push(0); // End token

            if (tokens.length <= 2) {
                postLog("Error: Token sequence empty. Phonemization produced no valid tokens.", 'error');
            }

            self.postMessage({ type: 'TOKENS', payload: tokens });
            
            const input_ids = new BigInt64Array(tokens.map(BigInt));
            const inputTensor = new self.ort.Tensor('int64', input_ids, [1, tokens.length]);
            const speedTensor = new self.ort.Tensor('float32', new Float32Array([speed]), [1]);
            
            let styleData = new Float32Array(expectedStyleDim);
            if (voiceBank && voiceBank.length >= expectedStyleDim) {
                const maxIndex = Math.floor(voiceBank.length / expectedStyleDim) - 1;
                // Kokoro style selection
                let styleIndex = Math.min(Math.max(tokens.length - 2, 0), 509);
                styleIndex = Math.min(styleIndex, maxIndex);
                
                const offset = styleIndex * expectedStyleDim;
                styleData = voiceBank.slice(offset, offset + expectedStyleDim);
            }
            const styleTensor = new self.ort.Tensor('float32', styleData, [1, expectedStyleDim]);

            const feeds = {};
            const names = session.inputNames;
            feeds[names.find(n => n.includes('token') || n.includes('input')) || 'input_ids'] = inputTensor;
            feeds[names.find(n => n.includes('style')) || 'style'] = styleTensor;
            feeds[names.find(n => n.includes('speed')) || 'speed'] = speedTensor;

            const results = await session.run(feeds);
            const outputKey = session.outputNames[0];
            let audioData = results[outputKey].data;

            // Normalize
            let maxAmp = 0;
            for(let i=0; i<audioData.length; i++) if(Math.abs(audioData[i]) > maxAmp) maxAmp = Math.abs(audioData[i]);
            if (maxAmp > 0.99) {
                const scale = 0.95 / maxAmp;
                for(let i=0; i<audioData.length; i++) audioData[i] *= scale;
            }

            self.postMessage({ 
                type: 'GENERATE_SUCCESS', 
                payload: { audioData, chunkIndex } 
            }, [audioData.buffer]);
        }
    } catch (err) {
        self.postMessage({ type: 'ERROR', payload: err.message });
    }
};
`;