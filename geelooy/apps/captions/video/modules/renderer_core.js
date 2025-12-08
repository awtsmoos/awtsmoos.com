/*
ב"ה
B"H
*/

self.einSofRenderer = {};

// Color Helpers
self.einSofRenderer.hexToRgba = (hex, a) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
};

self.einSofRenderer.hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
};

self.einSofRenderer.rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        h /= 6;
    }
    return { h, s, l };
};

self.einSofRenderer.hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

self.einSofRenderer.generatePalette = function(num, base) {
    const rgb = this.hexToRgb(base);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const pal = [];
    for (let i = 0; i < num; i++) {
        const h = (hsl.h * 360 + i * (360 / num) + (Math.random() - 0.5) * 40) % 360;
        pal.push(this.hslToHex(h, 80 + Math.random() * 20, 65 + Math.random() * 15));
    }
    return pal;
};

self.einSofRenderer.randomHex = () => '#' + ('000000' + Math.floor(Math.random() * 0xFFFFFF).toString(16)).slice(-6);