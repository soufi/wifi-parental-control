require('dotenv').config({ path: process.env.DOTENV_FILE_PATH || './.env' })
const { logger } = require('./logger.js')
const Browser = require('./browser.js')
const { CronJob } = require('cron')

const blackList = process.env.BLACK_LIST.split(',')

let activationJob, deActivationJob

const activateFilter = async () => {
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
}

const deactivateFilter = async () => {
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
}

const main = () => {
  logger.log('info', "started program")

  activationJob = new CronJob('0 0 23 * * *', activateFilter, null, true)
  deActivationJob = new CronJob('0 0 7 * * *', deactivateFilter, null, true)

  activationJob.start()
  deActivationJob.start()

  if (process.env.LAUNCH_ACTIVATION) {
    activateFilter()
  }
  else if (process.env.LAUNCH_DEACTIVATION) {
    deactivateFilter()
  }
}

process.once('SIGINT', (code) => {
  logger.log('info', "Stop signal received.")
})

process.once('SIGTERM', (code) => {
  logger.log('info', "Stop signal received.")
})

process.prependOnceListener('uncaughtException', (err) => {
  logger.error(err)
})

main()

