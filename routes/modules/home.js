const express = require('express')
const shortURLGenerator = require('../../utilities/shortURLGenerator')
const URL = require('../../models/URL')
const e = require('express')

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
  //這邊先在宣告一個新的短網址，同時供 create 跟 render使用
  let shortURL = shortURLGenerator()
  URL.findOne({ originalURL: longURL })
    .lean()
    //這邊先確認下面要render result頁面的短網址是哪個
    .then((url) => {
      if (!url) {
        //如果尚未輸入過，先測試短網址是否已經使用過，如果已經使用過，就再重新建立一組短網址
        URL.findOne({ shortenedURL: shortURL })
        .lean()
        .then((url) => {
          if (url) {
            while (shortURL === url.shortenedURL){
              shortURL = shortURLGenerator()
            }
          }
        }) 
        // 用已經宣告好的短網址，在資料庫建立一筆新的資料建立
        URL.create({ originalURL: longURL, shortenedURL: shortURL })
      } else {
        //如果原網址已輸入過，回傳資料庫中之短網址
        shortURL = url.shortenedURL
      }
    })
    //等到確認好要使用短網址 再用一個then() 去 render result頁面，避免URL.create()失敗，但回傳成功的頁面到前端去的情況。
    .then(() => {
      res.render('result', { shortURL, baseURL })
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