const axios = require('axios')
const qs = require('querystring')



if (process.argv.length < 3) return console.log('No search param given')
const argvs = process.argv.slice(2)
const queryString = argvs.join(' ')

/**
 *  @param {String} queryString : Search parameter
 */
const res = async queryString => {
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
    console.log(body)

  } catch (err) {
    console.log(err)
  }
}

res(queryString)
