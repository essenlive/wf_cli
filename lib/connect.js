const prompts = require('prompts');
const wfAPI = require("./wfAPI.js")
const signale = require("signale");

const connect = async(args) => {
    
    signale.info("We will ask you your credentials to log into wikifactory.");

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

    credentials = await wfAPI.connect(credentials);

    return (credentials); 

}


module.exports = connect;