const express = require('express');

const app = express();

app.use(express.json());

app.get('/',function(req, res){
    return res.send('hello world')
})

const users = [{name: "Gyubin", age: 30}];

app.get('/user', function(req,res){
    return res.send({ users: users})
})

app.post('/user', function(req,res){
    users.push({name:req.body.name, age:req.body.age})
    return res.send({success: true})
})

app.listen(3000, function() {
    console.log('server listening on port 3000');
})