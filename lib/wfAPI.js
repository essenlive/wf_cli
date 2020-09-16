const puppeteer = require('puppeteer');
const cheerio = require("cheerio");
const signale = require("signale");
const download = require("download");

const wfAPI = {
  pages: {
    home: "https://wikifactory.com",
    login: "https://wikifactory.com/sign-in?next=%2Fnew-project",
    newProject: "https://wikifactory.com/new-project",
  },
  browser: null,
  page: null,
  connected: false,
  async init() {
    // wfAPI.browser = await puppeteer.launch({ headless: false });
    wfAPI.browser = await puppeteer.launch();
    wfAPI.page = await wfAPI.browser.newPage();
    // await wfAPI.page.setViewport({
    //   width: 1000,
    //   height: 800,
    //   deviceScaleFactor: 1,
    // });
  },
  async connect(credentials) {
    try {
      signale.wait("Connecting to Wikifactory..");
      
      await wfAPI.page.goto(wfAPI.pages.login);
      // Removing cookies banner
      await wfAPI.page.waitForSelector("button.sc-oTDcV", {
        timeout: 5000,
      });
      await wfAPI.page.click("button.sc-oTDcV");
      
      await wfAPI.page.type("#signInForm-usernameEmail", credentials.username);
      const passwordInput = await wfAPI.page.$("#signInForm-password");
      await passwordInput.type(credentials.password);
      await passwordInput.press("Enter");
      await wfAPI.page.waitForNavigation({
        timeout: 5000,
        waitUntil: "domcontentloaded",
      });
      
      signale.success("Connection successfull");
      wfAPI.connected = true;
      
      return {
        status: "success",
        content: credentials,
      };
    } catch (error) {
      signale.fatal("Error while trying to connect to wikifactory.");
      signale.fatal(error);
      return {
        status: "error",
        content: error,
      };
    }
  },
  async getProjectOptions(credentials) {
    if (!wfAPI.connected) await wfAPI.connect(credentials);
    
    try {
      signale.wait("Fetching project options.");
      
      let projectOptions = {
        availableOwners: [],
        availableLicenses: [],
        availablePhases: [],
      };
      
      await wfAPI.page.goto(wfAPI.pages.newProject);
      
      await wfAPI.page.waitForSelector(".sc-pciEQ", { timeout: 5000 });
      let $ = cheerio.load(await wfAPI.page.content());
      $(".sc-pciEQ").each(function (i, elem) {
        projectOptions.availableOwners[i] = { title: $(this).text() };
      });
      
      await wfAPI.page.keyboard.press("Tab");
      await wfAPI.page.keyboard.press("Tab");
      await wfAPI.page.keyboard.press("Tab");
      await wfAPI.page.keyboard.press("Tab");
      await wfAPI.page.keyboard.press("Tab");
      $ = cheerio.load(await wfAPI.page.content());
      // console.log($(".bPwBqe").html());
      $(".sc-oTNDV:not('.eMJaGu')").each(function (i, elem) {
        projectOptions.availableLicenses[i] = { title: $(this).text() };
      });
      
      await wfAPI.page.keyboard.press("Tab");
      $ = cheerio.load(await wfAPI.page.content());
      $(".sc-pciEQ").each(function (i, elem) {
        projectOptions.availablePhases[i] = { title: $(this).text() };
      });
      
      signale.success("Fetched project options successfully.");
      
      return {
        status: "success",
        content: projectOptions,
      };
    } catch (error) {
      signale.fatal("Error while fetching project options.");
      signale.fatal(error);
      return {
        status: "error",
        content: error,
      };
    }
  },
  async newProject(credentials, projectInfo, projectOptions) {
    if (!wfAPI.connected) await wfAPI.connect(credentials);
    
    // Get index of select values
    const availableOwners = projectOptions.availableOwners.map(
      (el) => el.title
      ),
      availablePhases = projectOptions.availablePhases.map((el) => el.title),
      availableLicenses = projectOptions.availableLicenses.map(
        (el) => el.title
        );
        projectInfo.owner =
        availableOwners.indexOf(projectInfo.owner) >= 0
        ? availableOwners.indexOf(projectInfo.owner)
        : 0;
        projectInfo.phase =
        availablePhases.indexOf(projectInfo.phase) >= 0
        ? availablePhases.indexOf(projectInfo.phase)
        : 0;
        projectInfo.license =
        availableLicenses.indexOf(projectInfo.license) >= 0
        ? availableLicenses.indexOf(projectInfo.license)
        : 0;
        
        try {
          signale.wait("Creating project on wikifactory.");
          
          await wfAPI.page.goto(wfAPI.pages.newProject);
          await wfAPI.page.waitForSelector(".sc-pciEQ", { timeout: 5000 });
          
          // Fill owner input
          for (let i = 0; i < projectInfo.owner; i++) {
            await wfAPI.page.keyboard.press("ArrowDown");
          }
          await wfAPI.page.keyboard.press("Tab");
          await wfAPI.page.keyboard.press("Tab");
          
          // Fill project type
          await wfAPI.page.keyboard.press("ArrowDown");
          if (projectInfo.public) await wfAPI.page.keyboard.press("ArrowDown");
          await wfAPI.page.keyboard.press("Tab");
          
          // Fill project name
          await wfAPI.page.keyboard.type(projectInfo.name);
          await wfAPI.page.keyboard.press("Tab");
          
          // Fill project description
          await wfAPI.page.keyboard.type(projectInfo.description);
          await wfAPI.page.keyboard.press("Tab");
          
          // Fill license input
          for (let i = 0; i < projectInfo.license; i++) {
            await wfAPI.page.keyboard.press("ArrowDown");
          }
          await wfAPI.page.keyboard.press("Tab");
          
          // Fill phase input
          for (let i = 0; i < projectInfo.phase; i++) {
            await wfAPI.page.keyboard.press("ArrowDown");
          }
          await wfAPI.page.keyboard.press("Tab");
          
          // Fill topics input
          for (let i = 0; i < Math.min(projectInfo.topics.length, 2); i++) {
            await wfAPI.page.keyboard.type(projectInfo.topics[i]);
            await wfAPI.page.keyboard.press("Tab");
          }
          await wfAPI.page.keyboard.press("Tab");
          
          // Submit form
          await wfAPI.page.waitFor(500);
          await wfAPI.page.focus("button.dToLBM");
          await wfAPI.page.waitFor(500);
          await wfAPI.page.click("button.dToLBM");
          await wfAPI.page.waitForNavigation();
          signale.success("Project created succcessfully.");
          
          projectInfo.url = await wfAPI.page.url();
          projectInfo.illustration = "";
          projectInfo.owner = availableOwners[projectInfo.owner];
          projectInfo.license = availableLicenses[projectInfo.license];
          projectInfo.phase = availablePhases[projectInfo.phase];
          
          return {
            status: "success",
            content: projectInfo,
          };
        } catch (error) {
          signale.fatal("Error while creating project.");
          signale.fatal(error);
          return {
            status: "error",
            content: error,
          };
        }
      },
      // async addFiles(credentials, projectUrl, files = []) {
      //   if (!wfAPI.connected) await wfAPI.connect(credentials);
      
      //   try {
      //     signale.wait("Accessing project files.");
      
      //     await wfAPI.page.goto(`${projectUrl}/files`);
      //     await wfAPI.page.waitFor( 10000 );
      
      //     return {
      //       status: "success",
      //       content: files,
      //     };
      //   } catch (error) {
      //     signale.fatal("Error while adding files.");
      //     signale.fatal(error);
      //     return {
      //       status: "error",
      //       content: error,
      //     };
      //   }
      // }
      async downloadFiles(credentials, url) {
        if (!wfAPI.connected) await wfAPI.connect(credentials);
        
        try {
          signale.wait("Getting files on wikifactory.");
          
          await wfAPI.page.goto(`${url}/files`);
          await wfAPI.page.waitForSelector(".sc-prQdK", { timeout: 5000 });
          $ = cheerio.load(await wfAPI.page.content());
          let link = `${wfAPI.pages.home}${$(".sc-prQdK > a").attr("href")}`;
          
          await download(link, "./", {
            extract : true,
            filename: "file.zip"
          });
          
          signale.success("Files successfully dowloaded.");
          
          return {
            status: "success",
            content: link,
          };
        } catch (error) {
          signale.fatal("Error while dowloading files.");
          signale.fatal(error);
          return {
            status: "error",
            content: error,
          };
        }
      },
    };
    
    
    module.exports = wfAPI;