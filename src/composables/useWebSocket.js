import { ref } from 'vue'

const socket = ref(null)
const currentRoomId = ref(null)
export const isConnected = ref(false)

export function useWebSocket() {
    const connect = (roomId) => {
        console.log('useWebSocket.connect called with roomId:', roomId)

        if (socket.value?.readyState === WebSocket.OPEN && currentRoomId.value === roomId) {
            console.log('Already connected to this room')
            return
        }

        disconnect()
        currentRoomId.value = roomId
        const jwt = localStorage.getItem('token')
        const login = localStorage.getItem('login')

        console.log('Connecting to WebSocket with token:', jwt ? 'present' : 'missing')

        socket.value = new WebSocket(
            `ws://${window.location.host}/ws/game?token=${encodeURIComponent(jwt)}&roomId=${roomId}&login=${encodeURIComponent(login)}`
        )

        socket.value.onopen = () => {
            console.log('WebSocket connected successfully')
            isConnected.value = true
            window.dispatchEvent(new CustomEvent('ws-status', { detail: true }))
        }

        socket.value.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                console.log('WebSocket received:', data.type, data)
                window.dispatchEvent(new CustomEvent('ws-message', { detail: data }))
            } catch (e) {
                console.warn('Некорректный пакет от сервера', e)
            }
        }

        socket.value.onclose = () => {
            console.log('WebSocket closed')
            isConnected.value = false
            window.dispatchEvent(new CustomEvent('ws-status', { detail: false }))
            window.dispatchEvent(new CustomEvent('ws-closed'))
        }

        socket.value.onerror = (error) => {
            console.error('WebSocket error:', error)
        }
    }

    const send = (payload) => {
        if (socket.value?.readyState === WebSocket.OPEN) {
            socket.value.send(JSON.stringify(payload))
        } else {
            console.warn('WebSocket not open, cannot send:', payload)
        }
    }

    const disconnect = () => {
        if (socket.value) {
            console.log('Disconnecting WebSocket')
            socket.value.onclose = null
            socket.value.close()
            socket.value = null
        }
        isConnected.value = false
        currentRoomId.value = null
    }

    return { connect, send, disconnect, isConnected }
}