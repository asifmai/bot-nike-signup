const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const {siteLink} = require('./keys');
const accountDetails = require('./keys').account;

const run = () => new Promise(async (resolve, reject) => {
  try {
    puppeteer.use(StealthPlugin());

    console.log('Bot Started...');

    await createAccount(accountDetails)
    
    console.log('Bot Finished...');
    resolve(true);
  } catch (error) {
    console.log(`Bot Run Error: ${error}`);
    reject(error);
  }
})

const createAccount = (account) => new Promise(async (resolve, reject) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });

    // Launch Page and Goto siteLink
    console.log('Loading site...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(siteLink, {timeout: 0, waitUntil: 'networkidle2'});

    // Navigate to Sign Up
    await page.waitForSelector('button.join-log-in');
    await page.click('button.join-log-in');

    await page.waitForSelector('div.loginJoinLink > a');
    await page.click('div.loginJoinLink > a');

    // Wait for input fields
    console.log('Filling fields...');
    await page.waitForSelector('input[name="emailAddress"]');

    // Fill the Fields
    await page.type('input[name="emailAddress"]', account.email);
    await page.type('input[name="password"]', account.password);
    await page.type('input[name="firstName"]', account.firstName);
    await page.type('input[name="lastName"]', account.lastName);
    await page.focus('input[name="dateOfBirth"]');
    await page.keyboard.type(account.dob);
    await page.select('select[name="country"]', account.country);
    let genderOptions = await page.$$('ul[data-componentname="gender"] > li');
    for (let i = 0; i < genderOptions.length; i++) {
      const gender = await genderOptions[i].$eval('span', elm => elm.innerText.trim().toLowerCase());
      if (gender == account.gender.toLowerCase()) {
        await genderOptions[i].click('input');
      }
    }
    await page.waitFor(3000);
    genderOptions = await page.$$('ul[data-componentname="gender"] > li');
    for (let i = 0; i < genderOptions.length; i++) {
      const gender = await genderOptions[i].$eval('span', elm => elm.innerText.trim().toLowerCase());
      if (gender == account.gender.toLowerCase()) {
        await genderOptions[i].click('input');
      }
    }
    await page.click('label.checkbox');
    await page.waitFor(3000);

    // Submit the form
    console.log('Submitting Form...');
    await page.click('input[value="JOIN US"]');
    await page.waitFor(10000);

    // Check if form Submitted
    const gotLogin = await page.$('button.join-log-in');
    if (gotLogin) {
      await browser.close();
      console.log('Failed...');
      resolve(false);
    } else {
      await browser.close();
      console.log('Account Created...');
      resolve(true);
    }
  } catch (error) {
    console.log(`createAccount[${account.email}] Error: `, error);
    resolve(false);
  }
});

run();