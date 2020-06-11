const express = require('express');
const { Server } = require('ws');
const PORT = process.env.PORT || 3000;

const server = express()
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

var roomList = {};
roomList.rooms = {};

wss.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

wss.on('connection', (ws) => {

  let sendToClient = (to, message) => {
    console.log('client : ' + to);
    wss.clients.forEach((item) => {
      if (item.id === to) {
        item.send(JSON.stringify(message));
      }
    });
  };

  let sendToRoom = (room, message) => {
    wss.clients.forEach((item) => {
      if (item.id === room) {
        item.send(JSON.stringify(message));
      }
    });
  };

  console.log('Client connected');
  ws.id = wss.getUniqueID();
  let clientId = {
    type: "create",
    clientId: ws.id
  }
  ws.send(JSON.stringify(clientId));

  ws.on('message', (data) => {
    let msg = JSON.parse(data);
    if (msg.from === 'dealer') {
      switch (msg.type) {
        case 'room':
          let room = {
            type: 'room',
            roomId: msg.clientId
          }
          roomList.rooms[msg.clientId] = [];
          sendToRoom(msg.clientId, room);
          break;
        case 'info':
          let infoData = {
            type: 'info',
            lastOpenedCard: msg.cardId,
            openedCardPos: msg.openedCardPos,
            lastTurn: msg.lastTurn
          };
          roomList.rooms[msg.room].forEach((item) => sendToClient(item, infoData));
          break;
        case 'turn':
          let turnData = {
            type: 'turn',
            turn: msg.turn,
            lastTurn: msg.lastPlayer,
            currentTurn: msg.currentPlayer
          };
          sendToClient(msg.currentPlayer, turnData);
          break;
      }
    } else {
      let roomId = msg.room;

      switch (msg.type) {
        case 'join':
          if (roomList.rooms[roomId] === 'undefined') {
            console.log('Room not ready');
            return;
          }
          let clientId = msg.clientId;
          let roomLength = roomList.rooms[roomId].length;
          let joinData = {
            type: 'join',
            playerName: msg.playerName,
            clientId: msg.clientId
          }

          if (roomList.rooms[roomId] != undefined && roomLength < 2) {
            roomList.rooms[roomId].push(clientId);
            sendToRoom(roomId, joinData);
          }
          break;
        case 'pick':
          let pickData = {
            type: 'pick',
            cardPos: msg.cardPos,
            clientId: msg.clientId
          }
          sendToRoom(roomId, pickData);
          break;
      }
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});