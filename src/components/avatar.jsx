import styles from './Avatar.module.css'

const COLORS = [
    { bg: '#FAD199', text: '#7A4500' },
    { bg: '#D4EAE0', text: '#1D6B50' },
    { bg: '#E2D8F0', text: '#5030A0' },
    { bg: '#F5D5D5', text: '#8B2020' },
    { bg: '#E8E2DA', text: '#5A4F45' },
]

export default function Avatar({ username, size = 34 }) {
    const safe = username || '??'
    const colorIndex = safe.charCodeAt(0) % COLORS.length
    const color = COLORS[colorIndex]
    const initials = safe.slice(0,2).toUpperCase()

    return (
        <div
            className={styles.avatar} 
            style={{
                width: size, height: size, 
                borderRadius: size/2, 
                background: color.bg, 
                color: color.text, 
                fontSize: size * 0.35
            }}
        >
            {initials}
        </div>
    )
}