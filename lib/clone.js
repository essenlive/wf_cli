const prompts = require("prompts");
const path = require("path");
const signale = require("signale");
const wfAPI = require("./wfAPI");
const fs = require("fs");
const YAML = require("yaml");



const clone = async (credentials, url) => {

    let response = await wfAPI.downloadFiles(credentials, url);
    if (response.status === "error")
      return new Error("Could not connect", response.content);

    return response.content; 
};

module.exports = clone;
