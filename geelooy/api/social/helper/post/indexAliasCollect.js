//B"H
//Blessed is He
//Boruch Hashem
/**
 * Verbatim try block of getPostsOfAliasInSeries: fetch and shape the alias's posts in one series.
 */
const { sp } = require("../_awtsmoos.constants.js");
const { er } = require("../general.js");
const { resolveSeriesInPath } = require("./indexAliasFallback.js");
const { buildPostPropertyMap } = require("./indexPostMap.js");

async function collectAliasPosts({ $i, aliasId, heichelId, seriesId, p }) {
	try {
		var postsPath = `${
				sp
			 }/heichelos/${
				heichelId
			 }/series/${
				seriesId
			 }/posts`;

		var allPostIDs = await $i.db.getObjectKeys(
			postsPath
		);
		if(!allPostIDs.length) {
			return await resolveSeriesInPath({
				$i,
				p,
				heichelId
			});
		}
		var mapObj = buildPostPropertyMap({ aliasId, allPostIDs });
		var allPosts = await $i.db.get(
			postsPath
			,
			{
				propertyMap: mapObj
			}
			
		);

		
		
		var ind = 0;
		var postArray = [];
		var k;
		var keys = Object.keys(allPosts)
		for(k of keys) {
			var po = allPosts[k];
			po.index = ind;
			postArray.push(po);
			ind++;
		}
		var vals = Object.values(allPosts)
		return {posts: vals};

		var postsNeedingDeletion = [];
		var legitPosts = {};
		var post;
		var i = 0;
		for(
			post of k
		) {
			var realPost = allPosts.find(q=>
				q == post 	
			)
			if(!realPost) {
				postsNeedingDeletion.push(post)
				
				i++;
				continue;
			}

			var details = await $i.db.get(
				postsPath, 
				{
					propertyMap: {
						[post]: {
							title: true,
							author: true,
							createdAt: true,
							id: true,
							parentSeriesId: true
						}
					}
				}
			)
/*
			if(details.author != aliasId) {
				postsNeedingDeletion.push(post)
				i++;
				continue;
			}
*/
			legitPosts[post] = details?.[post];
			
			i++;
		}
		var res = {};
		if(postsNeedingDeletion.length) {
			res.postsNeedingDeletion = 
				postsNeedingDeletion
		}
		res.posts = legitPosts;
		return res;
	} catch(e) {
		return er({
			stack: e.stack
		})
	}
}

module.exports = { collectAliasPosts };
