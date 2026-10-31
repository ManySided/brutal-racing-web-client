<template>
  <div class="app-container">
    <h1>🏁 БРУТАЛЬНЫЕ ГОНКИ 🏁</h1>

    <LoginView v-if="view === 'login'" @login-success="view = 'lobby'" />

    <LobbyView v-else-if="view === 'lobby'"
               @room-joined="joinRoom" @logout="leaveAll" />

    <WaitingRoom v-else-if="view === 'waiting'"
                 :room-id="roomId"
                 @leave="leaveAll"
                 @start-race="startRace" />

    <GameView v-else-if="view === 'game'" @leave="leaveAll" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoginView from './components/LoginView.vue'
import LobbyView from './components/LobbyView.vue'
import WaitingRoom from './components/WaitingRoom.vue'
import GameView from './components/GameView.vue'
import { useWebSocket } from './composables/useWebSocket'

const view = ref('login')
const roomId = ref('')
const { disconnect } = useWebSocket()

if (localStorage.getItem('token')) view.value = 'lobby'

const joinRoom = (id) => {
  roomId.value = id
  localStorage.setItem('currentRoomId', id)
  view.value = 'waiting'
}

const startRace = () => {
  view.value = 'game'
}

const leaveAll = () => {
  disconnect()
  roomId.value = ''
  localStorage.removeItem('currentRoomId')
  view.value = 'lobby'
}
</script>