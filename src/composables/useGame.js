import { reactive, computed, ref, onMounted, onUnmounted } from 'vue'
import { playerId } from './useAuth'

export function useGame() {
    const phase = ref('WAITING')
    const countdown = ref(5)
    const leaderboard = ref([])
    const hazards = ref([])
    const rockets = ref([])
    const overtakeMessages = ref([])
    const deathReason = ref('')

    const me = computed(() => {
        const found = leaderboard.value.find(p => p.id === playerId.value)
        console.log('me computed:', { playerId: playerId.value, leaderboard: leaderboard.value, found })
        return found || null
    })
    const myPosition = computed(() => me.value?.position ?? '-')
    const alive = computed(() => me.value?.alive ?? true) // <-- По умолчанию true
    const finished = computed(() => me.value?.finished ?? false)

    const shiftHint = computed(() => {
        if (!me.value || !alive.value || finished.value) return ''
        if (me.value.rpm >= 90) return '⚠️ ПЕРЕГРЕВ! ПЕРЕКЛЮЧИ СРОЧНО'
        if (me.value.rpm >= 65 && me.value.rpm <= 75 && me.value.gear < 4) return '✅ ПЕРЕКЛЮЧАЙ СЕЙЧАС'
        if (me.value.rpm < 30 && me.value.gear > 1) return '↓ РАНОВато, сбавь передачу'
        return ''
    })

    const danger = computed(() => {
        if (!me.value || !hazards.value) return null
        return hazards.value.find(e =>
            e.lane === me.value?.lane &&
            e.delta < 220 &&
            ['OBSTACLE', 'POTHOLE', 'SHIELD_OBSTACLE'].includes(e.type)
        ) || null
    })

    const opponents = computed(() => {
        if (!leaderboard.value || !me.value) return []
        return leaderboard.value
            .filter(p => p.id !== playerId.value)
            .map(p => ({
                id: p.id,
                login: p.login,
                delta: p.distance - (me.value?.distance || 0),
                ahead: p.distance > (me.value?.distance || 0),
                alive: p.alive
            }))
    })

    const onMessage = ({ detail: data }) => {
        console.log('GameView received:', data.type, data)

        if (data.type === 'COUNTDOWN') {
            phase.value = 'COUNTDOWN'
            countdown.value = data.countdown
        }

        if (data.type === 'RACE_STATE') {
            phase.value = data.phase
            leaderboard.value = data.leaderboard || []
            rockets.value = data.rockets || []
            hazards.value = data.hazardsByPlayer?.[playerId.value] || []

            console.log('Updated leaderboard:', leaderboard.value)
            console.log('Current playerId:', playerId.value)

            const self = me.value
            if (self && !self.alive) {
                deathReason.value = self.deathReason || 'МАШИНА УНИЧТОЖЕНА'
            }

            for (const event of data.overtakes || []) {
                if (event.playerId === playerId.value) {
                    overtakeMessages.value.push(
                        `ОБГОН! Место ${event.newPosition} (было ${event.overtakenPosition})`
                    )
                    setTimeout(() => overtakeMessages.value.shift(), 2500)
                }
            }
        }
    }

    const onClosed = () => {
        phase.value = 'FINISHED'
        deathReason.value = 'СВЯЗЬ С КАПСУЛОЙ ПОТЕРЯНА'
    }

    onMounted(() => {
        console.log('useGame mounted, playerId:', playerId.value)
        window.addEventListener('ws-message', onMessage)
        window.addEventListener('ws-closed', onClosed)
    })

    onUnmounted(() => {
        window.removeEventListener('ws-message', onMessage)
        window.removeEventListener('ws-closed', onClosed)
    })

    return {
        phase, countdown, leaderboard, hazards, rockets, overtakeMessages,
        deathReason, me, myPosition, alive, finished, shiftHint, danger, opponents
    }
}