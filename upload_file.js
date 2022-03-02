const express = require('express')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const app = express()

app.post('/profile', upload.single('avatar'), function (req, res, next) {
    res.json({imageUrl:`/home/sharda/Desktop/Social_media_app/${req.file.path}`})
  })
  

app.listen(5000,()=>{
    console.log("server is listening on port 5000")
})