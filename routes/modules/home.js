const express = require('express')
const shortURLGenerator = require('../../utilities/shortURLGenerator')
const URL = require('../../models/URL')

const router = express.Router()
const baseURL = 'http://localhost:3000'

router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router

//URL shorten function
router.post('/', (req, res) => {
  //在 views/index#3 有用required 先做一次驗證，但如果使用者是輸入空白字元會無法驗證到，一樣會進入到成功縮短網址的頁面，所以用trim()來去掉空白字元檢查，再用inputEmpty變數去控制views/error頁面呈現輸入空白URL的錯誤畫面。
  if (!req.body.longURL.trim()) {
    let inputEmpty = true
    return res.render("error", { inputEmpty })
  }
  //如果有輸入URL，就進入以下程式碼
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