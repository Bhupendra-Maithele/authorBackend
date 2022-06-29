const express = require('express');
const app = express();
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const port = process.env.PORT || 8080

app.use(cors());

app.use('/images', express.static('images'));

app.use('/static', express.static(path.join(__dirname + '/../' + 'static')))


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', require("./routes/router"))
app.use('/user', require("./routes/user"))
app.use('/admin', require("./routes/admin"))

app.use(express.static('public'));
  app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'public/index.html'));
})


app.listen(port, () => {
  console.log('Go to the server')
})