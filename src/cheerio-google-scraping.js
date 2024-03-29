const axios = require('axios')
const qs = require('querystring')
const cheerio = require('cheerio')
const path = require("path")
const fs = require("fs")
const request = require("request")

if (process.argv.length < 3) return console.log('No search param given')
const argvs = process.argv.slice(2)
const queryString = argvs.join(' ')

/**
 *  @param {String} queryString : Search parameter
 */
const getImage = async queryString => {
  try {
    const res = await axios({
      url: `https://www.google.com/search?q=${qs.escape(queryString)}&tbm=isch`,
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
      },
    })
    const body = res.data
    const $ = cheerio.load(body)
    const links = []
    const meta = $('.rg_meta')
    meta.each((idx, el) => {
      links.push(JSON.parse($(el).text()))
    })
    saveImage(links)
  } catch (err) {
    console.log(err)
  }
}

const saveImage = links => {
  const folderPath = path.join('/Path/to/Folder', queryString)
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

getImage(queryString)
