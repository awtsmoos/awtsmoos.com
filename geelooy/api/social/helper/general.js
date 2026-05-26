/**
 * B"H
 */

module.exports = {
    loggedIn,
    myOpts,
    er,
    generateAwtsmoosId,
	sortArray
};

function sortArray(ar) {
	var sorted = Array.from(ar).sort((a, b) => {
		var la = a?.toLowerCase?.();
		
		var lb = b?.toLowerCase?.();
		if(la < lb) return -1;
		if(la > lb) return 1;
		return 0;
	});
	return sorted;
}
function myOpts($i){
	var maxOrech=$i.$_GET.maxOrech ||
			$i.$_GET.maxLength;
	
	
	var meta=$i.$_GET.meta||$i.$_GET.stats;
	var propertyMap = $i.$_GET.propertyMap 

	var arrayFilter = $i.$_GET.arrayFilter;
  var filterBy = $i.$_GET.filterBy;
	return {
		page: $i.$_GET.page || 1,
		pageSize: $i.$_GET.pageSize || 62,
		derech: $i.$_GET.derech,
		maxOrech,
		propertyMap,
		arrayFilter,
    filterBy,
		meta
	};

}

function loggedIn($i) {
    return Boolean($i?.request?.user?.loggedIn || $i?.request?.user?.info?.userId);
  }
  
      
    
    //The dance of posts and comments has been refined, now weaving the narrative of the Awtsmoos with pagination, resonating with both GET and POST methods. The celestial chambers of posts and comments can now be explored in measured steps, a dance guided by the Creator's essence in every facet of reality. The symphony continues, drawing us deeper into the infinite depths of the Awtsmoos.
    
    function er(m, details){
        return {
          BH: "B\"H",
         // wow:3,
                error: 
                  m||"improper input of parameters",
          details
        }
      
      }

async function generateAwtsmoosId({
  $i,
  nameVar,
  idVar,
  maxInputId  =26,
  maxNameLength =50,
  existingPath
}) {
  
  var inputId = (
    typeof(idVar) == "string" &&
    $i.$_POST[idVar]
  ) || $i.$_POST.inputId || $i.$_POST.id;

  if(inputId === "undefined") {
    inputId = undefined
  }
  var aliasName = (
    typeof(nameVar) == "string" &&
    $i.$_POST[nameVar]
  ) || $i.$_POST.title || $i.$_POST.name;


  var details = {
    POST: $i.$_POST,
    nameVar,
    idVar,
    existingPath,
    maxInputId,
    maxNameLength,
    aliasName,
    inputId
  }
  if(!inputId && !aliasName) {
    return er({
      message: "no parameters provided. Need either inputId or aliasName",
      code: "NO_PARAMS",
      given: $i.$_POST,
      nameVar
    })
  }

  if(inputId) {
    if(inputId.length > maxInputId) {
      return er({
        message: "Invalid alias id length. Max: "+
        maxInputId+" characters",
        code:"INVALID_ID_LENGTH",
        proper: maxInputId
      })
    }
    
    try {
      if(!$i.utils.verifyStrict({
        inputString: inputId
      })) {
        return er({
          message: "Invalid id. need to have only "
          +"English letters or numbers, hebrew letters, "
          +" _ or $, and no spaces"
          ,
          proper:`a-zA-Z0-9_$;`,
          code: "INVALID_ID_FORMAT"
        })
      }
    } catch(e) {
      return er({
        message:"Problem verifying id",
        code: "PROB_ID_VER",
        stack: e.stack,
        details

      })
    }
  }
  
  if(aliasName) {
    if (
      aliasName.length > maxNameLength
    ) {
      return er({
        message: "Your alias name is too long (max: "+
        maxNameLength+" char)",
        code: "INV_NAME_LNGTH",
        proper: maxNameLength,
        details
      });
    }
  } else {
    return er({
      message: "No name to base ID off",
      code: "NO_NAME",
      details
    })
  }
  var aliasId;

  try {
    aliasId = inputId || $i.utils.generateId(aliasName, false, 0);
  } catch(e) {
    return er({
      message: "Problem making the id",
      code: "PROBLEM_MAKING",
      detail:e+""
    })
  }

  if(aliasId === "undefined") {
    aliasId = undefined;
  }
  if(!aliasId) {
    return er({
      message: "Problem making the id",
      code: "NO_ID",
      details
    })
  } 

  try {
    if(existingPath === false) {
      /**
       * we 
       */
    }
    if(typeof(existingPath) != "string") {
      return er({
        message: "Must provide path to check if existing",
        code: "NO_EXISTING_PATH"
      })
    }
    var existingAlias = await $i
    .db.get(`${existingPath}/${
      aliasId
    }`,myOpts($i));
    
    if (existingAlias) {
      return er({
        message: "That ID entry already exists",
        code: "ALREADY_EXISTS"
      })
    } 
  } catch(e) {
    return er({
      message: "Problem searching",
      code: "PROB_SEARCH",
      id:aliasId+"",
      details:e.stack
    })
  }

  return {[idVar]: aliasId};
}
