import io from "socket.io-client";

import "bootstrap/dist/css/bootstrap.css";
import "./style.css";
import React from "react";
import ReactDOM from "react-dom";
import { useEffect, useState } from "react";
import moment from "moment";

const username = prompt("what is your username");

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"]
});

const App = ({}) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("username", username);
    });

    socket.on("users", users => {
      setUsers(users);
    });

    socket.on("message", message => {
      setMessages(messages => [...messages, message]);
    });

    socket.on("connected", user => {
      setUsers(users => [...users, user]);
    });

    socket.on("disconnected", id => {
      setUsers(users => {
        return users.filter(user => user.id !== id);
      });
    });

    socket.on('msg', onChatMessage);
  }, []);

  

  const submit = event => {
    event.preventDefault();
    const turnValue = {
      message,
      id: socket.id,
    }
    socket.emit("send", message);
    socket.emit("turn", turnValue);
    setMessage("");
  };

  const onChatMessage = (msg) => {
    var ul = document.querySelector('#chat');
    var item = document.createElement('li');
    item.innerHTML = msg;
    ul.appendChild(item);
  }

  console.log(users);
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 mt-4 mb-4">
          <h4>Multiplayer Paper Scissors Rocks Simple Demo with Websocket</h4>
          <h5>Hello {username}</h5>
        </div>
      </div>
      <div className="row">
        <div className="col-md-8">
          <h6>History</h6>
          <ul id="chat"></ul>
          <div id="messages" style={{display: 'none'}}>
            {messages.map(({ user, date, text }, index) => (
              <div key={index} className="row mb-2">
                <div className="col-md-3">
                  {moment(date).format("h:mm:ss a")}
                </div>
                <div className="col-md-2">{user.name}</div>
                <div className="col-md-2">{text}</div>
              </div>
            ))}
          </div>
          <form onSubmit={submit} id="form">
            {/* <div className="input-group"> */}
              <input
                type="text"
                className="form-control"
                onChange={e => setMessage(e.currentTarget.value)}
                value={message}
                id="text"
                placeholder="Please use exact words like : Rocks, Paper, Scissors"
              />
              <div style={{marginTop: "10px"}}>
                <span className="input-group-btn">
                  <button 
                    id="submit" 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={disable}
                  >
                    Send
                  </button>
                </span>
              </div>
            {/* </div> */}
          </form>
          <div>
            {
            users.length > 0 && users.filter(user => user.point === 3).map(filteredUser => (
              <p 
                key={filteredUser.id}
                className="text-center font-winner">
                  The Winner Is {filteredUser.name}
              </p>
              ))
            }
          </div>
        </div>
        <div className="col-md-4">
          <h6>Users</h6>
          <ul id="users">
            {users.map(({ name, id }) => (
              <li key={id}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
