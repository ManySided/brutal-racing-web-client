import { ref, onUnmounted } from 'vue'
import { useAuth } from './useAuth'

const ws = ref(null)
const isConnected = ref(false)

export function useWebSocket() {
    const { token } = useAuth()

    const connect = () => {
        if (ws.value) return

        // Передаем токен через query parameter
        const wsUrl = `ws://${window.location.host}/ws/game?token=${token.value}`
        ws.value = new WebSocket(wsUrl)

        ws.value.onopen = () => {
            console.log('WebSocket connected')
            isConnected.value = true
            // Убираем отправку токена первым сообщением
        }

        ws.value.onmessage = (event) => {
            const data = JSON.parse(event.data)
            window.dispatchEvent(new CustomEvent('ws-message', { detail: data }))
        }

        ws.value.onclose = () => {
            console.log('WebSocket closed')
            isConnected.value = false
            ws.value = null
        }

        ws.value.onerror = (error) => {
            console.error('WebSocket error:', error)
        }
    }

    const send = (data) => {
        if (ws.value && ws.value.readyState === WebSocket.OPEN) {
            ws.value.send(JSON.stringify(data))
        }
    }

    const disconnect = () => {
        if (ws.value) {
            ws.value.close()
            ws.value = null
        }
    }

    onUnmounted(() => {
        disconnect()
    })

    return {
        ws,
        isConnected,
        connect,
        send,
        disconnect
    }
}