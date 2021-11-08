const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const http = require('http').Server(app);
// const port = 3000;
// const server = app.listen(port);
const io = require('socket.io')(http);
app.use(express.static('public'));

http.listen(PORT, function () {
  console.log('listening on ${PORT}');
});

//Hello World line taken from the express website
app.get('/', (req, res) => {
  res.send('Hello World!');
});

class Player {
  constructor() {
    this.score = 99;
    this.Milestones = 1;
    this.playedScore = [];
    this.no = 0;
    this.ratio = 0;
    this.roomNo;
    this.name;
  }
}
let clientNo = 0;
let roomNo;

let serverPlayers = {};

function CalMilestones() {
  // Handle cal milestones based on the score of the players ...
}

// turn of Player 1 and 2
let turnOfPlayer = [-1];
// If this turn equals to even number, cal and return back to the clic
let thisTurn = [-1];

//The 'connection' is a reserved event name in socket.io
//For whenever a connection is established between the server and a client
io.on('connection', (socket) => {
  clientNo++;
  socket.join(Math.round(clientNo / 2));
  roomNo = Math.round(clientNo / 2);

  turnOfPlayer.push(1);
  thisTurn.push(1);

  socket.on('disconnect', () => {
    socket.to(serverPlayers[socket.id].roomNo).emit('disconnected');
    delete serverPlayers[socket.id];
    console.log('disconnect');
  });
  //Displaying a message on the terminal
  console.log('a user connected');
  //Sending a message to the client

  // Creating two players
  // if (Object.keys(serverPlayers).length === 0) {
  //   console.log('first player joined');
  //   //creating player 1
  //   serverPlayers[socket.id] = new Player();
  //   serverPlayers[socket.id].no = 1;
  //   console.log(serverPlayers[socket.id]);
  // } else if (Object.keys(serverPlayers).length === 1) {
  //   console.log('second player joined');
  //   //creating player 1
  //   serverPlayers[socket.id] = new Player();
  //   serverPlayers[socket.id].no = 2;
  //   console.log(serverPlayers[socket.id]);
  // } else {
  //   console.log('full players' + roomNo);

  //   socket.emit('serverMsg', roomNo);
  // }

  //Creating server based on Room
  //creating player
  console.log(clientNo + ' player joined');
  serverPlayers[socket.id] = new Player();
  serverPlayers[socket.id].roomNo = roomNo;

  if (clientNo % 2 == 0) {
    serverPlayers[socket.id].no = 2;
  } else {
    serverPlayers[socket.id].no = 1;
  }
  console.log(serverPlayers[socket.id]);
  // socket.emit('serverMsg', roomNo);

  //Receiving a message from the client and putting it on the terminal
  socket.on('clientToServer', (data) => {
    console.log(data);
  });
  //When the client sends a message via the 'clientToClient' event
  //The server forwards it to all the other clients that are connected

  socket.on('handleData', async (data) => {
    // Update score and save it into server
    serverPlayers[socket.id].score = data.score;
    serverPlayers[socket.id].playedScore = data.playedScore;

    // Handle if two players played, and update new turn
    if (thisTurn[data.clientRoom] % 2 == 0) {
      const result = await setRatioForPlayer(data.clientRoom);
      io.to(data.clientRoom).emit('result', result);
      if (result != 0) {
        turnOfPlayer[data.clientRoom] = serverPlayers[result].no;
      }
    } else {
      // Take turn for each player
      if (turnOfPlayer[data.clientRoom] === 1) {
        turnOfPlayer[data.clientRoom] = 2;
      } else if (turnOfPlayer[data.clientRoom] === 2) {
        turnOfPlayer[data.clientRoom] = 1;
      }
    }

    // Handle game over

    if (thisTurn[data.clientRoom] === 18) {
      GameOver(data.clientRoom);
    }

    // Handle milestones and takes turn again
    else {
      console.log(serverPlayers[socket.id]);
      const milestones = handleMileStones(data);
      socket
        .to(data.clientRoom)
        .emit('serverToClient', milestones.token + ' ' + milestones.flag);
      io.to(data.clientRoom).emit(
        'handleTurnPlayer',
        turnOfPlayer[data.clientRoom],
      );
      thisTurn[data.clientRoom]++;
    }
  });

  io.emit('updateConnections', serverPlayers);
  socket.on('clientName', (data) => {
    serverPlayers[socket.id].name = data;

    // Set name for the other players
    if (playerInRoom(serverPlayers[socket.id].roomNo) === 2) {
      for (let id in serverPlayers) {
        if (serverPlayers[id].roomNo === serverPlayers[socket.id].roomNo) {
          io.to(serverPlayers[id].roomNo).emit('playerName', {
            id: id,
            name: serverPlayers[id].name,
          });
        }
      }
    }
    io.emit('handleTurnPlayer', turnOfPlayer[roomNo]);
  });
});

function handleMileStones(data) {
  let milestones = { flag: undefined, token: undefined };
  if (data.playedScore[Math.ceil(thisTurn[data.clientRoom] / 2) - 1] < 10) {
    milestones.token = 'ĐEN';
  } else {
    milestones.token = 'TRẮNG';
  }

  if (data.score > 79) {
    milestones.flag = 'A';
  } else if (data.score > 59) {
    milestones.flag = 'B';
  } else if (data.score > 39) {
    milestones.flag = 'C';
  } else if (data.score > 19) {
    milestones.flag = 'D';
  } else if (data.score >= 0) {
    milestones.flag = 'E';
  }
  return milestones;
}

async function setRatioForPlayer(clientRoom) {
  const index = Math.ceil(thisTurn[clientRoom] / 2) - 1;
  console.log('turn hien tai la: ' + (index + 1));
  console.log('thisturn[clientRoom] la: ' + thisTurn[clientRoom]);
  let player1, player2;
  let id1, id2;
  for (let id in serverPlayers) {
    if (serverPlayers[id].roomNo === clientRoom) {
      if (serverPlayers[id].no === 1) {
        player1 = serverPlayers[id];
        id1 = id;
      }
      if (serverPlayers[id].no === 2) {
        player2 = serverPlayers[id];
        id2 = id;
      }
    }
  }

  const score1 = parseInt(player1.playedScore[index]);
  const score2 = parseInt(player2.playedScore[index]);
  if (score1 > score2) {
    serverPlayers[id1].ratio++;
    return id1;
  } else if (score1 < score2) {
    serverPlayers[id2].ratio++;
    return id2;
  }
  return 0;
}

function GameOver(clientRoom) {
  console.log('end game');
  let player1, player2;
  result = 0;
  for (let id in serverPlayers) {
    if (serverPlayers[id].no === 1) {
      player1 = serverPlayers[id];
    }
    if (serverPlayers[id].no === 2) {
      player2 = serverPlayers[id];
    }
  }
  if (player1.no > player2.no) {
    result = 1;
  } else if (player2.no > player1.no) {
    result = 2;
  }
  io.to(clientRoom).emit('gameOver', result);
}

// setInterval(serverLoop, 1000 / 60);
// function serverLoop() {
//   io.to(data.clientRoom).emit('updateConnections', serverPlayers);

//   io.to(data.clientRoom).emit('handleTurnPlayer', turnOfPlayer[data.clientRoom]);
// }

function playerInRoom(room) {
  let count = 0;
  for (let id in serverPlayers) {
    if (serverPlayers[id].roomNo === room && serverPlayers[id].name) {
      count++;
    }
  }
  return count;
}
