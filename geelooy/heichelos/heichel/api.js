// /heichelos/heichel/modules/api.js
// B"H
// The vessel for API interaction, restored to its correct, functional form.

const BASE_API_URL = "/api/social/";

import {
    makeSeries,
    makePost
} from "/scripts/awtsmoos/api/utils.js"
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`API GET Error: ${response.status} ${response.statusText} for URL: ${url}`);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Data fetch error:", url, e);
        return null;
    }
}

async function postData(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            body
        });
        if (!response.ok) {
            console.error(`API POST Error: ${response.status} ${response.statusText} for URL: ${url}`);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Data post error:", url, e);
        return null;
    }
}

export async function getHeichelDetails(heichelId) {
    return fetchData(`${BASE_API_URL}heichelos/${heichelId}`);
}

export async function checkOwnership(aliasId, heichelId) {
    if (!aliasId || !heichelId) return false;
    const res = await fetchData(`${BASE_API_URL}alias/${aliasId}/heichelos/${heichelId}/ownership`);
    return !!res?.yes;
}

// Gets the main series object, including the LIST of sub-series and post IDs
export async function getSeriesDetails(heichelId, seriesId) {
    return fetchData(`${BASE_API_URL}heichelos/${heichelId}/series/${seriesId}/details`);
}

// Fetches the details for posts in a series using GET
export async function getPostDetails(heichelId, seriesId) {
    if (!seriesId || seriesId === 'root') return [];
    
    // Using propertyMap as you did in the original file
    const propertyMap = JSON.stringify({
        content: 256,
        title: true,
        postId: true,
        author: true,
        id: true,
        seriesId: true,
        indexInSeries: true
    });
    const params = new URLSearchParams({ propertyMap });
    return fetchData(`/api/social/heichelos/${heichelId}/series/${seriesId}/posts/details?${params}`);
}

// **CORRECTED:** Fetches details for an array of sub-series IDs using a POST request
export async function getSubSeriesDetails(heichelId, parentSeriesId, seriesIds) {
    if (!parentSeriesId || !seriesIds || seriesIds.length === 0) return [];
    const body = new URLSearchParams({
        seriesIds: JSON.stringify(seriesIds)
    });
    // This now correctly uses POST as per your original main.js logic
    return postData(`${BASE_API_URL}heichelos/${heichelId}/series/${parentSeriesId}/details`, body);
}

export async function getBreadcrumb(heichelId, seriesId) {
    if (seriesId === 'root') return [];
    const data = await fetchData(`${BASE_API_URL}heichelos/${heichelId}/series/${seriesId}/breadcrumb`);
    return data?.reverse() || [];
}

export async function createSeries(data) {
    const {heichelId, parentSeriesId, title, aliasId, inputId, description} = data;
    const body = new URLSearchParams({
        title,
        aliasId,
        parentSeriesId,
        description,
        inputId
    });
     const result = await makeSeries({
         heichelId,
         parentSeriesId, // Create under the current series
         title,
         aliasId: window.curAlias,
         inputId, // Use user input or generated
         description
     });
    return result
        
    //postData(`${BASE_API_URL}heichelos/${heichelId}/makeSeries`, body);
}

// **CORRECTED:** Uses the exact, distinct deletion endpoints for posts and series
export async function deleteContent(data) {
    const {heichelId, aliasId, itemsToDelete} = data;
    const results = [];
    for (const item of itemsToDelete) {
        
        let reqUrl = item.type === 'post' 
            ? `${BASE_API_URL}heichelos/${heichelId}/series/${item.parentId}/post/${item.id}/delete` 
            : `${BASE_API_URL}heichelos/${heichelId}/deleteSeries/${item.id}`;

        const result = await postData(reqUrl, new URLSearchParams({ aliasId }));
        
        results.push({
            success: (result && (result.success || typeof result.deletedCount !== 'undefined' || result.ok)),
            item
        });
    }
    return results;
}

export function generateInputId(title) {
    if (!title) return `item-${Date.now()}`;
    const cleaned = title.replace(/[^a-zA-Z0-9\u0590-\u05FF\s-]/g, ' ').trim();
    const words = cleaned.split(/[\s-]+/).filter(Boolean);
    if (words.length === 0) return `item-${Date.now()}`;
    return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}