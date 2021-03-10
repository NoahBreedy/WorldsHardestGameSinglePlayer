require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql');
const serv = require('http').Server(app);
const socket = require('socket.io');
const io = socket(serv);
let AllLevels;


const con = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database:process.env.DB_USER
});


app.use('/client',express.static(__dirname + '/client'));

app.get('/',(req, res) => {
  con.query(`SELECT * FROM WorldsHardestGame`,(err,result)=>{
       AllLevels = result;
       res.sendFile(__dirname + '/client/index.html');
  });
});


io.sockets.on('connection', function(socket) {
   socket.on('getLevels', (data) => {
      io.to(socket.id).emit('giveLevels',AllLevels);
   });

});

serv.listen(process.env.PORT);
console.log("Server started");
