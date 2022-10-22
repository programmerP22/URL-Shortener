// 引用 Express 與 Express 路由器
const express = require('express')
const router = express.Router()
// 引用 Todo model
const URL = require('../../models/URL')

const shortURLGenerator = require('../../utilities/shortURLGenerator')
const baseURL = 'http://localhost:3000'

router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router


router.post('/', (req, res) => {
  if (!req.body.longURL.trim()) {
    let inputEmpty = true
    return res.render("error", { inputEmpty })
   
    // return res.redirect('/')
  }

  const { longURL } = req.body
  URL.findOne({ originalURL: longURL })
    .lean()
    .then((url) => {
      //如果原網址已輸入過，回傳資料庫中之短網址
      if (url) {
        let shortURL = url.shortenedURL
        res.render('result', { shortURL, baseURL })
      } else {
        //如果尚未輸入過，建立一個新的短網址並回傳  
        let shortURL = shortURLGenerator()
        URL.create({ originalURL: longURL, shortenedURL: shortURL })
        res.render('result', { shortURL, baseURL })
      }
    })
    .catch(err => console.log(err))
})

// 使用短網址連向原始網站
router.get('/:shortURL', (req, res) => {
  const { shortURL } = req.params
  URL.findOne({ shortenedURL: shortURL })
    .lean()
    .then((url) => {
      if (url) {
        res.redirect(url.originalURL)
      } else {
        res.render("error", {
          errorURL: baseURL + '/' + shortURL
        })
      }
    })
    .catch(error => console.log(error))
})

