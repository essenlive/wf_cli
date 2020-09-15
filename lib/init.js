const prompts = require('prompts');
const path = require("path");
const signale = require("signale");
const wfAPI = require('./wfAPI');
const fs = require('fs');
const YAML = require('yaml')


const init = async(credentials) =>{
  
  if(!wfAPI.connected) await wfAPI.connect(credentials)      
  
    signale.wait("Fetching project options.");
    const projectOptions = await wfAPI.getProjectOptions();
    signale.success("Fetched project options successfully.");

    signale.start("Fill project info.");
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

    signale.wait("Initializing project.");
    projectInfo = await wfAPI.newProject(projectInfo);
    projectInfo.owner = projectOptions.availableOwners[projectInfo.owner].title;
    projectInfo.license = projectOptions.availableLicenses[projectInfo.license].title;
    projectInfo.phase = projectOptions.availablePhases[projectInfo.phase].title;

    fs.writeFileSync("wfproject.yml", YAML.stringify(projectInfo));
     fs.writeFileSync('README.md',
`# ${projectInfo.name}

${projectInfo.description}`)
 
    return projectInfo; 
    
}


module.exports = init;