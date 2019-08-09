const qs = require('querystring')
const puppeteer = require('puppeteer')
const request = require('request')
const fs = require('fs')
const path = require('path')

if(process.argv.length < 3) return console.log("No search param given")
const queryString = process.argv.slice(2).join(" ")


/**
 *  @param {Number} t : sleep time (ms)
 *  Pause given amount of the time before moving on next line
 */
const sleep = async(t) => new Promise((r,j) => setTimeout(() => r(), t))


/**
 *  @param {String} queryString : Search parameter
 *  Search google image with queryString and scroll down to end before fetch all urls
 */
const search = async queryString => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  console.log("Starting...")
  await page.goto(`https://www.google.com/search?q=${qs.escape(queryString)}&tbm=isch`)

  for(let i=0; i<10;) {
    await page.keyboard.press("End")
    i += 1
    await sleep(500)
    try {
      await page.click("#smb")
      for (let j=0;j<20;) {
        await page.keyboard.press("End")
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
      setTimeout(() => browser.close(), 50000)
      console.log("Fetched All URLs")
      saveImage(links)
    }catch(err) {
      for(let k=0;k<10;) {
        await page.keyboard.press("End")
        k += 1
        await sleep(300)
      }
    }
  }
}


/**
 *  @param {Object} links : {..., ou : imageURL }
 *  Filter out image urls from search result and save them to given folder
 */
const saveImage = links => {
  const folderPath = path.join('/Users/Beomgyo/googleScraping', queryString)
  const regex = /\.(jpe?g|png|tif?f|bmp)/i
  const urls = links.map(e => e.ou).filter(e => regex.exec(e))
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath)
  }
  console.log(`Images amount : ${urls.length}`)
  var interval = setInterval(() => {
    try {
      const url = urls.shift();
      const options = {
        url,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"
        },
        encoding: null
      }
      let decoded = Object.keys(qs.decode(url))[0]
      let fileName = decoded
        .split('/')
        .pop()
        .replace(/\s/g, '_')
        .split('?')[0]
      let filePath = path.join(folderPath, fileName)
      request(options, (err, res, body) => {
        if (err) {
          // do nothing
        } else {
          const regex = /image\/.*/
          if (regex.exec(res.headers['content-type']) !== null) {
            fs.writeFile(filePath, body, 'binary', err => {
              if(err) console.log(err)
              else console.log(`Saved ${fileName}`)
            })
          }
        }
      })
      if (urls.length === 0) {
        clearInterval(interval)
      }
    } catch (err) {
      // do nothing
    }
  }, 0)
}

search(queryString)



  // var keyDown = setInterval(async () => {
  //   console.log(count)
  //   await page.keyboard.press('ArrowDown')
  //   count += 1
  //   if (count === 30) {
  //     clearInterval(keyDown)
  //   }
  //   try {
  //     await page.click('#smb')
  //     var countKey = 0
  //     var keyDownTry = setInterval(async () => {
  //       await page.keyboard.press('ArrowDown')
  //       countKey += 1
  //       console.log(countKey)
  //       if (countKey === 50) {
  //         clearInterval(keyDownTry)
  //         const selector = '.rg_meta'
  //         const links = await page.evaluate(selector => {
  //           const anchors = Array.from(document.querySelectorAll(selector))
  //           console.log("url doone")
  //           return anchors.map(anchor => {
  //             return JSON.parse(anchor.textContent)
  //           })
  //         }, selector)
  //         setTimeout(() => {
  //           browser.close()
  //         }, 20000)
  //         saveImage(links)
  //         // console.log(links.map(e => e.ou))
  //       }
  //     }, 300)
  //   } catch (err) {
  //     var countCatch = 0
  //     var keyDownCatch = setInterval(async () => {
  //       await page.keyboard.press('ArrowDown')
  //       countCatch += 1
  //       if (countCatch === 10) clearInterval(keyDownCatch)
  //     }, 300)
  //   } finally {
  //     if (count === 30) {
  //       clearInterval(keyDown)
  //     }
  //   }
  // }, 300)