const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIo = require("socket.io");
const port = process.env.PORT || 5000;

let activePlayer = '';
let currentCnvs = {};
let currentCounter = 0;
// let lastSender

const io = socketIo(server,  {
    // cors: {
    //     origin: "*",
    // },
    maxHttpBufferSize: 1e8 
});


app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

io.on('connection', (socket) => {

    // console.log("user joined");
    socket.on('join', function (name) {
        // console.log(name);
        let roomName = "user_"+name;
        // console.log(socket.id, roomName, io.sockets.adapter.rooms.get(roomName));
        if(io.sockets.adapter.rooms.get(roomName))
        {
            //invalid
            socket.emit("join_status", false);
        }
        else
        {
            socket.join(roomName);
            // console.log(io.sockets.adapter.rooms);
            socket.emit("join_status", true);
            if(!activePlayer)
            {
                activePlayer = name;
            }
            socket.emit("receiveActive", activePlayer);
        }
    });

    const playerUpdate = () => {
        let rooms = Array.from(io.sockets.adapter.rooms.keys() );
        let names  = rooms
            .filter( (room) => room.includes("user_"))
            .map( (name) => name.substring(5));
        io.emit("playersInfo", names);
    };

    const assignActivePlayer = () => {
        let rooms = Array.from(io.sockets.adapter.rooms.keys() );
        let names  = rooms
            .filter( (room) => room.includes("user_"))
            .map( (name) => name.substring(5));
        console.log(names, activePlayer);
        if(names)
        {
            console.log(names.indexOf(activePlayer));
            if(names.indexOf(activePlayer) == -1)
            {
                let newName = names[Math.floor(Math.random()*names.length)];
                activePlayer = newName;
            }
        }
        else
        {
            activePlayer = '';
        }
        io.emit("receiveActive", activePlayer);
    }

    socket.on("getPlayersInfo", playerUpdate);

    socket.on("disconnect", (reason) => {
        console.log(io.sockets.adapter.rooms);
        // console.log(socket.rooms);
        assignActivePlayer();
        playerUpdate();
    });

    socket.on("sendSketch", (data) => {
        // console.log(data);
        // currentCnvs.push(data.cnvs);
        if(data.from == activePlayer)
        {
            currentCnvs[currentCounter++] = data.cnvs;
            console.log(currentCounter, data.from, data.to);
            io.sockets.in("user_"+data.to).emit("receiveSketch",{
                from: data.from,
                clue: data.clueCnvs
            });
            activePlayer = data.to;
            io.emit("receiveActive", activePlayer);
        }
    });

    socket.on("endGame", (data) => {
        currentCnvs[currentCounter++] = data.cnvs;
        io.emit("endGame", currentCnvs);
        currentCnvs = {};
        currentCounter = 0;
        activePlayer = '';
        io.emit("receiveActive", activePlayer);
    });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
