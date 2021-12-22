require('dotenv').config()
const { logger } = require('./logger.js')
const Browser = require('./browser.js')
const { CronJob } = require('cron')

const blackList = process.env.BLACK_LIST.split(',')

const main = async () => {
  logger.log('info', "started program")
  var activationJob = new CronJob('0 0 23 * * *', async () => {
    logger.log('info', "activating filter")
    let b = new Browser({
      wifiCreds: {
        username: process.env.WIFI_ADMIN_USERNAME,
        pwd: process.env.WIFI_ADMIN_PASSWORD
      }
    }, blackList)
    await b.launch()
    await b.newWifiPage()
    await b.wifiPageActivateFilter()
    await b.close()
  }, null, true)

  var deActivationJob = new CronJob('0 0 7 * * *', async () => {
    logger.log('info', "deactivating filter")
    let b = new Browser({
      wifiCreds: {
        username: process.env.WIFI_ADMIN_USERNAME,
        pwd: process.env.WIFI_ADMIN_PASSWORD
      }
    }, blackList)
    await b.launch()
    await b.newWifiPage()
    await b.wifiPageDeactivateFilter()
    await b.close()
  }, null, true)

  activationJob.start()
  deActivationJob.start()

}

try {
  main()
} catch(e) {
  logger.error(e)
}

