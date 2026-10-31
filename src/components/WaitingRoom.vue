<template>
  <div class="card">
    <h2>Капсулы подготовлены</h2>

    <div class="room-id">
      <small>Отправь друзьям ID комнаты</small>
      <strong>{{ roomId }}</strong>
      <button class="small" @click="copyId">Копировать</button>
    </div>

    <p class="connection" :class="{ bad: !isConnected }">
      {{ isConnected ? '● Связь с ареной установлена' : '○ Нет соединения' }}
    </p>

    <ul class="players">
      <li v-for="p in players" :key="p.id">
        <span :class="{ me: p.id === playerId }">
          {{ p.login || p.id.substring(0, 8) }}
          <small v-if="p.id === creatorId">👑 создатель</small>
        </span>
        <span :class="p.ready ? 'ready' : 'not-ready'">
          {{ p.ready ? '✔ ГОТОВ' : '… ожидание' }}
        </span>
      </li>
      <li v-for="n in emptySeats" :key="'empty-' + n" class="empty">
        Свободная капсула {{ n }}
      </li>
    </ul>

    <button :class="ready ? 'secondary' : ''" @click="toggleReady">
      {{ ready ? 'Отменить готовность' : 'Я готов' }}
    </button>

    <button v-if="isCreator" :disabled="!canStart" @click="start">
      🏁 Начать заезд
    </button>
    <p v-else class="hint">Ждём команду создателя комнаты…</p>

    <button class="danger" @click="$emit('leave')">Покинуть комнату</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useWebSocket, isConnected } from '../composables/useWebSocket'

const props = defineProps({ roomId: String })
const emit = defineEmits(['leave', 'start-race'])

const { playerId } = useAuth()
const { connect, send } = useWebSocket()

const players = ref([])
const creatorId = ref('')
const ready = ref(false)

const isCreator = computed(() => creatorId.value === playerId.value)
const allReady = computed(() =>
    players.value.length >= 2 && players.value.every(p => p.ready)
)
const canStart = computed(() => isCreator.value && allReady.value && isConnected.value)
const emptySeats = computed(() => Math.max(0, 4 - players.value.length))

const onMessage = ({ detail: data }) => {
  if (data.type === 'LOBBY_STATE') {
    players.value = data.players
    creatorId.value = data.creatorId
  }

  if (data.type === 'COUNTDOWN' || data.type === 'RACE_STATE') {
    emit('start-race')
  }
}

const toggleReady = () => {
  ready.value = !ready.value
  send({ type: 'READY', ready: ready.value })
}

const start = () => {
  send({ type: 'START' })
}

const copyId = async () => {
  try { await navigator.clipboard.writeText(props.roomId) } catch {}
}

onMounted(() => {
  connect(props.roomId)
  window.addEventListener('ws-message', onMessage)
})

onUnmounted(() => {
  window.removeEventListener('ws-message', onMessage)
})
</script>