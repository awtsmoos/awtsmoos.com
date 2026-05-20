/**
 * B"H
 */


var {
    sp
} = require("./_awtsmoos.constants.js");

module.exports = {
    verifyAlias,
    getAlias,
    updateAlias,
    getAliasesDetails,
    getAliasIDs,
    
    createNewAlias,
    verifyAliasOwnership,
    verifyAlias,
    deleteAlias,

	generateAliasId,

    getDetailedAlias,
	setDefaultAlias,
	getDefaultAlias
};



var {
    er
 ,myOpts,
 generateAwtsmoosId,
	sortArray
} = require("./general.js");

async function getDefaultAlias({$i, userid}) {
	var cook = $i?.request?.user?.info?.hosuhfuh?.alias
	
	if(cook) {
		return {success: cook}
	}
	return er({
		code: "NO_DEFAULT",
		error: "no default alias set",
		detail:$i.request.user
	})
}

async function setDefaultAlias({$i, userid}) {
	var alias = $i.$_POST.aliasId || $i.$_POST.alias;
	var owns = await verifyAlias({aliasId: alias, $i, userid})
	if(!owns) {
		return er({
			code: "NOT_AUTHORIZED",
			error: "You do not own that alias",
			details: alias
		})
	}
	
	
	try {
		var token = $i.makeToken(userid, {alias})
		var success = token.success
		if(!success) {
			return er({
				error: "some token error",
				details: token.error+""
			})
		}
		
		var resp = $i.setCookie("awtsmoosKey", success)
		if(resp.success)
			return {success: "you did it", details: alias}
		else {
			return er({
				error: "something went wrong",
				details: resp
			})
		}
	} catch(e) {
		return er({
			code: "cookie error",
			er:e+""
		})
	}
}
async function verifyAlias({aliasId, $i, userid}) {
    
    return await $i.db.get(
     
      `/users/${userid}/aliases/${aliasId}`, myOpts($i)
    );
    /*
    if(!aliases || !Array.isArray(aliases)) 
      return false;
  
    
    var hasIt = aliases.includes(aliasId);
    
    return hasIt;*/
  }
  
  
  async function getAlias(aliasId, $i){
    
    
   
    var ail = await $i
    .db
    .get(
  
      `${sp}/aliases/${
        aliasId
      }/info`
    );

	if(!ail) {
		return er({
			message: "NO alias found",
			code: "NO_ALIAS",
			aliasId
		})
	}

	if(ail?.user) {
		delete ail.user
	}
	
	return ail;
  
  
  }


  
async function deleteAlias({
	$i,
	
	
	aliasId,
	
	userid
}) {
	
	
	
	
	if (!aliasId) {
		return er("No alias ID provided");
	}
	
	var ver = await verifyAlias({aliasId, $i, userid});
	if (!ver) {
		return er("Not your alias");
	}
	
	try {
		// Delete alias from user's aliases
		await $i.db.delete(`/users/${userid}/aliases/${aliasId}`);
		
		
		// Get all heichelos associated with the alias
		var heichelos = await $i
			.db.get(sp + `/aliases/${aliasId}/heichelos`,myOpts($i));
		
		if (heichelos) {
			for (var heichelId in heichelos) {
				// Delete all heichelos data
				
				await $i.db.delete(sp + `/heichelos/${heichelId}`, true);
			}
		}
		await $i.db.delete(sp + `/aliases/${aliasId}`);
		
		return {
			message: "Alias and associated data deleted successfully",
			code: "DEL_DONE"
		};
	} catch (error) {
		console.error('Error deleting alias and associated data:', error);
		return er({error:"Error deleting alias and associated data", code: "DEL_ER"});
	}
}

async function updateAlias({
	$i,
	aliasId,
	userid
	

}) {
	var aliasId = aliasId || $i.$_PUT.aliasId;
	var inp = $i.$_PUT.inputId;

	var newAliasName = $i.$_PUT.newAliasName ||
		$i.$_PUT.aliasName || 
		$i.$_PUT.name;
	var desc = $i.$_PUT.description || 
		$i.$_PUT.newDescription;
	
	if (!aliasId) {
		return er({
			message: "Alias ID or new alias name not provided",
			detail: {
				aliasId,
				newAliasName
			}
		});
	}
	
	var isVerified = await verifyAliasOwnership(
		aliasId,
		$i,
		userid
	);
	
	if (!isVerified) {
		return er({
			message: "You don't have permission to modify this alias."
		});
	}
	
	if(newAliasName) {
		if (newAliasName.length > 50) {
			return er({
				message:"Invalid new alias name",
				proper:50
			});
		}
	}
	
	if(
		desc && typeof(desc) == "string"
	) {
		if(
			desc.length > 5784
		) {
			return er({
				message: "Too long description",
				code: "DESC_TOO_LONG"
			})
		}
	}
	
	try {
		// Fetch the existing alias data
		var aliasData = await $i.db.get(sp + `/aliases/${aliasId}/info`,myOpts($i));
		
		if (!aliasData) {
			return er("Alias not found");
		}
		
		if(newAliasName)
			// Update the alias name in the existing data
			aliasData.name = newAliasName;
		
		
		var aliasUserData = {aliasId};
		if(newAliasName) {
			aliasUserData.name = newAliasName;
		}
		if(desc) {
			aliasUserData.description = desc;
		}
			

		// Write the updated data back without destroying public owner metadata.
		var publicAliasData = {
			...aliasData,
			...(newAliasName ? { name: newAliasName } : {}),
			...(desc ? { description: desc } : {})
		};
		await $i.db.write(sp + `/aliases/${aliasId}/info`, publicAliasData);
		// Also update the alias name in user's aliases list
		await $i.db.write(
			`/users/${userid}/aliases/${aliasId}`, 
			aliasUserData
		);
		
		
		
		return { message: "Alias edited successfully", newAliasName, code:"ALIAS_EDIT_GOOD" };
	} catch (error) {
		console.log(error)
		return er("Failed to edit alias");
	}
}



async function getDetailedAliasesByArray({
    aliasIds,
       $i,
       
       userID
   }){
	if(!Array.isArray(aliasIds)) {
		return [er({
			message: "NO IDs!?",
			aliasIds,
			userID,
			$i
		})]
	}
       return await Promise.all(
               sortArray(aliasIds.map(id => ((async (aliasId) => {
                   var detailedAlias = await 
                   getDetailedAlias({
                       
                       aliasId,
                       $i,
                       userID
                   });
                   return detailedAlias;
                   
               }))(id)))
           );
   
   }
   
   async function getDetailedAlias({
       aliasId,
       $i,
       userID
   }) {
       var user = userID;
       if(!userID) {
		   var pth = `${sp}/aliases/${
                       aliasId
                   }/info`
           var value = await $i
               .db
               .get(
                   pth,
		  myOpts($i)
                   
               );
			   
           if(!value) {
               return null
           }
   
           user = value.user;
       }
       if(!user) {
           return er("Couldn't find alias")
       }
       var detailedAlias = await $i
           .db
           .get(`/users/${
               user
           }/aliases/${
               aliasId
           }`, myOpts($i));
       if(!detailedAlias) return null;
       if(!detailedAlias.description) {
           detailedAlias.description = ""
       }
   
       detailedAlias.id = aliasId
       
        return detailedAlias;
   }



   async function getAliasIDs({
	$i,
	userID

}){
	var options = myOpts($i)
			var aliases;
			try {
				aliases = await $i
				.db
				.get(
					`/users/${
						userID
					}/aliases/`,
					options
				);
				
				var ar = aliases || [];
				ar  = sortArray(ar);
				return ar;
			} catch(e) {
				return [];
			}

}

async function generateAliasId({
	$i
}) {
	return await generateAwtsmoosId({
		$i,
		nameVar:"aliasName",
		idVar: "aliasId",
		existingPath: `${sp}/aliases`,
		maxNameLength: 50,
		maxInputId: 26
	})
}


/**
required: aliasName;
optional: 
	description
	custom id: id
**/
async function createNewAlias({
	$i, 
	userid
}) {
	
	var aliasName = $i.$_POST.aliasName;
	var desc = $i.$_POST.description;

	if (typeof aliasName !== "string" || !aliasName.trim()) {
		return er({ message: "aliasName is required", code: "NO_ALIAS_NAME" });
	}
	if (aliasName.length > 50) {
		return er({ message: "Alias name too long", code: "ALIAS_NAME_TOO_LONG", proper: 50 });
	}
	if (desc && typeof desc === "string" && desc.length > 5784) {
		return er({ message: "Too long description", code: "DESC_TOO_LONG" });
	}

	let iteration = 0;
	let unique = false;
	let aliasId = await generateAliasId({
		$i
	});
	if(aliasId) {
		if(aliasId.error) {
			return {
				error: aliasId.error,
				hi:"there",
				entire:aliasId
			}
		} else if(aliasId.aliasId)
			aliasId  = aliasId.aliasId
	}
	
	
	
	await $i.db.write(
		
		`/users/${
		userid
		}/aliases/${
		aliasId
		}`, {
				name: aliasName,
				aliasId,
				...(
					desc?{
						description: desc
					}:null
				)
			}
	);

	await $i.db.write(
		sp +
		`/aliases/${
	  aliasId
	}/info`, {
			name: aliasName,
			user: userid
		}
	);
	return { name: aliasName, aliasId };
}

async function getAliasesDetails({
	$i,
	sp,
	userID=null,
	aliasId,

	
}) {
	
	if ($i.request.method == "POST") {
		var aliasIds = $i.$_POST.aliasIds;
		/**
		 * formatted:
		 * aliasIds: [
		 *  
		 *    aliasIds (String)
		 * 
		 * ]
		 */
		if (!aliasIds || !Array.isArray(aliasIds)) {
			return er("Invalid input");
		}

		aliasIds = sortArray(aliasIds);
		
		var details = await 
		getDetailedAliasesByArray({
			$i,
			userID,
			sp,
			aliasIds
		});
		
		return sortArray(details);
	} else if($i.request.method == "GET") {
		var ids= await getAliasIDs({
				$i,
				userID,
				sp

			})
		ids = sortArray(ids);
		var det = await 
		getDetailedAliasesByArray({
			$i,
			userID,
			sp,
			aliasIds:ids
		});
		det = sortArray(det);
		return det;
	}
	
	
}


/**
 * @method verifyAliasOwnership 
 * @param {string} aliasId 
 * @param {Object} $i 
 * @param {string} userid 
 * @returns 
 */
async function verifyAliasOwnership(aliasId, $i, userid) {
    try {
      // Fetch the alias $i using alias ID
      var alias$i = await $i.db.get(`/users/${userid}/aliases/${aliasId}`,myOpts($i));
  
      // If alias $i exists and it belongs to the current us return true
      if (alias$i) {
        return alias$i;
      }
    } catch (error) {
      console.error("Failed to verify alias ownership", error);
    }
  
    // In all other cases (alias not found, or doesn't belong to user), return false
    return false;
  }
  
  
