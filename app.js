const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars');
const URL = require('./models/URL')
const bodyParser = require('body-parser')
let shortURLGenerator = require('./utilities/shortURLGenerator')
const baseURL = 'http://localhost:3000'

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const app = express()

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))

// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// 取得資料庫連線狀態
const db = mongoose.connection
// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})
// 連線成功
db.once('open', () => {
  console.log('mongodb connected!')
})

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/', (req, res) => {
  const { longURL } = req.body
  URL.findOne({ originalURL: longURL })
    .lean()
    .then((url) => { 
      //如果原網址已輸入過，回傳資料庫中之短網址
      if (url){
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

//使用短網址連向原始網站
app.get('/:shortURL', (req, res) => {
  const {shortURL} = req.params
  URL.findOne({ shortenedURL: shortURL })
    .lean()
    .then((url) => {
      if (url){
        res.redirect(url.originalURL)
      } else {
        res.render("error", {
          errorURL: baseURL + '/' +shortURL
        })
      }
    })
    .catch(error => console.log(error))
})




app.listen(3000, () => {
  console.log('App is running on http://localhost:3000')
})