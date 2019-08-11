const qs = require('querystring')
const puppeteer = require('puppeteer')

if (process.argv.length < 3) return console.log('No search param given')
const queryString = process.argv.slice(2).join(' ')

/**
 *  @param {Number} t : sleep time (ms)
 *  Pause given amount of the time before moving on to next line
 */
const sleep = async t => new Promise((r, j) => setTimeout(() => r(), t))

/**
 *  @param {String} queryString : Search parameter
 *  Search google image with queryString and scroll down to end before fetch all urls
 */
const search = async queryString => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  console.log('Starting...')
  await page.goto(`https://www.google.com/search?q=${qs.escape(queryString)}&tbm=isch`)

  for (let i = 0; i < 10; ) {
    await page.keyboard.press('End')
    i += 1
    await sleep(500)
    try {
      await page.click('#smb')
      i = 10
      for (let j = 0; j < 30; ) {
        await page.keyboard.press('End')
        j += 1
        await sleep(500)
      }
      const selector = '.rg_meta'
      const links = await page.evaluate(selector => {
        const anchors = Array.from(document.querySelectorAll(selector))
        return anchors.map(anchor => {
          return JSON.parse(anchor.textContent)
        })
      }, selector)
      console.log(links)
      setTimeout(() => browser.close(), 50000)
    } catch (err) {
      for (let k = 0; k < 10; ) {
        await page.keyboard.press('End')
        k += 1
        await sleep(300)
      }
    }
  }
}

search(queryString)
