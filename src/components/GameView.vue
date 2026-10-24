<template>
  <div class="game-container">
    <div class="hud">
      <div>Скорость: <strong>{{ gameState.speed }} км/ч</strong></div>
      <div>Дистанция: <strong>{{ gameState.distance }} м</strong></div>
      <div>Передача: <strong>{{ gameState.gear }}</strong></div>
      <div>Щит: <strong :style="{color: gameState.hasShield ? '#0f0' : '#f00'}">
        {{ gameState.hasShield ? '✓' : '✗' }}
      </strong></div>
    </div>

    <div class="warning" v-if="gameState.warning">
      ⚠️ ОПАСНОСТЬ НА ПОЛОСЕ {{ gameState.warningLane + 1 }}! ⚠️
    </div>

    <div class="track">
      <div class="lane" v-for="n in 4" :key="n"></div>
      <div
          class="car"
          :class="{ 'dead': !playerState.alive }"
          :style="{ left: (playerState.lane * 25) + 2.5 + '%' }"
      ></div>
      <div
          v-for="(ev, idx) in gameState.upcomingEvents"
          :key="idx"
          :class="['obstacle', ev.type === 'POTHOLE' ? 'pothole' : 'obstacle-block']"
          :style="{
          left: (ev.lane * 25) + 2.5 + '%',
          bottom: ((ev.distance - playerState.distance) / 500) * 400 + 50 + 'px'
        }"
      ></div>
    </div>

    <div class="controls">
      <button @click="sendAction('MOVE_LEFT')">← Влево</button>
      <button @click="sendAction('SHIFT_GEAR')">Передача</button>
      <button @click="sendAction('DROP_SHIELD')">Сброс щита</button>
      <button @click="sendAction('FIRE_ROCKET')">Ракета</button>
      <button @click="sendAction('MOVE_RIGHT')">Вправо →</button>
    </div>

    <button @click="leaveGame" class="danger" style="margin-top: 10px;">
      Покинуть заезд
    </button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useWebSocket } from '../composables/useWebSocket'
import { useGame } from '../composables/useGame'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['leave'])

const { connect, send, disconnect } = useWebSocket()
const { gameState, playerState } = useGame()
const { playerId } = useAuth()

onMounted(() => {
  playerState.id = playerId.value
  connect()
})

const sendAction = (action) => {
  if (playerState.alive) {
    send({ action })
  }
}

const leaveGame = () => {
  disconnect()
  emit('leave')
}
</script>

<style scoped>
.game-container { margin-top: 20px; }
.hud {
  display: flex;
  justify-content: space-around;
  background: #222;
  padding: 10px;
  border: 1px solid #444;
  margin-bottom: 10px;
}
.warning {
  background: rgba(255,0,0,0.8);
  color: #fff;
  padding: 10px;
  font-weight: bold;
  animation: pulse 0.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.track {
  position: relative;
  width: 100%;
  height: 400px;
  background: #1a1a1a;
  border: 2px solid #444;
  overflow: hidden;
}
.lane {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 25%;
  border-left: 2px dashed #333;
  border-right: 2px dashed #333;
}
.car {
  position: absolute;
  width: 20%;
  height: 40px;
  background: #ff4444;
  bottom: 50px;
  border-radius: 5px;
  box-shadow: 0 0 15px #f00;
  transition: left 0.15s;
}
.car.dead {
  background: #555;
  box-shadow: 0 0 30px #ffaa00;
}
.obstacle {
  position: absolute;
  width: 20%;
  height: 30px;
  border-radius: 5px;
  transition: bottom 0.1s linear;
}
.obstacle-block {
  background: #666;
  border: 2px solid #999;
}
.pothole {
  background: #000;
  border: 2px solid #333;
  border-radius: 50%;
  height: 20px;
}
.controls {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  margin-top: 10px;
}
.controls button {
  padding: 15px 5px;
  font-size: 0.9em;
}
button {
  padding: 10px 20px;
  margin: 5px;
  background: #ff3333;
  color: #fff;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
button:hover { background: #ff0000; }
button.danger { background: #800; }
</style>