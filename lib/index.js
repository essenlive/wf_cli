const yargs = require('yargs');
const Configstore = require('configstore');
const signale = require('signale');
const config = new Configstore('wf_CLI');
const wfAPI = require("./wfAPI.js");
const connect = require("./connect.js");
const init = require("./init.js");
const commit = require("./commit.js");
const clone = require('./clone.js');


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
        await wfAPI.browser.close();
      }
    )
    .command(
      "init",
      "initialize new project",
      (yargs) => yargs,

      async (argv) => {
        if (typeof config.get("credentials") === "undefined") {
          signale.fatal("Connect to wikifactory first with connect cmd.");
          return;
        }
        await init(config.get("credentials"));
        await wfAPI.browser.close();
      }
    )
    .command(
      "commit",
      "commit and push files to wikifactory",
      (yargs) => yargs,
      async (argv) => {
        console.log("commit");
        await commit(config.get("credentials"));
        await wfAPI.browser.close();
      }
    )
    .command(
      "clone",
      "clone wikifactory repository",
      (yargs) => yargs,
      async (argv) => {
        await clone(config.get("credentials"), argv.u);
        await wfAPI.browser.close();
      }
    )
    .help().argv;

};


module.exports = wf_cli;