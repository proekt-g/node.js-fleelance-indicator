const puppeteer = require("puppeteer");
const Telegram = require("telegraf/telegram");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Username (kwork): ", (usernameKwork) => {
  rl.question("Password (kwork): ", (passwordKwork) => {
    rl.question("Username (hunt): ", (usernameHunt) => {
      rl.question("Password (hunt): ", (passwordHunt) => {
        rl.question("Indificator: ", (indificator) => {
          scrape(usernameKwork, passwordKwork, usernameHunt, passwordHunt, indificator).then((value) => {
            console.log(value);
          });
          rl.close();
        });
      });
    });
  });
});

const telegram = new Telegram("825031954:AAEFGlsZUGF_1MU97Le05zvwS6Fb-hr7YSg");

let scrape = async (usernameKwork, passwordKwork, usernameHunt, passwordHunt, indificator) => {
  const WIDTH_MONITOR = 1920,
    HEIGHT_MONITOR = 1080,
    ID_CHAT = "-349993394",
    HUNT_LINK_HASH_TAG = "https://freelancehunt.com/projects?skills[5B]5D=124",
    KWORK_LINK_HASH_TAG = "https://kwork.ru/projects?c=79",
    DELAY_PRINT_INPUT = 100;

  const USERNAME_KWORK = usernameKwork,
    PASSWORD_KWORK = passwordKwork,
    USERNAME_HUNT = usernameHunt,
    PASSWORD_HUNT = passwordHunt,
    INDIFICATOR = indificator;

  const SELECTOR_HUNT_PROJECT_LIST = "#projects-html",
    SELECTOR_HUNT_PROJECTS = "tr",
    SELECTOR_KWORK_PROJECTS = ".card",
    SELECTOR_HUNT_PROJECT_TIME = ".with-tooltip h2",
    SELECTOR_HUNT_CHOISE_TAG = ".select2-selection__choice",
    SELECTOR_HUNT_INPUT_LOG = "#login",
    SELECTOR_KWORK_INPUT_LOG = ".js-signin-input.js-signin-login-input",
    SELECTOR_KWORK_INPUT_PASSWORD = ".js-signin-input.js-signin-password-input",
    SELECTOR_HUNT_INPUT_PASSWORD = "#password",
    SELECTOR_HUNT_BUTTON_LOG = "#dologin",
    SELECTOR_KWORK_BUTTON_LOG = ".clearfix .login-js",
    SELECTOR_HUNT_INPUT_AUT = ".form-control.input-lg",
    SELECTOR_HUNT_BUTTON_AUT = "input[type=submit]",
    SELECTOR_HUNT_LOG_BUTTON = ".btn-group",
    SELECTOR_KWORK_LOG_BUTTON = ".js-signin-submit";

  const LIST_ALREDY_PROJECT = [];

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
    executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    ignoreDefaultArgs: ["--disable-extensions"],
  });

  const FREELANCE_HUNT_PAGE = await browser.newPage();
  await FREELANCE_HUNT_PAGE.setViewport({ width: WIDTH_MONITOR, height: HEIGHT_MONITOR });

  await FREELANCE_HUNT_PAGE.goto(HUNT_LINK_HASH_TAG);

  await FREELANCE_HUNT_PAGE.$eval(SELECTOR_HUNT_LOG_BUTTON, (button) => {
    button.classList.add("open");
  });

  await FREELANCE_HUNT_PAGE.type(SELECTOR_HUNT_INPUT_LOG, USERNAME_HUNT, { delay: DELAY_PRINT_INPUT });
  await FREELANCE_HUNT_PAGE.type(SELECTOR_HUNT_INPUT_PASSWORD, PASSWORD_HUNT, { delay: DELAY_PRINT_INPUT });

  await FREELANCE_HUNT_PAGE.click(SELECTOR_HUNT_BUTTON_LOG);

  await FREELANCE_HUNT_PAGE.waitForSelector(SELECTOR_HUNT_INPUT_AUT);

  await FREELANCE_HUNT_PAGE.type(SELECTOR_HUNT_INPUT_AUT, INDIFICATOR, { delay: DELAY_PRINT_INPUT });

  await FREELANCE_HUNT_PAGE.click(SELECTOR_HUNT_BUTTON_AUT);

  const KWORK_PAGE = await browser.newPage();
  await KWORK_PAGE.setViewport({ width: WIDTH_MONITOR, height: HEIGHT_MONITOR });

  await KWORK_PAGE.goto(KWORK_LINK_HASH_TAG);

  await KWORK_PAGE.click(SELECTOR_KWORK_BUTTON_LOG);

  await KWORK_PAGE.waitForSelector(SELECTOR_KWORK_INPUT_LOG);

  await KWORK_PAGE.type(SELECTOR_KWORK_INPUT_LOG, USERNAME_KWORK, { delay: DELAY_PRINT_INPUT });

  await KWORK_PAGE.type(SELECTOR_KWORK_INPUT_PASSWORD, PASSWORD_KWORK, { delay: DELAY_PRINT_INPUT });

  await KWORK_PAGE.waitForTimeout(1500);

  await KWORK_PAGE.click(SELECTOR_KWORK_LOG_BUTTON);

  KWORK_PAGE.close();

  async function main() {
    await FREELANCE_HUNT_PAGE.waitForSelector(SELECTOR_HUNT_PROJECT_TIME);

    const linkList = await FREELANCE_HUNT_PAGE.$$eval(SELECTOR_HUNT_PROJECTS, (projects) => {
      const SELECTOR_PROJECT_TIME = ".with-tooltip h2",
        SELECTOR_PROJECT_LINK = "td.left a",
        CURRENT_TIME = `${new Date().getHours() >= 10 ? new Date().getHours() : "0" + new Date().getHours()}:${
          new Date().getMinutes() >= 10 ? new Date().getMinutes() : "0" + new Date().getMinutes()
        }`;
      return projects.map((project) => {
        if (project.querySelector(SELECTOR_PROJECT_TIME) && project.querySelector(SELECTOR_PROJECT_TIME).textContent === CURRENT_TIME)
          return project.querySelector(SELECTOR_PROJECT_LINK).href;
      });
    });

    for (const link of linkList) {
      !LIST_ALREDY_PROJECT.includes(link) && link && (telegram.sendMessage(ID_CHAT, link), LIST_ALREDY_PROJECT.push(link));
    }

    const KWORK_PAGE = await browser.newPage();
    await KWORK_PAGE.setViewport({ width: WIDTH_MONITOR, height: HEIGHT_MONITOR });

    KWORK_PAGE.goto(KWORK_LINK_HASH_TAG);

    await KWORK_PAGE.waitForSelector(SELECTOR_KWORK_PROJECTS);

    const kworkLinkList = await KWORK_PAGE.$$eval(SELECTOR_KWORK_PROJECTS, (projects) => {
      return projects.map((project) => {
        return !project.querySelector(".query-seen_block.dib.mr10") && project.querySelector(".wants-card__header-title a").href;
      });
    });

    for (const link of kworkLinkList) {
      !LIST_ALREDY_PROJECT.includes(link) && link && (telegram.sendMessage(ID_CHAT, link), LIST_ALREDY_PROJECT.push(link));
    }

    await KWORK_PAGE.waitForTimeout(1500);

    KWORK_PAGE.close();

    await FREELANCE_HUNT_PAGE.waitForTimeout(1500);

    await FREELANCE_HUNT_PAGE.reload();

    LIST_ALREDY_PROJECT.length && console.log(LIST_ALREDY_PROJECT);

    await main();
  }
  await main();

  return "Err";
};
