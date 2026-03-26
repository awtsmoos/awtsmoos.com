
// B"H
/**
 * @file html.js
 * @brief Decodes the structure of HTML to find external script and style links.
 */

export const HTMLParser = {
    parse(htmlString) {
        const links = [];
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            
            const scripts = doc.querySelectorAll('script[src]');
            scripts.forEach(s => {
                const src = s.getAttribute('src');
                if (this._isLocal(src)) links.push(src);
            });
            
            const styles = doc.querySelectorAll('link[rel="stylesheet"][href]');
            styles.forEach(s => {
                const href = s.getAttribute('href');
                if (this._isLocal(href)) links.push(href);
            });
        } catch (e) {}
        return links;
    },
    _isLocal(url) {
        if (!url) return false;
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('#')) return false;
        return true;
    }
};
