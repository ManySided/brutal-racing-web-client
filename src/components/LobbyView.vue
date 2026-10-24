<template>
  <div class="card">
    <h2>Лобби</h2>
    <p>Гладиатор: <strong>{{ userLogin }}</strong></p>
    <div class="buttons">
      <button @click="findRoom">🔍 Автоподбор</button>
      <button @click="createRoom">➕ Создать комнату</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <button @click="logout" class="danger">Выйти</button>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['room-joined', 'logout'])

const { userLogin, logout, error } = useAuth()

const findRoom = async () => {
  try {
    const res = await fetch('/api/rooms/find', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    const data = await res.json()
    emit('room-joined', data.roomId)
  } catch (e) {
    error.value = 'Ошибка поиска комнаты'
  }
}

const createRoom = async () => {
  try {
    const res = await fetch('/api/rooms/create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    const data = await res.json()
    emit('room-joined', data.roomId)
  } catch (e) {
    error.value = 'Ошибка создания комнаты'
  }
}

const handleLogout = () => {
  logout()
  emit('logout')
}
</script>

<style scoped>
.card {
  background: #222;
  padding: 30px;
  border: 2px solid #ff3333;
  border-radius: 10px;
  margin-top: 20px;
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
.error { color: #ff5555; margin-top: 10px; }
</style>