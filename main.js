const { logger } = require('./logger.js')
const Browser = require('./browser.js')

const main = async () => {
  logger.log('info', "started program");
  let b = new Browser({
    wifiCreds: {
      username: 'admin',
      pwd: 'admin'
    }
  })
  await b.launch()
  await b.newWifiPage()
  await b.wifiPageActivateFilter()
  await b.wifiPageClose()
}

try {
  main()
} catch(e) {
  logger.error(e)
}

