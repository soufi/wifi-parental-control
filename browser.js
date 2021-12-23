const puppeteer = require("puppeteer")
const async = require('async')
const { logger } = require('./logger.js')

class Browser {

  constructor(credentials = {}, blackList = [], opts = {}) {
    if (opts && opts.constructor === Object) {
      this.opts = Object.assign(this.getDefaultOpts(), opts)
    } else {
      this.opts = this.getDefaultOpts()
    }

    if (credentials && credentials.constructor === Object) {
      this.wifiCreds = credentials.wifiCreds
    } else {
      this.wifiCreds = { username: '', pwd: '' }
    }

    if (Array.isArray(blackList)) {
      this.blackList = blackList
    } else {
      this.blackList = []
    }
  }

  getDataFilesDir() {
    return '/home/pi/Documents/parentalcontrol/data/puppeteer'
  }

  getBlackList() {
    return this.blackList
  }

  /**
   * Browser instance default options
   */
  getDefaultOpts() {
    return {
      headless: false,
      userDataDir: this.getDataFilesDir(),
      executablePath: "/usr/bin/chromium-browser",
      args: [
        //"--start-fullscreen",
        //"--start-maximized",
        "--disable-infobars",
        "--disable-extensions",
        "--no-sandbox",
        "--ignore-certificate-errors",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
      defaultViewport: null,
    }
  }

  getWifiPageUrl() {
    return "http://192.168.1.1"
  }

  /**
   * return wifi admin pagae credentials
   * @returns Object {username, pwd}
   */
  getWifiCreds() {
    return this.wifiCreds
  }

  getWifiPage() {
    return this.wifiPage
  }

  /**
   * check if the page is a login page
   * @param {puppeteer.Page} page 
   * @returns true if the page is a login page
   */
  isLoginPage(page) {
    return page.url().includes('login')
  }

  async launch() {
    this.instance = await puppeteer.launch(this.opts)
    logger.log('debug', "instance launched")
  }
  /**
   * Creates wifi page and navigates to wifi administration page
   */
  async newWifiPage() {
    let page = await this.instance.newPage()
    this.wifiPage = page
    logger.log('debug', "wifi page created")

    await this.wifiPageGo2Home()
    //await page.waitForNavigation()
    await this.loginWifiPage()
  }

  wifiPageGo2Home() {
    let page = this.getWifiPage()
    return page.goto(this.getWifiPageUrl(), {
      waitUntil: "networkidle2"
    })
  }

  /**
   * Performs login operation if the current current wifi page is login page
   * @returns Promise
   */
  async loginWifiPage() {
    let page = this.getWifiPage()
    if (!this.isLoginPage(page)) { return }
    let creds = this.getWifiCreds()
    let loginNameSelector = `form[name='Login_Form'] input[name='Login_Name']`
    let loginPwdSelector = `form[name='Login_Form'] input[name='Login_Pwd']`
    let loginBtn = `form[name='Login_Form'] input[name='texttpLoginBtn']`
    await page.type(loginNameSelector, creds.username)
    await page.type(loginPwdSelector, creds.pwd)
    await page.waitForSelector(loginBtn)
    await page.click(loginBtn, { waitUntil: "networkIdle2" })
    logger.log('debug', "logged in successfully");
    await page.waitForNavigation();
  }

  async wifiPageGo2Wlan() {
    let page = this.getWifiPage()
    if (this.isLoginPage(page)) { await this.loginWifiPage() }

    let navFrameSelector = `frame[name='navigation']`
    let elem = await page.$(navFrameSelector)
    let navFrame = await elem.contentFrame()
    let topMenuSelector = `a[href$='navigation-basic.html']`
    let subMenuSelector = `a[href$='../basic/home_wlan.htm']`
    //step1
    await navFrame.waitForSelector(topMenuSelector)
    await navFrame.click(topMenuSelector, { waitUntil: "networkIdle2" })
    //step2
    await navFrame.waitForSelector(subMenuSelector)
    await navFrame.click(subMenuSelector, { waitUntil: "networkIdle2" })
    //await page.waitForNavigation()
  }

  async wifiPageActivateFilter() {
    let page = this.getWifiPage()
    if (this.isLoginPage(page)) { await this.loginWifiPage() }
    try {
      await this.wifiPageGo2Wlan()
    } catch (e) { logger.error(e) }

    let mainFrameSelector = `frame[name='main']`
    let elem = await page.$(mainFrameSelector)
    let mainFrame = await elem.contentFrame()

    let activationSelector = `input[name='WLAN_FltActive'][value='1']`
    await mainFrame.waitForSelector(activationSelector)
    await mainFrame.click(activationSelector, { delay: 100 })

    let selectActionSelector = `select[name='WLAN_FltAction']`
    await mainFrame.select(selectActionSelector, '00000001')

    let blackList = this.getBlackList()
    let inputFilterSelector = `input[name='WLANFLT_MAC']`
    let inputs = await mainFrame.$$(inputFilterSelector)
    let i = 0
    await async.mapSeries(
      inputs,
      async (el, index) => {
        let val = blackList[i]
        if (val) {
          await el.click({ clickCount: 3 }) //select existing
          await el.type(val)
        } else {
          await el.click({ clickCount: 3})
          await el.type("00:00:00:00:00:00")
        }
        i++
      })
    //save
    let saveBtnSelector = `input[name='SaveBtn']`
    await mainFrame.click(saveBtnSelector, { delay: 100 })
    await this.wifiPageGo2Home()
  }


  async wifiPageDeactivateFilter() {
    let page = this.getWifiPage()
    if (this.isLoginPage(page)) { await this.loginWifiPage() }
    try {
      await this.wifiPageGo2Wlan()
    } catch (e) { logger.error(e) }

    let mainFrameSelector = `frame[name='main']`
    let elem = await page.$(mainFrameSelector)
    let mainFrame = await elem.contentFrame()

    let deactivationSelector = `input[name='WLAN_FltActive'][value='0']`
    await mainFrame.waitForSelector(deactivationSelector)
    await mainFrame.click(deactivationSelector)
    //save
    let saveBtnSelector = `input[name='SaveBtn']`
    await mainFrame.click(saveBtnSelector, { delay: 100 })
    await this.wifiPageGo2Home()
  }

  async wifiPageClose() {
    if (this.wifiPage) {
      await this.wifiPage.close()
      this.wifiPage = null
    }
  }

  async close() {
    if (this.instance) {
      await this.instance.close()
      this.instance = null
    }
  }

}

module.exports = Browser