const puppeteer = require("puppeteer");
const Telegram = require("telegraf/telegram");
const express = require("express");

const app = express();

app.listen(PORT, () => {
  console.log("Server has been started...");
});

const PORT = process.env.PORT || 80;

const telegram = new Telegram("825031954:AAEFGlsZUGF_1MU97Le05zvwS6Fb-hr7YSg");

let scrape = async () => {
  const WIDTH_MONITOR = 1920,
    HEIGHT_MONITOR = 1080,
    ID_CHAT = "-349993394",
    HUNT_LINK_HASH_TAG = "https://freelancehunt.com/projects?skills[5B]5D=124",
    KWORK_LINK_HASH_TAG = "https://kwork.ru/projects?c=79";

  const SELECTOR_HUNT_PROJECT_LIST = "#projects-html",
    SELECTOR_HUNT_PROJECTS = "tr",
    SELECTOR_KWORK_PROJECTS = ".card",
    SELECTOR_HUNT_PROJECT_TIME = ".with-tooltip h2",
    SELECTOR_HUNT_CHOISE_TAG = ".select2-selection__choice";

  const LIST_ALREDY_PROJECT = [];

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: false,
    executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    ignoreDefaultArgs: ["--disable-extensions"],
  });

  const FREELANCE_HUNT_PAGE = await browser.newPage();
  await FREELANCE_HUNT_PAGE.setViewport({ width: WIDTH_MONITOR, height: HEIGHT_MONITOR });

  FREELANCE_HUNT_PAGE.goto(HUNT_LINK_HASH_TAG);
  await FREELANCE_HUNT_PAGE.waitForSelector(SELECTOR_HUNT_CHOISE_TAG);
  await FREELANCE_HUNT_PAGE.waitForSelector(SELECTOR_HUNT_PROJECT_LIST);

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

scrape().then((value) => {
  console.log(value);
});
