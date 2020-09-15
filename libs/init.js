const prompts = require('prompts');
const path = require("path");
const signale = require("signale");
const wfAPI = require('./wfAPI');

const init = async(credentials) =>{

    if(!wfAPI.connected){
        signale.info("Connecting first to Wikifactory..");  
        await wfAPI.connect(credentials)      
    }

    signale.info("Get project options.");
    const projectOptions = await wfAPI.getProjectOptions();

    signale.info("Fill project info.");
    let projectInfo = await prompts([
      {
        type: "select",
        name: "owner",
        message: "Owner of the project",
        choices: projectOptions.availableOwners,
        initial: 0,
      },
      {
        type: "toggle",
        name: "public",
        message: "Private or public project ?",
        initial: true,
        active: "Public",
        inactive: "Private",
      },
      {
        type: "text",
        name: "name",
        message: "Name of your project ?",
        initial: path.basename(path.resolve(process.cwd())),
        validate: (name) => (name === "" ? `You need a nroject name.` : true),
      },
      {
        type: "text",
        name: "description",
        message: "Description of your project ? ",
        validate: (description) =>
          description === "" ? `You need a project description.` : true,
      },
      {
        type: "select",
        name: "license",
        message: "Which license do you want ?",
        choices: projectOptions.availableLicenses,
        initial: 0,
      },
      {
        type: "select",
        name: "phase",
        message: "Which phase is your project on ?",
        choices: projectOptions.availablePhases,
        initial: 0,
      },
      {
        type: "list",
        name: "topics",
        message: "List maximum 3 topics for your project"
      },
    ]);

    signale.pending("Initializing project.");
    projectInfo = await wfAPI.newProject(projectInfo);

    console.log(projectInfo);
    
    return projectInfo; 
    
}


module.exports = init;