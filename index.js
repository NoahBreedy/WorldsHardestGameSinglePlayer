require('dotenv').config();
const express = require('express');
const app = express();
const { Client } = require('pg');
const serv = require('http').Server(app);
const socket = require('socket.io');
const io = socket(serv);
let AllLevels;


const client = new Client({
    connectionString: process.env.cString
});
client.connect();

app.use('/client',express.static(__dirname + '/client'));

app.get('/',(req, res) => {
  client.query('SELECT * FROM "Blungus23/worldshardestgame"."levels";', (err, result) => {
        AllLevels = result.rows;
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
