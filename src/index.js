import puppeteer from 'puppeteer'
import url from 'url'

const botList = /(googlebot\/|googlebot|googlebot-mobile|yandexbot|pinterest.*ios|mail\.ru|seznambot|screaming|bot|spider|pinterest|crawler|archiver|flipboardproxy|mediapartners|facebookexternalhit|quora)/gi

const expressSSR = (req, res, next) => {
  let parsedUrl

  const ssr = async () => {
    try {
      const browser = await puppeteer.launch({headless: true})
      const page = await browser.newPage()
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')

      await page.goto(parsedUrl.path, {
        waitUntil: 'networkidle0'
      })

      const html = await page.content()

      await browser.close()

      res.send(html)
    } catch(e) {
      console.error('error', e)
      res.send(e)
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD')
    return next()

  parsedUrl = url.parse(req.url, true)

  if (parsedUrl.query && (parsedUrl.query['_escaped_fragment_'] != null))
    return ssr()

  if (req.headers['user-agent'] && req.headers['user-agent'].match(botList))
    return ssr()

  return next()
}

export default expressSSR