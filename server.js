const express = require('express');
const app = express();
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(cors());

app.use('/images', express.static('images'));

app.use('/static', express.static(path.join(__dirname + '/../' + 'static')))


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', require("./routes/router"))
app.use('/user', require("./routes/user"))
app.use('/admin', require("./routes/admin"))


app.listen(5000, () => {
  console.log('Go to the server')
})