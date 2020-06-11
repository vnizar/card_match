# card_match

This project contains websocket server in `/server`, web app (Dealer), and example for client (Player) in `/player`.  
You need **Node JS** and **Vue** to run this project. 

## Project setup
```
npm install
```
By default the websocket server will run on `ws://localhost:3000`, and web app will run on `http://localhost:8080/`.  

### Run this project
First, you need to start the websocket server

```
node server/index.js
```

Then, start the web app (Dealer)
```
npm run serve
```
Before run the client (Player), you need to copy the room ID under **Player's Turn** on the web app, and paste to `roomId` variable in `/player/index.js` file, you can change your name and websocket server too.   
Once you set the `roomId`, you can run the client code.
```
./node_modules/forever/bin/forever player/index.js
```

### How to play
Once 2 players joined in a room, the game will begin automatically, first turn will always Player 1, and will change to Player 2 after Player 1 pick 2 cards.  
Everytime a player pick a card, the server will send `info` event to both players, so they can **see** the flipped card's data.   
You just need to change the code on `info` and `turn` event, you can see the comments on both events with example.

### Credits
This project is modified version of https://github.com/jmuspratt/memory-vue by add websocket and change assets with playing cards from http://acbl.mybigcommerce.com/52-playing-cards/.
