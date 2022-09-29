const express = require('express');

const app = express();

app.get('/',function(req, res){
    return res.send('hello world')
})

app.listen(3000, function() {
    console.log('server listening on port 3000');
})