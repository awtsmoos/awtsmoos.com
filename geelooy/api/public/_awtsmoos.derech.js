/**
 * B"H
 * an API to get
 * files from the "public" folder
 * in the DB if it exists.
 */
var path = require("path");
var olam = {};
module.exports = {
    dynamicRoutes: async info => {
            var db = info.db;
            await info.use({
                "/": async vars => {
                    try {
                    
                        var $_POST = info.$_POST;
                        if ($_POST.authorized) {
                            return checkUser(info) ? {
                                status: "success"
                            } : {
                                status: "error"
                            }
                        }
                        
                    var pth = info.$_GET.path;
                    if(typeof(pth) !== "string")
                        return {
                            response: {
                                one: "two"
                            }
                        }
                        pth = path.join("social",pth )
                      
                    if(info.request.method.toLowerCase() == "get") {
                            var fl;
                            try {
                                var pubPath =pth;
                                fl = await info.db.get(pubPath, {
                                    extra: true,
                                    pageSize: 500,
                                    keepJSON: true
                                });
                            } catch(e){}

                            if(!fl) {
                                return {
                                    response: {
                                        not: "found"
                                    }
                                }
                            } else {
                            
                                var ex = info.path.extname(pth)
                                var mi = info.mimeTypes[ex];
                                
                                return {
                                    mimeType: mi,
                                    response: fl
                                    
                                }
                            }
                        }

                        
                        // Assuming all of the following code is wrapped in an async function

                        if ($_POST.endpoint === 'create') {

                            olam.replace = true;
                            if(!checkUser(info)) {
                                return {error: "You're not authorized to do that!"}
                            }
                            var { id, record } = $_POST;
                            if(!id) id = pth
                            try {
                                
                                
                                /**
                                 * if empty content,
                                 * creates folder automatically.
                                 * 
                                 * */
                                await db.create(id, record);
                                
                                return { status: 'success' };
                            } catch(err) {
                                return { status: 'error', message: err.message, stack:err.stack };
                            }
                        }

                        if ($_POST.endpoint === 'read') {
                            olam.replace = true;
                            if(!checkUser( info)) {
                                return {error: "You're not authorized to do that!"}
                            }

                            var { id } = $_POST;
                            if(!id) id = pth
                            try {
                                var record = await db.get(id);
                                
                                return { status: 'success', record };
                            } catch(err) {
                                return { status: 'error', message: err.message };
                            }
                        }

                        if ($_POST.endpoint === 'update') {
                            olam.replace = true;
                            if(!checkUser(info)) {
                                return {error: "You're not authorized to do that!"}
                            }
                            var { id, record } = $_POST;
                            if(!id) id = pth
                            try {
	                            console.log("UPDATING",id,record);
                                await db.write(id, record);
                                return { status: 'success' };
                            } catch(err) {
                                return { status: 'error', message: err.message };
                            }
                        }

                        if ($_POST.endpoint === 'delete') {
                            olam.replace = true;
                            if(!checkUser(info)) {
                                return {error: "You're not authorized to do that!"}
                            }
                            var { id } = $_POST;
                            if(!id) id = pth
                            try {
                                await db.delete(id);
                                return { status: 'success' };
                            } catch(err) {
                                return { status: 'error', message: err.message };
                            }
                        }
                    } catch(e) {
                        return {
                            error: {
                                message: "500 error",
                                stack: e.stack
                            }
                        }
                    }
                }
            });
    }
}

function checkUser($i) {
    if(
        $i.request.user &&
        $i.request.user.info.userId == "asdf"
    ) {
        return true;
    }
    return false;
}