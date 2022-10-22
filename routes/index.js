const express = require('express')
const router = express.Router()
const URL = require('../models/URL')
// router.use('/', result)
const home = require('./modules/home')
// 將網址結構符合 / 字串的 request 導向 home 模組 
router.use('/', home)

module.exports = router