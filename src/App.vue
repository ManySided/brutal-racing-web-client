<template>
  <div class="app-container">
    <h1>🏁 БРУТАЛЬНЫЕ ГОНКИ 🏁</h1>

    <LoginView v-if="currentView === 'login'" @login-success="goToLobby" />
    <LobbyView
        v-if="currentView === 'lobby'"
        @room-joined="goToGame"
        @logout="goToLogin"
    />
    <GameView v-if="currentView === 'game'" @leave="goToLobby" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginView from './components/LoginView.vue'
import LobbyView from './components/LobbyView.vue'
import GameView from './components/GameView.vue'
import { useAuth } from './composables/useAuth'

const currentView = ref('login')
const { isAuthenticated } = useAuth()

onMounted(() => {
  if (isAuthenticated()) {
    currentView.value = 'lobby'
  }
})

const goToLogin = () => {
  currentView.value = 'login'
}

const goToLobby = () => {
  currentView.value = 'lobby'
}

const goToGame = (roomId) => {
  currentView.value = 'game'
}
</script>

<style>
body {
  background: #111;
  color: #eee;
  font-family: 'Courier New', monospace;
  margin: 0;
  display: flex;
  justify-content: center;
}
.app-container {
  text-align: center;
  padding: 20px;
  width: 100%;
  max-width: 600px;
}
h1 {
  color: #ff3333;
  text-shadow: 0 0 10px #f00;
}
</style>