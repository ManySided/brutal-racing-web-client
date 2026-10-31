import { ref } from 'vue'

export const token = ref(localStorage.getItem('token') || '')
export const playerId = ref(localStorage.getItem('playerId') || '')
export const userLogin = ref(localStorage.getItem('login') || '')
export const error = ref('')

export function useAuth() {
    const saveAuth = (data) => {
        token.value = data.token
        playerId.value = data.playerId
        userLogin.value = data.login
        localStorage.setItem('token', data.token)
        localStorage.setItem('playerId', data.playerId)
        localStorage.setItem('login', data.login)
        error.value = ''
    }

    const login = async (form) => {
        return await authRequest('login', form)
    }

    const register = async (form) => {
        return await authRequest('register', form)
    }

    const authRequest = async (endpoint, form) => {
        try {
            const res = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            if (!res.ok) throw new Error('Неверные данные или логин уже занят')
            saveAuth(await res.json())
            return true
        } catch (e) {
            error.value = e.message
            return false
        }
    }

    const logout = () => {
        token.value = playerId.value = userLogin.value = ''
        localStorage.clear()
    }

    return { token, playerId, userLogin, error, login, register, authRequest, logout }
}