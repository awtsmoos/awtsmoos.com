
/**
 * B"H
 * @file currencySystem.js
 * The Holy Currency System.
 */

export class CurrencySystem {
    static VALUES = {
        PERUTAH: 1,
        ISAR: 8,
        PUNDYON: 16,
        MEAH: 32,
        DINAR: 192,
        SELA: 768,
        DARKON: 1536
    };

    static NAMES = {
        1: "Perutah (Copper)",
        8: "Isar",
        16: "Pundyon",
        32: "Me'ah / Gayrah",
        192: "Dinar (Silver)",
        768: "Sela (Holy Shekel)",
        1536: "Darkon (Gold)"
    };

    static ICONS = {
        PERUTAH: /*svg*/`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <defs>
                    <radialGradient id="copperGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                        <stop offset="0%" stop-color="#ffbf80"/>
                        <stop offset="100%" stop-color="#b87333"/>
                    </radialGradient>
                    <filter id="glowCopper">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <circle cx="50" cy="50" r="45" fill="url(#copperGrad)" stroke="#804000" stroke-width="3" filter="url(#glowCopper)"/>
                <text x="50" y="60" font-family="Fredoka One" font-size="40" text-anchor="middle" fill="#5c3a1e">פ</text>
            </svg>`,
        ISAR: /*svg*/`
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <defs>
                    <radialGradient id="bronzeGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                         <stop offset="0%" stop-color="#eecfa1"/>
                         <stop offset="100%" stop-color="#8b4513"/>
                    </radialGradient>
                </defs>
                <rect x="15" y="15" width="70" height="70" rx="10" fill="url(#bronzeGrad)" stroke="#5c3a1e" stroke-width="3"/>
                <text x="50" y="62" font-family="Fredoka One" font-size="35" text-anchor="middle" fill="#3d2514">א</text>
            </svg>`,
        DINAR: /*svg*/`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <defs>
                    <radialGradient id="silverGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="100%" stop-color="#c0c0c0"/>
                    </radialGradient>
                     <filter id="glowSilver">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <circle cx="50" cy="50" r="42" fill="url(#silverGrad)" stroke="#707070" stroke-width="3" filter="url(#glowSilver)"/>
                <text x="50" y="60" font-family="Fredoka One" font-size="35" text-anchor="middle" fill="#404040">ד</text>
            </svg>`,
        SELA: /*svg*/`
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffd700"/>
                        <stop offset="50%" stop-color="#ffeb3b"/>
                        <stop offset="100%" stop-color="#dba514"/>
                    </linearGradient>
                     <filter id="glowGold">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="url(#goldGrad)" stroke="#b8860b" stroke-width="3" filter="url(#glowGold)"/>
                <text x="50" y="62" font-family="Fredoka One" font-size="40" text-anchor="middle" fill="#704c0a">ש</text>
            </svg>`,
        DARKON: /*svg*/`
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <defs>
                     <radialGradient id="darkonGrad" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
                        <stop offset="0%" stop-color="#fff8a6"/>
                        <stop offset="50%" stop-color="#ffc107"/>
                        <stop offset="100%" stop-color="#ff8f00"/>
                    </radialGradient>
                    <filter id="extremeGlow">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                         <feComposite in="SourceGraphic" in2="coloredBlur" operator="over"/>
                    </filter>
                </defs>
                <circle cx="50" cy="50" r="46" fill="url(#darkonGrad)" stroke="#fff" stroke-width="2" filter="url(#extremeGlow)"/>
                <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" fill="none" stroke="#b35900" stroke-width="2"/>
            </svg>`
    };

    static getIcon(value) {
        if (value >= this.VALUES.DARKON) return this.ICONS.DARKON;
        if (value >= this.VALUES.SELA) return this.ICONS.SELA;
        if (value >= this.VALUES.DINAR) return this.ICONS.DINAR;
        if (value >= this.VALUES.ISAR) return this.ICONS.ISAR;
        return this.ICONS.PERUTAH;
    }
    
    static getBase64Icon(value) {
        const svg = this.getIcon(value);
        const utf8Bytes = encodeURIComponent(svg).replace(/%([0-9A-F]{2})/g,
            function(match, p1) {
                return String.fromCharCode('0x' + p1);
            });
        return "data:image/svg+xml;base64," + btoa(utf8Bytes);
    }

    static convert(totalPerutahs) {
        const coins = {};
        const values = Object.entries(this.VALUES).sort((a, b) => b[1] - a[1]); // Descending

        for (const [name, val] of values) {
            if (totalPerutahs >= val) {
                const count = Math.floor(totalPerutahs / val);
                coins[name] = count;
                totalPerutahs %= val;
            }
        }
        return coins;
    }
}
