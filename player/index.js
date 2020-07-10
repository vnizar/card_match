const WebSocket = require('ws');

const roomId = "6ef1c851-9c1e";
const playerName = "Zombie";
const host = "ws://localhost:3000";
const ws = new WebSocket(host);

let dataJoin = (data) => {
  clientId = data.clientId
  let dataJoin = {
    from: 'player',
    type: 'join',
    room: roomId,
    playerName: playerName,
    clientId: data.clientId
  }
  return dataJoin;
}

let dataPick = (pos) => {
  let dataPick = {
    from: 'player',
    type: 'pick',
    room: roomId,
    clientId: clientId,
    cardPos: pos
  }

  return dataPick;
}

var clientId = null;

ws.on('open', function open() {
  console.log('connected');
});

ws.on('message', (event) => {
  let data = JSON.parse(event);
  switch (data.type) {
    case 'create':
      ws.send(JSON.stringify(dataJoin(data)));
      break;
    case 'info':
      // everytime a card flipped you will get data about flipped card, EX:
      // { type: 'info', lastOpenedCard: 'seven-a', openedCardPos: 3, lastTurn: 'f6d11cbf-1e88' }
      console.log(data);
      break;
    case 'turn':
      // if it's your turn to pick a card, you will get this event with data
      // { type: 'turn', turn: 1, lastTurn: 'f6d11cbf-1e88', currentTurn: 'f6d11cbf-1e88' }
      // turn : 0 = first pick
      // turn : 1 = second pick
      // To pick a card you can send the index of the card you want to pick by using dataPick() function and pass the index

      let position = 12;
      ws.send(JSON.stringify(dataPick(position)));
      break;
  }
});

