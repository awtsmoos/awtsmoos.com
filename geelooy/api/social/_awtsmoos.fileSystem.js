//B"H
var {
    makeFile,
    readFile,
    makeFolder,
    deleteEntry,
    readFolder,
    moveEntry,
    copyEntry
} = require("./helper/fileSystem.js");

module.exports = ({$i}) => ({
	"/aliases/:alias/fileSystem/copyEntry": async vars => {
        const { alias } = vars;
        $i.$_POST["aliasId"] = alias;
        var { copyEntry } = require("./helper/fileSystem.js");
        return await copyEntry({ $i });
    },
	"/aliases/:alias/fileSystem/moveEntry": async vars => {
        const { alias } = vars;
        $i.$_POST["aliasId"] = alias;
        return await moveEntry({ $i });
    },

    "/aliases/:alias/fileSystem/readFile": async vars => {
        const { alias } = vars;
        $i.$_POST["aliasId"] = alias;

    

        return await readFile({
            $i
        });
    },
    "/aliases/:alias/fileSystem/makeFile": async vars => {
        try {
            const { alias } = vars;
            $i.$_POST["aliasId"] = alias;


            return await makeFile({
                $i
            });
        } catch(e) {
            return {error: e.stack}
        }
    },


    "/aliases/:alias/fileSystem/delete": async vars => {
        const { alias } = vars;
        $i.$_DELETE["aliasId"] = alias;

       

        return await deleteEntry({
            $i
        });
    },

    "/aliases/:alias/fileSystem/makeFolder": async vars => {
        const { alias } = vars;
        $i.$_POST["aliasId"] = alias;

       

        return await makeFolder({
            $i
        });
    },

    "/aliases/:alias/fileSystem/readFolder": async vars => {
        const { alias } = vars;
        $i.$_POST["aliasId"] = alias;


        return await readFolder({
            $i
        });
    }
});
