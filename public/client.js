//Establishing a connection with the server on port 5500y
const socket = io();

//Grabbing the button element by the ID
let submitBtn = document.getElementById('submitBtn');
// Send a message to the server when clicked
const score = document.getElementById('score');
const mainContainer = document.getElementById('main-container');
const form = document.getElementById('form');
var namePlayer1 = document.getElementById('name1');
var namePlayer2 = document.getElementById('name2');
var waitingContent = document.getElementById('waiting-content');
var inputContent = document.getElementById('input-content');
var waitingElement = document.getElementById('waiting');

var ratio1 = document.getElementById('ratio1');
var ratio2 = document.getElementById('ratio2');
var leftScore = document.getElementById('left-score');
var leftMistone = document.getElementById('left-mistone');

// Turn 1 - turn 9
var turn1 = document.getElementById('turn1');
var turn2 = document.getElementById('turn2');
var turn3 = document.getElementById('turn3');
var turn4 = document.getElementById('turn4');
var turn5 = document.getElementById('turn5');
var turn6 = document.getElementById('turn6');
var turn7 = document.getElementById('turn7');
var turn8 = document.getElementById('turn8');
var turn9 = document.getElementById('turn9');
var currentTurn = document.getElementById('current-turn');

// Declare the self player
class Player {
  constructor() {
    this.score = 99;
    this.Milestones = 1;
    this.playedScore = [];
    this.no = 0;
    this.ratio = 0;
    this.clientRoom;
    this.selfTurn = 0;
    this.name;
  }
}

let clientPlayers = {};
let selfID;

socket.on('connect', () => {
  selfID = socket.id;
});

// Update connections and pass the id
socket.on('updateConnections', (data) => {
  for (let id in data) {
    if (clientPlayers[id] === undefined) {
      clientPlayers[id] = new Player();
      clientPlayers[id].no = data[id].no;
      clientPlayers[id].clientRoom = data[id].roomNo;
    }
    if (id === selfID) {
      // swal(clientPlayers[id].no);
    }
  }
});

// Call back function for dividing room
// socket.on('serverMsg', (data) => {
//   (`I should be room ${data}`);
//   clientPlayers[id].clientRoom = data;
// });

//Callback function fires on the event called 'serverToClient'
socket.on('serverToClient', (data) => {
  swal('Đối phương đánh', data, 'warning');
});

// score.style.display = 'none';

// submitBtn.addEventListener('click', () => {
//   socket.emit('clientToClient', score.value);
//   swal('your score is ' + score.value);
// });

// Handle turn players
socket.on('handleTurnPlayer', (turnOfPlayers) => {
  const player = clientPlayers[selfID];
  if (player.no === turnOfPlayers) {
    // swal('this is one player');
    waitingElement.innerHTML = 'Chờ đối phương đánh...';
    waitingElement.style.color = 'black';
    inputContent.style.display = 'block';
    waitingContent.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.addEventListener('click', HandleInfo);
  } else {
    waitingContent.style.display = 'block';
    inputContent.style.display = 'none';
    // mainContainer.style.display = 'none';
    // swal('wait for player ... to finish');
  }
});

function HandleInfo() {
  submitBtn.disabled = true;
  const player = clientPlayers[selfID];
  if (player.score < score.value) {
    swal(
      'Lỗi',
      'Số điểm nhập lớn hơn số điểm còn lại. Vui lòng nhập lại',
      'error',
    );
  } else if (score.value < 0) {
    swal('Lỗi', 'Số điểm nhập phải lớn hơn 0.', 'error');
  } else if (parseInt(score.value) != score.value) {
    swal('Lỗi', 'Số điểm nhập phải là số nguyên', 'error');
  } else {
    player.playedScore.push(score.value);
    player.score -= score.value;
    // swal('Điểm còn lại của bạn: ' + player.score);
    player.selfTurn++;

    updateScoreToClient(player);

    // Left score of the player
    leftScore.innerHTML = player.score;
    socket.emit('handleData', player);
  }
}

// Return result to client
socket.on('result', (id) => {
  if (id != 0) {
    clientPlayers[id].ratio++;
  }
  for (let ids in clientPlayers) {
    if (clientPlayers[ids].no === 1) {
      ratio1.innerHTML = clientPlayers[ids].ratio;
    } else if (clientPlayers[ids].no === 2) {
      ratio2.innerHTML = clientPlayers[ids].ratio;
    }
  }
  if (id === 0) {
    swal('Hue turn nay.');
  } else {
    if (id === selfID) {
      swal(
        'Chúc mừng!',
        'Bạn đã chiến thắng turn này! Đi tiếp thôi nào',
        'success',
      );
    } else {
      waitingElement.innerHTML =
        'Bạn thua rồi. Chờ đối phương đánh turn tiếp theo nhé... !';
      waitingElement.style.color = 'red';
    }
  }

  //Update current turn
  currentTurn.innerHTML = clientPlayers[selfID].selfTurn + 1;
});

// Gameover
socket.on('gameOver', (res) => {
  if (res === clientPlayers[selfID].no) {
    swal('Thắng rồi', 'Chúc mừng bạn đã thắng cuộc', 'success');
  } else {
    if (res === 0) {
      swal('Hoà chung cuộc');
    } else {
      swal('Thua chung cuộc');
    }
  }
  inputContent.style.display = 'none';
  waitingElement.style.display = 'block';
  waitingElement.innerHTML =
    'GAME KẾT THÚC, REFRESH TRANG ĐỂ CHƠI GAME MỚI !!!';
});

// Update score
function updateScoreToClient(player) {
  if (player.selfTurn == 1) {
    turn1.innerHTML = player.playedScore[0];
    turn1.style.backgroundColor = 'yellow';
  } else if (player.selfTurn == 2) {
    turn2.innerHTML = player.playedScore[1];
    turn2.style.backgroundColor = 'yellow';
  } else if (player.selfTurn == 3) {
    turn3.innerHTML = player.playedScore[2];
    turn3.style.backgroundColor = 'yellow';
  } else if (player.selfTurn == 4) {
    turn4.innerHTML = player.playedScore[3];
    turn4.style.backgroundColor = 'yellow';
  } else if (player.selfTurn == 5) {
    turn5.innerHTML = player.playedScore[4];
    turn5.style.backgroundColor = 'yellow';
  } else if (player.selfTurn == 6) {
    turn6.innerHTML = player.playedScore[5];
    turn6.style.backgroundColor = 'yellow';
  } else if (player.selfTurn == 7) {
    turn7.innerHTML = player.playedScore[6];
    turn7.style.backgroundColor = 'yellow';
  } else if (player.selfTurn == 8) {
    turn8.innerHTML = player.playedScore[7];
    turn8.style.backgroundColor = 'yellow';
  } else if (player.selfTurn == 9) {
    turn9.innerHTML = player.playedScore[8];
    turn9.style.backgroundColor = 'yellow';
  }
}

// Main register
form.onsubmit = function (e) {
  e.preventDefault();
  clientPlayers[selfID].name = document.getElementById('username').value;
  mainContainer.style.display = 'block';
  form.style.display = 'none';
  for (let id in clientPlayers) {
    if (clientPlayers[id].no === 1) {
      namePlayer1.innerHTML = clientPlayers[id].name;
    } else if (clientPlayers[id].no === 2) {
      namePlayer2.innerHTML = clientPlayers[id].name;
    }
  }
  socket.emit('clientName', clientPlayers[selfID].name);
};

// Listen other players name
socket.on('playerName', (data) => {
  //console.log('go here');
  clientPlayers[data.id].name = data.name;
  for (let id in clientPlayers) {
    if (clientPlayers[id].no === 1) {
      namePlayer1.innerHTML = clientPlayers[id].name;
    } else if (clientPlayers[id].no === 2) {
      namePlayer2.innerHTML = clientPlayers[id].name;
    }
  }
});

// Disconnect
socket.on('disconnected', () => {
  swal('Thông báo! Đối phương đã rời phòng!!!');
});
