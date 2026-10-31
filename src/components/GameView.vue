<template>
  <div class="game-container">
    <!-- ОБРАТНЫЙ ОТСЧЁТ -->
    <div v-if="phase === 'COUNTDOWN'" class="countdown-overlay">
      <span>{{ countdown }}</span>
      <small>Двигатели на пределе. Тормозов нет.</small>
    </div>

    <!-- ТАБЛИЦА ЛИДЕРОВ -->
    <div class="leaderboard">
      <h3>Позиции</h3>
      <div v-if="leaderboard && leaderboard.length > 0">
        <div v-for="p in leaderboard" :key="p.id"
             :class="['leader-row', { me: p.id === playerId, dead: !p.alive }]">
          <b>{{ p.position }}</b>
          <span>{{ p.id === playerId ? 'ВЫ' : (p.login || p.id.substring(0, 6)) }}</span>
          <span>{{ p.finished ? `ФИНИШ #${p.finishPosition}` : p.alive ? `${p.distance} м` : '💀' }}</span>
        </div>
      </div>
      <div v-else class="hint">Ожидание данных...</div>
    </div>

    <!-- МОЁ МЕСТО -->
    <div class="position-banner">
      МЕСТО <strong>{{ myPosition }}</strong> / {{ leaderboard?.length || 0 }}
      <span v-for="(msg, i) in overtakeMessages" :key="i" class="overtake">{{ msg }}</span>
    </div>

    <!-- HUD -->
    <div class="hud">
      <div>{{ me?.speed || 0 }} <small>км/ч</small></div>
      <div>{{ me?.distance || 0 }} <small>м</small></div>
      <div>Передача <strong>{{ me?.gear || 1 }}</strong></div>
      <div :style="{ color: me?.hasShield ? '#0f0' : '#f00' }">
        Щит {{ me?.hasShield ? '✓' : '✗' }}
      </div>
    </div>

    <!-- ТАХОМЕТР -->
    <div class="tachometer">
      <div class="zone blue"></div>
      <div class="zone green"></div>
      <div class="zone red"></div>
      <div class="shift-mark"></div>
      <div class="needle" :style="{ left: (me?.rpm || 0) + '%' }"></div>
    </div>
    <div class="shift-hint" :class="{ urgent: (me?.rpm || 0) >= 90 }">{{ shiftHint }}</div>

    <!-- ПРЕДУПРЕЖДЕНИЕ -->
    <div v-if="danger && alive" class="warning">
      ⚠️ {{ danger.type === 'POTHOLE' ? 'ЯМА' : 'ПРЕПЯТСТВИЕ' }}
      НА ПОЛОСЕ {{ danger.lane + 1 }}, ЧЕРЕЗ {{ danger.delta }} м
    </div>

    <!-- ТРАССА -->
    <div class="track">
      <div v-for="n in 4" :key="n" class="lane" :style="{ left: (n - 1) * 25 + '%' }"></div>

      <div v-for="(h, i) in hazards" :key="'h' + i"
           :class="['obstacle', h.type === 'POTHOLE' ? 'pothole' : 'block']"
           :style="{ left: h.lane * 25 + 2.5 + '%', bottom: h.delta / 400 * 350 + 50 + 'px' }"></div>

      <div v-for="(r, i) in rockets" :key="'r' + i" class="rocket"
           :style="{ left: r.lane * 25 + 5 + '%', bottom: (r.distance - (me?.distance || 0)) / 400 * 350 + 50 + 'px' }"></div>

      <template v-if="opponents && opponents.length > 0">
        <div v-for="o in opponents" :key="o.id"
             v-show="Math.abs(o.delta) < 400 && o.alive"
             class="other-car"
             :style="{ bottom: o.delta / 400 * 350 + 50 + 'px' }">
          {{ o.login || o.id.substring(0, 4) }}
        </div>
      </template>

      <div class="car" :class="{ dead: !alive }"
           :style="{ left: ((me?.lane || 0) * 25) + 2.5 + '%' }"></div>
    </div>

    <!-- СОСЕДИ -->
    <div v-for="o in opponents" :key="o.id"
         v-show="Math.abs(o.delta) < 400 && o.alive"
         class="other-car"
         :style="{
         left: (o.lane * 25) + 2.5 + '%',
         bottom: o.delta / 400 * 350 + 50 + 'px'
       }">
      {{ o.login || o.id.substring(0, 4) }}
    </div>

    <!-- СМЕРТЬ / ФИНИШ -->
    <div v-if="!alive || phase === 'FINISHED'" class="game-over">
      💀 {{ deathReason || 'ЗАЕЗД ОКОНЧЕН' }}
      <button @click="$emit('leave')">В лобби</button>
    </div>

    <!-- РЫЧАГИ -->
    <div v-else class="controls">
      <button @click="act('MOVE_LEFT')">← Влево</button>
      <button @click="act('SHIFT_GEAR')">Передача</button>
      <button @click="act('DROP_SHIELD')">Сброс щита</button>
      <button @click="act('FIRE_ROCKET')">Ракета</button>
      <button @click="act('MOVE_RIGHT')">Вправо →</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { playerId } from '../composables/useAuth'
import { useWebSocket, isConnected } from '../composables/useWebSocket'
import { useGame } from '../composables/useGame'

const emit = defineEmits(['leave'])
const { connect, send } = useWebSocket()

const {
  phase,
  countdown,
  leaderboard,
  hazards,
  rockets,
  overtakeMessages,
  deathReason,
  me,
  myPosition,
  alive,
  finished,
  shiftHint,
  danger,
  opponents
} = useGame()

const act = (action) => {
  if (alive.value) {
    send({ type: 'ACTION', action })
  }
}

const onKey = (e) => {
  const map = {
    ArrowLeft: 'MOVE_LEFT', ArrowRight: 'MOVE_RIGHT',
    ArrowUp: 'SHIFT_GEAR', ' ': 'FIRE_ROCKET', Shift: 'DROP_SHIELD'
  }
  if (map[e.key]) {
    e.preventDefault()
    act(map[e.key])
  }
}

onMounted(() => {
  if (!isConnected.value) {
    const roomId = localStorage.getItem('currentRoomId')
    if (roomId) {
      connect(roomId)
    }
  }
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
</script>