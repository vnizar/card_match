<template>
  <div class="player_turn">
    <span class="text">Player's Turn</span>
    <div>
      <span class="player_name" :style="{'color': color}">{{ playerName }}</span>
      <button v-on:click="start" v-if="isReadyToStart">Start Game</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlayerTurn",
  props: {
    playerName: {
      type: String,
      default: () => ""
    },
    isReadyToStart: null,
    color: {
      type: String,
      default: () => "yellow"
    }
  },
  methods: {
    start() {
      this.$parent.startGame();
    }
  },
  watch: {
    isReadyToStart: function() {
      if (!this.isReadyToStart) {
        return true;
      }

      return false;
    }
  }
};
</script>

<style lang="scss">
.player_turn {
  color: #fff;
  justify-content: space-between;
  min-height: 40px;
  padding: 15px 20px;
  top: 0;
  left: 0;
  @media (min-width: 700px) {
    padding: 15px 50px;
  }
  text-align: center;
}

.text {
  color: #fff;
  font: bold 18px / 1.4 arial;
  width: 100%;
}

.player_name {
  color: royalblue;
  font: bold 24px / 1.4 arial;
  margin-right: 20px;
}
</style>