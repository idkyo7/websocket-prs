const server = require("http").createServer();
const io = require("socket.io")(server, {
  transports: ["websocket", "polling"]
});
const users = {};
const winners = {};
let waiting = null;
io.on("connection", client => {
  client.on("username", username => {
    const user = {
      name: username,
      id: client.id,
      point: 0,
    };
    users[client.id] = user;
    io.emit("connected", user);
    io.emit("users", Object.values(users));
  });

  client.on("send", message => {
    io.emit("message", {
      text: message,
      date: new Date().toISOString(),
      user: users[client.id]
    });
    io.emit('msg', users[client.id].name + ' submitted his choice')
  });

  client.on("disconnect", () => {
    const username = users[client.id];
    delete users[client.id];
    io.emit("disconnected", client.id);
  });

  client.emit('msg', 'You are connected');
  client.on('msg', (msg) => io.emit('msg', msg));

  if (waiting === null) {
    client.emit('msg', 'You Are Waiting');
    waiting = client;
  } else {
    startGame(waiting, client);
    waiting = null;
  }
});

let roomId = 1;
 
function startGame(p1, p2) {
  const roomName = 'RPS' + roomId++;
 
  let p1Turn = null;
  let p2Turn = null;
 
  [p1, p2].forEach((p) => p.join(roomName));
  io.to(roomName).emit('msg', 'Game Started!');
  p1.on('turn', (e) => {
    p1Turn = e;
    checkRoundEnd();
  });
 
  p2.on('turn', (e) => {
    p2Turn = e;
    checkRoundEnd();
  });
 
  function checkRoundEnd() {
    if (p1Turn !== null && p2Turn !== null) {
      if(p1Turn.message === "Rocks" && p2Turn.message === "Scissors") {
        io.to(roomName).emit('msg', 'Round Ended! '+ users[p1Turn.id].name + ' - '
          + p1Turn.message + ' vs ' + users[p2Turn.id].name + ' - ' + p2Turn.message + 
          ' - ' + users[p1Turn.id].name + ' Win this round ');
          updateUser(p1Turn.id);
          io.emit("users", Object.values(users));
      }
      if(p1Turn.message === "Scissors" && p2Turn.message === "Paper") {
        io.to(roomName).emit('msg', 'Round Ended! '+ users[p1Turn.id].name + ' - '
          + p1Turn.message + ' vs ' + users[p2Turn.id].name + ' - ' + p2Turn.message + 
          ' - ' + users[p1Turn.id].name + ' Win this round ');
          updateUser(p1Turn.id)
          io.emit("users", Object.values(users));
      }
      if(p1Turn.message === "Paper" && p2Turn.message === "Rocks") {
        io.to(roomName).emit('msg', 'Round Ended! '+ users[p1Turn.id].name + ' - '
          + p1Turn.message + ' vs ' + users[p2Turn.id].name + ' - ' + p2Turn.message + 
          ' - ' + users[p1Turn.id].name + ' Win this round ');
          updateUser(p1Turn.id)
          io.emit("users", Object.values(users));
      }
      if(p1Turn.message === "Scissors" && p2Turn.message === "Rocks") {
        io.to(roomName).emit('msg', 'Round Ended! '+ users[p1Turn.id].name + ' - '
          + p1Turn.message + ' vs ' + users[p2Turn.id].name + ' - ' + p2Turn.message + 
          ' - ' + users[p2Turn.id].name + ' Win this round ');
          updateUser(p2Turn.id)
          io.emit("users", Object.values(users));
      }
      if(p1Turn.message === "Paper" && p2Turn.message === "Scissors") {
        io.to(roomName).emit('msg', 'Round Ended! '+ users[p1Turn.id].name + ' - '
          + p1Turn.message + ' vs ' + users[p2Turn.id].name + ' - ' + p2Turn.message + 
          ' - ' + users[p2Turn.id].name + ' Win this round ');
          updateUser(p2Turn.id)
          io.emit("users", Object.values(users));
      }
      if(p1Turn.message === "Rocks" && p2Turn.message === "Paper") {
        io.to(roomName).emit('msg', 'Round Ended! '+ users[p1Turn.id].name + ' - '
          + p1Turn.message + ' vs ' + users[p2Turn.id].name + ' - ' + p2Turn.message + 
          ' - ' + users[p2Turn.id].name + ' Win this round ');
          updateUser(p2Turn.id)
          io.emit("users", Object.values(users));
      }
      if(p1Turn.message === p2Turn.message) {
        io.to(roomName).emit('msg', 'Round Ended! '+ users[p1Turn.id].name + ' - '
          + p1Turn.message + ' vs ' + users[p2Turn.id].name + ' - ' + p2Turn.message + 
          ' - No one Win this round ');
      }
 
      io.to(roomName).emit('msg', 'Next round!');
 
      p1Turn = p2Turn = null;
    }
  }

  function updateUser(idUser) {
    users[idUser] = {
      name: users[idUser].name,
      id: users[idUser].id,
      point: users[idUser].point + 1
    };
  }
}

server.listen(3000);
