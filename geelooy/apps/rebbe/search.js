//B"H
// search.js - Archive Index Search

import { getSearchIndex, saveSearchIndex } from './modules/store.js';

const BUCKET_MONTHS = "months-1764928230";
const BUCKET_DAYS = "days-1764928230";

export async function searchArchive(monthId, dayNum) {
    let results = [];
    
    // 1. Search by Month if provided
    if (monthId) {
        const events = await fetchIndex(BUCKET_MONTHS, `${monthId}.json`);
        results = results.concat(events);
    }
    
    // 2. Search by Day if provided
    if (dayNum) {
        const events = await fetchIndex(BUCKET_DAYS, `${dayNum}.json`);
        
        if (monthId) {
            // Intersection: Filter day results to match month
            // The JSON structure has "month_id" in events
            results = events.filter(e => e.month_id == monthId);
        } else {
            results = events;
        }
    }
    
    // Dummy Search if no index logic
    if(!monthId && !dayNum) {
        // Just searching text passed in monthId as query
        // This requires a full text index which we don't have, 
        // but for now we'll just return empty or perform a mock search on loaded tracks
    }

    return results;
}

async function fetchIndex(bucket, filename) {
    const key = `${bucket}/${filename}`;
    
    // Check Cache
    try {
        const cached = await getSearchIndex(key);
        if (cached) return cached;
    } catch (e) { console.warn("Cache read failed", e); }

    // Fetch Network
    try {
        const url = `https://archive.org/download/${bucket}/${filename}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        const events = data.events || [];
        
        // Cache
        try { await saveSearchIndex(key, events); } catch(e){}
        
        return events;
    } catch (e) {
        console.error("Fetch failed", key, e);
        return [];
    }
}