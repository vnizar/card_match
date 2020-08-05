<template>
  <div id="app">
    <section class="grid">
      <Card v-for="card in theCards" :key="card.id" :card="card" @tapped="cardTapped" />
    </section>
    <section class="score-grid">
      <ScoreBoard :score="scorePlayer1" :playerName="playerOne.name" @reset="reset" />
      <ScoreBoard :score="scorePlayer2" :playerName="playerTwo.name" @reset="reset" />
      <PlayerTurn :playerName="playerTurn.name" :isReadyToStart="isReadyToStart" />
      <Timer :isStart="isStartTimer"/>
    </section>
  </div>
</template>

<script>
import Card from "./components/Card.vue";
import ScoreBoard from "./components/ScoreBoard.vue";
import PlayerTurn from "./components/PlayerTurn.vue";
import Timer from "./components/Timer.vue";
import ws from "./utils/ws";

const shapes = [
  "ace",
  "jack",
  "queen",
  "king",
  "ten",
  "two",
  "nine",
  "six",
  "seven"
];

const watchRoom = new URL(location.href).searchParams.get('watch');

const cards = [];

shapes.forEach(item => {
  const card = {
    matchKey: item,
    flipped: false,
    id: `${item}-a`,
    imgUrl: `/images/${item}.png`,
    matched: false
  };
  // first copy
  const cardA = card;
  cards.push(cardA);
  // second copy
  const cardB = { ...card };
  cardB.id = `${item}-b`;
  cards.push(cardB);
});

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initState() {
  shuffle(cards);

  return {
    isReadyToStart: false,
    flipsThisTurn: 0,
    theCards: cards,
    firstFlipID: null,
    firstFlipMatchKey: null,
    playerOne: {
      id: null,
      name: null
    },
    playerTwo: {
      id: null,
      name: null
    },
    playerTurn: {
      id: null,
      name: null
    },
    scorePlayer1: [],
    scorePlayer2: [],
    roomId: null,
    isStartTimer: false
  };
}

export default {
  name: "App",
  components: {
    Card,
    ScoreBoard,
    PlayerTurn,
    Timer
  },

  data() {
    return initState();
  },

  created() {
    ws.onclose = () => {
      console.log("Disconnected");
    };
    ws.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      setTimeout(() => {
        switch (message.type) {
          case "create": {
            var data = {};
            if(watchRoom != null){
              data = {
                from: "dealer",
                type: "watch",
                room: watchRoom,
                clientId: message.clientId,
                players: {
                  playerOne: {
                    data: this.playerOne,
                    score: this.scorePlayer1
                  },
                  playerTwo: {
                    data: this.playerTwo,
                    score: this.scorePlayer2
                  }
                }
              }
            } else {
              this.roomId = message.clientId;
              data = {
                from: "dealer",
                type: "room",
                clientId: message.clientId,
                cards: this.theCards
              };
            }
            ws.send(JSON.stringify(data));
            break;
          }
          case "room":
            this.playerTurn.name = message.roomId;
            break;
          case "join":
            if (this.playerOne.name === null) {
              this.playerOne = {
                id: message.clientId,
                name: message.playerName
              };
            } else {
              this.playerTwo = {
                id: message.clientId,
                name: message.playerName
              };
              this.isReadyToStart = true;
            }
            break;
          case "pick":
            if (this.playerTurn && this.playerTurn.id === message.clientId) {
              this.cardTapped(message.cardPos);
            }
            break;
          case "info":
            this.theCards = message.cards;
            this.scorePlayer1 = message.scores[0];
            this.scorePlayer2 = message.scores[1];
            break;
          case "watch":
            this.theCards = message.cards;
            this.theCards.forEach(item => item.flipped = false);
            this.playerOne = message.players[0];
            this.playerTwo = message.players[1];
            this.scorePlayer1 = message.scores[0];
            this.scorePlayer2 = message.scores[1];
            this.playerTurn = message.playerTurn;
            this.flipsThisTurn = message.flipsThisTurn;
            this.firstFlipID = message.firstFlipID;
            this.firstFlipMatchKey = message.firstFlipMatchKey;
            break;
        }
      }, 2000);
    };
  },

  computed: {
    matchCount() {
      return this.theCards.filter(card => card.matched === true).length / 2;
    }
  },

  methods: {
    sendDataInfo(carId, cardPos) {
      if(watchRoom) {
        return
      }

      let dataFlip = {
        from: "dealer",
        type: "info",
        room: this.roomId,
        cardId: carId,
        lastTurn: this.playerTurn.id,
        openedCardPos: cardPos,
        scores: [this.scorePlayer1, this.scorePlayer2],
        playerTurn: this.playerTurn,
        flipsThisTurn: this.flipsThisTurn,
        firstFlipID: this.firstFlipID,
        firstFlipMatchKey: this.firstFlipMatchKey,
        cards: this.theCards
      };
      ws.send(JSON.stringify(dataFlip));
    },

    sendDataTurn() {
      if(watchRoom) {
        return
      }

      let dataTurn = {
        from: "dealer",
        type: "turn",
        turn: this.flipsThisTurn,
        lastPlayer: this.playerTurn.id,
        currentPlayer: this.playerTurn.id,
        room: this.roomId
      };

      ws.send(JSON.stringify(dataTurn));
    },

    incrementFlipsThisTurn() {
      if(this.flipsThisTurn > 2) {
        this.flipsThisTurn = 0;
      }
      this.flipsThisTurn++;
    },

    cardTapped(cardPos) {
      // store a copy of the card data as tappedCard
      const tappedCard = this.theCards[cardPos];

      this.incrementFlipsThisTurn();

      if (this.flipsThisTurn === 1) {
        this.runTurn1(tappedCard);
        this.sendDataInfo(tappedCard.id, cardPos);
        this.sendDataTurn();
      }
      if (this.flipsThisTurn === 2) {
        this.runTurn2(tappedCard);

        this.sendDataInfo(tappedCard.id, cardPos);
        this.checkMatch(tappedCard);
      }
    },

    runTurn1(tappedCard) {
      this.flipCard(tappedCard.id);

      this.firstFlipID = tappedCard.id;
      this.firstFlipMatchKey = tappedCard.matchKey;
    },

    runTurn2(tappedCard) {
      this.flipCard(tappedCard.id);
    },

    checkMatch(tappedCard) {
      setTimeout(() => {
        if (
          tappedCard.matchKey === this.firstFlipMatchKey 
          && this.firstFlipID != tappedCard.id
          && !tappedCard.matched
        ) {
          const newCards = this.theCards.map(card =>
            [tappedCard.id, this.firstFlipID].includes(card.id)
              ? { ...card, matched: true }
              : card
          );
          this.theCards = newCards;

          this.addScore();
        } else {
          this.flipCard(tappedCard.id);
          this.flipCard(this.firstFlipID);
        }

        if(watchRoom && this.theCards.filter(item => item.flipped).length > 0) {
          this.theCards.forEach(item => item.flipped = false);
        }

        this.flipsThisTurn = 0;
        this.switchPlayer();
      }, 1000);
    },

    addScore() {
      if (this.playerTurn.id === this.playerOne.id) {
        this.scorePlayer1.push("match");
      } else {
        this.scorePlayer2.push("match");
      }
    },

    switchPlayer() {
      if (this.playerTurn.id === this.playerOne.id) {
        this.playerTurn = this.playerTwo;
      } else {
        this.playerTurn = this.playerOne;
      }

      this.sendDataTurn();
    },

    flipCard(tappedCardID) {
      const newCards = this.theCards.map(card =>
        card.id === tappedCardID ? { ...card, flipped: !card.flipped } : card
      );
      // update cards
      this.theCards = newCards;
    },

    stopGame() {
      ws.close();
    },

    startGame() {
      let playerData = {
        from: "dealer",
        type: "turn",
        turn: this.flipsThisTurn,
        lastPlayer: this.playerOne.id,
        currentPlayer: this.playerOne.id,
        room: this.roomId
      };
      this.playerTurn = this.playerOne;
      ws.send(JSON.stringify(playerData));
      this.isStartTimer = true;
    },

    reset() {
      Object.assign(this.$data, initState());
    }
  }
};
</script>

<style lang="scss">
body {
  background: #222222;
  color: red;
  padding: 0;
  margin: 0;
  font-family: arial, helvetica, sans-serif;
  font-size: 15px;
}
.toolbar {
  position: fixed;
  right: 12px;
  top: 15px;
  z-index: 3;
}
.btn {
  appearance: none;
  background: transparent;
  border: 2px solid white;
  color: white;
  display: inline;
  font: 11px / 1 arial;
  letter-spacing: 0.3px;
  padding: 4px 12px;
  height: 24px;
  border-radius: 12px;
}
.btn:active {
  color: black;
  background-color: white;
}
.app {
  margin: 0;
  padding: 20px;
  @media (min-width: 700px) {
    padding: 50px;
  }
}
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  width: calc(100vw -80px);
  height: calc(100vh - 100px);
}
.score-grid {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
</style>
