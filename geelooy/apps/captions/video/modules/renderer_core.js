/*
ב"ה
B"H
*/

// Ensure the main namespace exists
self.einSofRenderer = self.einSofRenderer || {};

// --- Math & Random Utilities ---

self.einSofRenderer.random = function(min, max) {
    return min + Math.random() * (max - min);
};

self.einSofRenderer.randomHex = function() {
    return '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
};

// --- Color Utilities ---

self.einSofRenderer.hexToRgba = function(hex, alpha) {
    // Handle short hex (#FFF)
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
};

self.einSofRenderer.hexToRgb = function(hex) {
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r: r, g: g, b: b };
};

self.einSofRenderer.rgbToHsl = function(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h, s: s, l: l };
};

self.einSofRenderer.hslToHex = function(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return '#' + f(0) + f(8) + f(4);
};

self.einSofRenderer.generatePalette = function(numColors, baseHex) {
    const rgb = this.hexToRgb(baseHex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const palette = [];
    const baseHue = hsl.h * 360;
    
    for (let i = 0; i < numColors; i++) {
        // Shift hue, vary saturation/lightness randomly
        const hue = (baseHue + i * (360 / numColors) + (Math.random() - 0.5) * 40) % 360;
        const saturation = 80 + Math.random() * 20;
        const lightness = 65 + Math.random() * 15;
        palette.push(this.hslToHex(hue, saturation, lightness));
    }
    return palette;
};