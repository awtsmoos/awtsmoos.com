/**
 * B"H
 * @module BulkLoader
 * @chapter The Unified Surge of Light
 * @description
 * Because the Awtsmoos API requires precise `verseSection` coordinates 
 * to return data perfectly (as proven by the working Sidebar), we must 
 * fire a parallel burst across every known physical verse index in the DOM.
 * 
 * HEALED: We no longer discard sparks that lack an `id`. If the API provides 
 * a pure vessel without an ID, we dynamically assign a Hash ID based on its 
 * essence (content). This ensures no Light is lost to the Void.
 */

import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "../unroller.js";

/**
 * @private
 * @function normalizeSparkDayuh
 * @description
 * The API is not always consistent about where it places coordinate metadata.
 * Inline placement requires `spark.dayuh.verseSection` (and optionally `subSection`).
 * This normalizer makes the coordinate explicit so the DOM weaver can always anchor.
 *
 * @param {any} spark - A single comment object from the API.
 * @param {string|number|null} defaultVerseSection - The verseSection that was queried.
 * @returns {object} - A normalized dayuh object.
 */
function normalizeSparkDayuh(spark, defaultVerseSection) {
    if (!spark || typeof spark !== "object") return { verseSection: defaultVerseSection };

    let dayuh = spark.dayuh;

    // Some endpoints serialize `dayuh` as JSON text.
    if (typeof dayuh === "string") {
        try { dayuh = JSON.parse(dayuh); } catch { dayuh = {}; }
    }

    if (!dayuh || typeof dayuh !== "object") dayuh = {};

    // Primary coordinate normalization
    if (dayuh.verseSection === undefined || dayuh.verseSection === null) {
        if (spark.verseSection !== undefined && spark.verseSection !== null) dayuh.verseSection = spark.verseSection;
        else dayuh.verseSection = defaultVerseSection;
    }

    // Optional sub-coordinate normalization (seen with varied key spellings across data sources)
    if (dayuh.subSection === undefined || dayuh.subSection === null) {
        if (spark.subSection !== undefined && spark.subSection !== null) dayuh.subSection = spark.subSection;
        else if (spark.sub !== undefined && spark.sub !== null) dayuh.subSection = spark.sub;
        else if (spark.sectionSub !== undefined && spark.sectionSub !== null) dayuh.subSection = spark.sectionSub;
    }

    return dayuh;
}

/**
 * @private
 * @function generateSparkHash
 * @description Creates a deterministic string hash from an object to serve as a unique DOM ID.
 */
function generateSparkHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * @function loadAllCommentsForAlias
 * @description
 * Connects to the Heavens (the API) by querying every verse index 
 * to fetch every single comment belonging to an alias within a post.
 * 
 * @param {string} alias - The identity of the commentator.
 * @param {Object} context - The Divine Context (post, heichel, series).
 * @returns {Promise<Array>} - A promise resolving to an array of unique purified sparks.
 */
export async function loadAllCommentsForAlias(alias, context) {
    if (!alias || !context) {
        console.warn("B\"H - [BulkLoader] Missing alias or context for summoning.");
        return [];
    }

    try {
        // Find exactly how many verses exist in the physical manifestation (the DOM)
        const verseElements = document.querySelectorAll('.section[data-awtsmoos-idx], .section[data-idx]');
        
        // Extract their unique indices
        const verseIndices = Array.from(verseElements)
            .map(el => el.dataset.awtsmoosIdx || el.dataset.idx)
            .filter((v, i, a) => a.indexOf(v) === i); // Ensure uniqueness

        console.log(`%c B"H - [BulkLoader] The Scroll contains ${verseIndices.length} physical verses. Preparing parallel fetch surge for @${alias}...`, "color: #ff9900; font-weight: bold; font-size: 14px;");

        const fetchPromises = [];

        // 1. Fetch for every physical verse
        verseIndices.forEach(vIdx => {
            console.log(`B"H - [BulkLoader] Firing API request for @${alias} at Verse Coordinate: ${vIdx}`);
            fetchPromises.push(
                getCommentsOfAlias({
                    seriesId: context.parentSeriesId || context.seriesId,
                    postId: context.id,
                    heichelId: context.heichel?.id,
                    aliasId: alias,
                    fromCache: false, // We must force the network to speak
                    get: { verseSection: vIdx, map: true }
                }).then(res => {
                    const unrolled = unrollApiResponse(res).map(spark => {
                        if (spark && typeof spark === "object") {
                            spark.dayuh = normalizeSparkDayuh(spark, vIdx);
                        }
                        return spark;
                    });
                    console.log(`B"H - [BulkLoader:Verse ${vIdx}] API Replied with ${unrolled.length} sparks for @${alias}.`);
                    return unrolled;
                }).catch(e => {
                    console.error(`B"H - [BulkLoader:Verse ${vIdx}] Rupture fetching for @${alias}:`, e);
                    return [];
                })
            );
        });

        // 2. Fetch for the Root of the post
        console.log(`B"H - [BulkLoader] Firing API request for @${alias} at the Root Coordinate.`);
        fetchPromises.push(
            getCommentsOfAlias({
                seriesId: context.parentSeriesId || context.seriesId,
                postId: context.id,
                heichelId: context.heichel?.id,
                aliasId: alias,
                fromCache: false,
                get: { verseSection: "root", map: true }
            }).then(res => {
                const unrolled = unrollApiResponse(res).map(spark => {
                    if (spark && typeof spark === "object") {
                        spark.dayuh = normalizeSparkDayuh(spark, "root");
                    }
                    return spark;
                });
                console.log(`B"H - [BulkLoader:Root] API Replied with ${unrolled.length} sparks for @${alias}.`);
                return unrolled;
            }).catch(e => {
                console.error(`B"H - [BulkLoader:Root] Rupture fetching for @${alias}:`, e);
                return [];
            })
        );

        // Await the great convergence
        console.log(`B"H - [BulkLoader] Waiting for ${fetchPromises.length} parallel requests to resolve...`);
        const rawResults = await Promise.all(fetchPromises);
        
        const allSparks = [];
        const seenIds = new Set();
        
        rawResults.forEach((unrolledArray, batchIdx) => {
            if (Array.isArray(unrolledArray)) {
                unrolledArray.forEach((spark, sparkIdx) => {
                    if (spark && typeof spark === 'object') {
                        // B"H - Coordinate normalization is mandatory for inline placement.
                        // If the API response omitted dayuh, we still know the verseSection from the request.
                        // (Most responses include it; this guards the edge cases that cause "sidebar works, inline doesn't".)
                        if (!spark.dayuh || typeof spark.dayuh !== "object") {
                            spark.dayuh = normalizeSparkDayuh(spark, spark.dayuh?.verseSection);
                        }

                        // B"H - Assign a deterministic ID if the API did not provide one.
                        // This guarantees the SparkFixer has a physical ID to anchor to in the DOM.
                        const trueId = spark.id || spark.commentId || spark.postId;
                        const generatedId = trueId || `awtsmoos-${generateSparkHash(JSON.stringify(spark.content || ""))}-${spark.dayuh?.verseSection || "root"}`;
                        
                        spark.id = generatedId; // Mutate the object to ensure the ID is manifest

                        if (!seenIds.has(String(spark.id))) {
                            seenIds.add(String(spark.id));
                            // Ensure author is set so renderers don't fail
                            if (!spark.author) spark.author = alias; 
                            allSparks.push(spark);
                        }
                    }
                });
            }
        });
        
        if (allSparks.length > 0) {
            console.log(`%c B"H - [BulkLoader] Glorious Convergence! Gathered ${allSparks.length} unique sparks for @${alias} across all coordinates.`, "color: #00ff00; font-weight: bold; font-size: 14px;");
        } else {
            console.log(`%c B"H - [BulkLoader] The heavens are silent. Gathered 0 sparks for @${alias}.`, "color: #999; font-style: italic;");
        }

        return allSparks;

    } catch (error) {
        console.error("B\"H - [BulkLoader] Catastrophic failure in the unified transmission:", error);
        return [];
    }
}
