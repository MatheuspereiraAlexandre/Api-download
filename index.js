const express = require('express');
const app = express();


app.get('/', (req, res) => { // anotacao
    res.send('ola mundo');
})

app.listen(process.env.PORT || 3000)