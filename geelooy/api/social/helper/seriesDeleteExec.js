//B"H
//Blessed is He
//Boruch Hashem
/**
 * Series deletion job entry point (relocated verbatim from series.js).
 */
const { er } = require("./general.js");
const { verifyHeichelAuthority } = require("./heichel.js");
const { seriesSubSeriesPath } = require("./seriesPaths.js");
const { compileFullDeletionTasksForSingleSeries } = require("./seriesDelete.js");

// 


async function deleteSeriesFromHeichel({$i, 
	heichelId, 
	seriesId, 
	parentSeriesId, 
	userid,
	deleteSelf = true
}) {
    const aliasId = $i.$_POST.aliasId;
    if (!aliasId || !parentSeriesId || seriesId === "root") return er({ message: "Invalid parameters for deletion." });

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    try {
      
        // Step 1: Create the top-level UNLINK task.
        const unlinkTask = {
            operation: 'REMOVE_FROM_ARRAY',
            params: {
                path: seriesSubSeriesPath(heichelId, parentSeriesId),
                conditions: { exact: { selfEquals: seriesId } }
            }
        };

        // Step 2: Get the parent's breadcrumb. We need this for the recursive compiler.
        const parentBreadcrumb = await $i.fetchAwtsmoos(`/api/social/heichelos/${heichelId}/series/${parentSeriesId}/breadcrumb`);
        if (!Array.isArray(parentBreadcrumb)) {
            throw new Error(`Could not fetch breadcrumb for known parent '${parentSeriesId}'.`);
        }

        // Step 3: Recursively compile all cleanup tasks for the series and its descendants.
        var contentCleanupTasks = await compileFullDeletionTasksForSingleSeries({
            $i,
            heichelId,
            seriesId,
            deleteSelf,
            parentBreadcrumb // Provide the starting context
        });
        
        if(deleteSelf) {
	        contentCleanupTasks  = [unlinkTask, ...contentCleanupTasks]
        }

        // Step 4: Create and queue the job.
        const { jobId } = await $i.createJob({
            description: `Fully ${deleteSelf ? 
	            "delete" : "empty"} series '${seriesId}' from parent '${parentSeriesId}'.`,
            tasks: contentCleanupTasks ,
            requestedBy: aliasId
        });
        
        return { 
            success: { 
                message: "Series deletion has been queued. All content and references will be removed shortly.",
                jobId: jobId ,
                deleteSelf
            } 
        };
    } catch (e) {
        return er({ code: "SERIES_DELETE_JOB_CREATION_FAILED", details: e.message, stack: e.stack });
    }
}

module.exports = { deleteSeriesFromHeichel };
