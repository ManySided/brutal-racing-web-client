import { reactive, onMounted, onUnmounted } from 'vue'

const gameState = reactive({
    speed: 0,
    distance: 0,
    gear: 1,
    hasShield: true,
    warning: false,
    warningLane: 0,
    upcomingEvents: []
})

const playerState = reactive({
    lane: 0,
    alive: true,
    id: ''
})

export function useGame() {
    const handleMessage = (event) => {
        const data = event.detail
        if (data.type === 'GAME_STATE') {
            const myPlayer = data.players.find(p => p.id === playerState.id)
            if (myPlayer) {
                playerState.lane = myPlayer.lane
                playerState.alive = myPlayer.alive
                gameState.speed = myPlayer.speed
                gameState.distance = myPlayer.distance
                gameState.gear = myPlayer.gear
                gameState.hasShield = myPlayer.hasShield

                const danger = data.upcomingEvents.find(
                    e => e.distance > myPlayer.distance &&
                        e.distance < myPlayer.distance + 200 &&
                        (e.type === 'OBSTACLE' || e.type === 'POTHOLE')
                )
                gameState.warning = !!danger
                gameState.warningLane = danger ? danger.lane : 0
                gameState.upcomingEvents = data.upcomingEvents
            }
        }
    }

    onMounted(() => {
        window.addEventListener('ws-message', handleMessage)
    })

    onUnmounted(() => {
        window.removeEventListener('ws-message', handleMessage)
    })

    return {
        gameState,
        playerState
    }
}