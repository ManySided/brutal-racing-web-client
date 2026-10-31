import { ref } from 'vue'
import { token } from './useAuth'

export const roomError = ref('')

export function useRooms() {
    const requestRoom = async (endpoint) => {
        try {
            const res = await fetch(`/api/rooms/${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token.value}` }
            })
            if (!res.ok) throw new Error('Сервер отклонил запрос комнаты')
            const data = await res.json()
            roomError.value = ''
            return data.roomId
        } catch (e) {
            roomError.value = e.message
            return null
        }
    }

    return { roomError, requestRoom }
}