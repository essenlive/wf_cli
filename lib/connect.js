const prompts = require('prompts');
const wfAPI = require("./wfAPI.js")
const signale = require("signale");

const connect = async(args) => {
    
    signale.info("Fill your credentials to log into wikifactory.");

    let credentials = await prompts([{
        type: 'text',
        name: 'username',
        initial: args.username,
        message: 'What is your wikifactory login ?',
    }, {
        type: 'password',
        name: 'password',
        initial: args.password,
        message: 'What is your wikifactory password ?',
    }]);

    let response = await wfAPI.connect(credentials);
    if (response.status === "error") return new Error("Could not connect", response.content);

    return response.content; 

}


module.exports = connect;