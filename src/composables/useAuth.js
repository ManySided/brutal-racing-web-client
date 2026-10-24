import { ref, reactive } from 'vue'

const token = ref(localStorage.getItem('token') || '')
const playerId = ref(localStorage.getItem('playerId') || '')
const userLogin = ref(localStorage.getItem('login') || '')
const error = ref('')

export function useAuth() {
    const apiCall = async (endpoint, body) => {
        try {
            const res = await fetch(`/api${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token.value ? `Bearer ${token.value}` : ''
                },
                body: JSON.stringify(body)
            })
            if (!res.ok) throw new Error(await res.text())
            return await res.json()
        } catch (e) {
            error.value = e.message
            throw e
        }
    }

    const login = async (loginData) => {
        try {
            const data = await apiCall('/auth/login', loginData)
            saveAuth(data)
            return true
        } catch (e) {
            return false
        }
    }

    const register = async (loginData) => {
        try {
            const data = await apiCall('/auth/register', loginData)
            saveAuth(data)
            return true
        } catch (e) {
            return false
        }
    }

    const saveAuth = (data) => {
        token.value = data.token
        playerId.value = data.playerId
        userLogin.value = data.login
        localStorage.setItem('token', data.token)
        localStorage.setItem('playerId', data.playerId)
        localStorage.setItem('login', data.login)
        error.value = ''
    }

    const logout = () => {
        token.value = ''
        playerId.value = ''
        userLogin.value = ''
        localStorage.clear()
    }

    const isAuthenticated = () => !!token.value

    return {
        token,
        playerId,
        userLogin,
        error,
        login,
        register,
        logout,
        isAuthenticated
    }
}