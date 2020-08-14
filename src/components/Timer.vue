<template>
  <div class="game_timer">
    <span class="text">Time</span>
    <div class="timer">
      <countdown
        ref="countdown"
        :emit-events="true"
        @end="endTime"
        :time="time"
        :auto-start="false"
      >
        <template slot-scope="props">{{ props.minutes }}:{{ props.seconds }}</template>
      </countdown>
    </div>
  </div>
</template>

<script>
export default {
  name: "Timer",
  props: {
    isStart: null,
    time: {
      type: Number,
      default: () => 5 * 60 *1000
    }
  },
  methods: {
    endTime() {
      this.$parent.stopGame();
    }
  },
  watch: {
    isStart: function() {
      if (this.isStart) {
        this.$refs.countdown.start();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.game_timer {
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

.timer {
  color: red;
  font: bold 24px / 1.4 arial;
  font-size: 24pt;
}
</style>
