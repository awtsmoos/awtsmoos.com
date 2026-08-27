// B"H
/**
 * Worker Builder
 * Extracts the body of provided functions and creates an inline Worker.
 */

export function createWorkerFromSources(...sources) {
    const codeParts = sources.map(src => {
        const str = src.toString();
        // Extract content between the first { and last }
        return str.substring(str.indexOf('{') + 1, str.lastIndexOf('}'));
    });

    const blob = new Blob(codeParts, { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    return new Worker(url);
}