<template>
  <div class="card">
    <h2>Вход в капсулу</h2>
    <input v-model="form.login" placeholder="Логин" />
    <input v-model="form.password" type="password" placeholder="Пароль" />
    <div class="buttons">
      <button @click="handleLogin">Войти</button>
      <button @click="handleRegister" class="secondary">Регистрация</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['login-success'])

const { login, register, error } = useAuth()
const form = reactive({ login: '', password: '' })

const handleLogin = async () => {
  const success = await login(form)
  if (success) emit('login-success')
}

const handleRegister = async () => {
  const success = await register(form)
  if (success) emit('login-success')
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
input {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  background: #333;
  border: 1px solid #555;
  color: #fff;
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
button.secondary { background: #444; }
.error { color: #ff5555; margin-top: 10px; }
</style>