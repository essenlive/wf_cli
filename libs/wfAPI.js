const puppeteer = require('puppeteer');
const cheerio = require("cheerio");
const signale = require("signale");
const { await } = require('signale');


const wfAPI = {
  pages: {
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
  },
  async connect(credentials) {
    try {
      signale.pending("Connecting to Wikifactory..");
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
      return credentials;
    } catch (error) {
      wfAPI.browser.close();
      return error;
    }
  },
  async getProjectOptions() {
    try {
      let projectOptions = {
        availableOwners: [],
        availableLicenses: [],
        availablePhases: [],
      };
      signale.pending("Accessing Wikifactory..");
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
      $(".sc-oTNDV").each(function (i, elem) {
        projectOptions.availableLicenses[i] = { title: $(this).text() };
      });

      await wfAPI.page.keyboard.press("Tab");
      $ = cheerio.load(await wfAPI.page.content());
      // console.log($(".bPwBqe").html());
      $(".sc-pciEQ").each(function (i, elem) {
        projectOptions.availablePhases[i] = { title: $(this).text() };
      });

			return projectOptions;
			
    } catch (error) {
      wfAPI.browser.close();
      return error;
    }
  },
  async newProject(projectInfo) {
    try {
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
			await wfAPI.page.keyboard.press("Tab");
			
      // Fill phase input
      for (let i = 0; i < projectInfo.phase; i++) {
        await wfAPI.page.keyboard.press("ArrowDown");
			}
      await wfAPI.page.keyboard.press("Tab");

      await wfAPI.page.waitFor(5000);
      // Submit form
      await wfAPI.page.click("button.dToLBM");
      await wfAPI.page.waitFor(500);
      await wfAPI.page.click("button.dToLBM");
      await wfAPI.page.waitFor(500);
      await wfAPI.page.click("button.dToLBM");
      await wfAPI.page.waitForNavigation();

      return projectInfo;
    } catch (error) {
			console.log(error);
      wfAPI.browser.close();
      return error;
		}
		
  },
};


module.exports = wfAPI;