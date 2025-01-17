//B"H
var {
    makeFile,
    readFile,
    makeFolder,
    readFolder
} = require("./helper/fileSystem.js");

module.exports = ({$i}) => ({
    "/aliases/:alias/fileSystem/makeFile": async vars => {
        const { alias } = vars;
        $i.$_POST["aliasId"] = alias;


        return await makeFile({
            $i
        });
    },

    "/aliases/:alias/fileSystem/readFile": async vars => {
        const { alias } = vars;
        $i.$_POST["aliasId"] = alias;

    

        return await readFile({
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
