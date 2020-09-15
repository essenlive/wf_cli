const yargs = require('yargs');
const Configstore = require('configstore');
const signale = require('signale');
const config = new Configstore('wf_CLI');
const wfAPI = require("./wfAPI.js");
const connect = require("./connect.js");
const init = require("./init.js");


const wf_cli = async () => {
  await wfAPI.init();
  yargs
    .command(
      "connect",
      "connect to wikifactory",
      (yargs) => yargs,
      async (argv) => {
        let currentCredentials =
          typeof config.get("credentials") === "undefined"
            ? { username: "", password: "" }
            : config.get("credentials");

        let credentials = await connect(currentCredentials);
        if (credentials instanceof Error) {
          signale.fatal("Wrong credentials.");
        } else {
          signale.success("Credentials updated !");
          config.set("credentials", credentials);
        }
      }
    )
    .command(
      "init",
      "initialize new project",
      (yargs) => yargs,
      async (argv) => {
        signale.info("Initialize new project in current directory.");

        if (typeof config.get("credentials") === "undefined") {
          signale.fatal("Connect to wikifactory first with connect cmd.");
          return;
        }

        let projectInfo = await init(config.get("credentials"));

        if (projectInfo instanceof Error) {
          signale.fatal("Could not initialize project.");
        } else {
          signale.success("Project initialized !");
        }
      }
    )
    .command(
      "commit",
      "commit and push changes to wikifactory",
      (yargs) =>
        yargs.option("m", {
          alias: "message",
          describe: "short description of the changes",
        }),
      (argv) => {
        console.log(argv.message);
      }
    )
    .help().argv;

    
    // wfAPI.browser.close();
};


module.exports = wf_cli;