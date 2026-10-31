<template>
  <div class="card">
    <h2>Лобби</h2>
    <p>Гладиатор: <strong>{{ userLogin }}</strong></p>

    <button @click="join('find')">🔍 Автоподбор</button>
    <button @click="join('create')">➕ Создать комнату</button>

    <div class="join-row">
      <input v-model="roomIdInput" placeholder="UUID комнаты" />
      <button @click="joinById">Войти по ID</button>
    </div>

    <p v-if="roomError" class="error">{{ roomError }}</p>
    <button class="danger" @click="handleLogout">Выйти</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRooms, roomError } from '../composables/useRooms'

const emit = defineEmits(['room-joined', 'logout'])
const { userLogin, logout } = useAuth()
const { requestRoom } = useRooms()
const roomIdInput = ref('')

const join = async (endpoint) => {
  const id = await requestRoom(endpoint)
  if (id) emit('room-joined', id)
}

const joinById = () => {
  const id = roomIdInput.value.trim()
  if (!id) {
    roomError.value = 'Введите UUID комнаты'
    return
  }
  emit('room-joined', id)
}

const handleLogout = () => {
  logout()
  emit('logout')
}
</script>