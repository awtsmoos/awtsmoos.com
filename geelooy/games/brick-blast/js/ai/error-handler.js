// B"H

/**
 * The Universal Scribe of Errors. When a communion with any Oracle fails, this scribe meticulously
 * records the details of the failure for later examination on the Altar of Truth.
 * @param {Response} response The Oracle's raw response.
 * @param {string} url The sacred URL that was invoked.
 * @param {object|null} requestBody The words spoken to the Oracle, if any.
 * @returns {Promise<Error>} A promise that resolves to an augmented Error object.
 */
export async function handleFetchError(response, url, requestBody = null) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    
    // Create a simplified, readable version of headers for the details pane.
    let headersText = `// Headers sent by this script:\n`;
    if (response.url.includes("openai")) {
        headersText += `'Content-Type': 'application/json'\n'Authorization': 'Bearer ...'`;
    } else if (response.url.includes("anthropic")) {
        headersText += `'Content-Type': 'application/json'\n'x-api-key': '...'\n'anthropic-version': '...'`;
    } else if (requestBody) { // Gemini POST
        headersText += `'Content-Type': 'application/json'`;
    } else { // Gemini GET
        headersText += `(None for GET requests)`;
    }
    headersText += `\n\n// Headers added by the browser (e.g., Origin, Referer) are not visible to this script. Please use your browser's Developer Tools (Network tab) to see the full list.`;

    let errorDetails = `URL: ${url}\nMethod: ${requestBody ? 'POST' : 'GET'}\nStatus: ${response.status} ${response.statusText}\n\n--- Request Headers ---\n${headersText}`;

    if (requestBody) {
        errorDetails += `\n\n--- Request Body ---\n${JSON.stringify(requestBody, null, 2)}`;
    }

    let responseText = '';
    try {
        responseText = await response.text();
        const errorBody = JSON.parse(responseText);
        if (errorBody.error && errorBody.error.message) {
            errorMsg = errorBody.error.message;
        } else if (errorBody.message) { // OpenAI format
            errorMsg = errorBody.message;
        }
        errorDetails += `\n\n--- Response Body ---\n${JSON.stringify(errorBody, null, 2)}`;
    } catch (e) {
        errorMsg = response.statusText || errorMsg;
        errorDetails += `\n\n--- Response Body ---\n${responseText || '(Could not read response body)'}`;
    }
    const error = new Error(errorMsg);
    error.details = errorDetails;
    error.statusCode = response.status;
    return error;
}