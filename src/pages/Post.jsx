import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import styles from './Post.module.css'

export default function Post() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [text, setText] = useState('')
    const [tag, setTag] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const LIMIT = 280

    const [suggestedTags, setSuggestedTags] = useState([
        'Neuroscience', 'Molecular Biology', 'Physics', 'Bio-Engineering',
        'Philosophy', 'Ecology', 'Mathematics', 'Genetic Engineering',
        'Botany', 'Chemistry', 'Astronomy', 'Biotechnology', 'General'
    ])

    useEffect(() => {
        async function fetchTags() {
            const { data } = await supabase
                .from('sparks')
                .select('tag')

            if (data) {
                const unique = [...new Set(data.map(s => s.tag).filter(Boolean).sort())]
                const merged = [...new Set([...suggestedTags, ...unique])]
                setSuggestedTags(merged.sort())
            }
        }
        fetchTags()
    }, [])

    async function handlePost() {
        if (!text.trim()) return
        if (!user || !profile) {
            alert('Please Wait - Profile is still Loading')
            return
        }
        setLoading(true)
        const { error } = await supabase.from('sparks').insert({
            user_id: user.id,
            username: profile.username,
            text: text.trim(),
            tag: tag || 'General',
        })
        if (error) {
            console.error('Spark insert error: ', error.message)
            alert('Error: ' + error.message)
            setLoading(false)
            return
        }

        setLoading(false)
        navigate('/')
    }

    return (
        <div className={styles.page}>
            <div className={styles.topbar}>
                <p className={styles.title}>New Spark</p>
                <p className={styles.sub}>Let your Brain think!</p>
            </div>
            
            <div className={styles.content}>
                <label className={styles.label}>YOUR SPARK</label>
                <textarea
                    className={styles.textarea}
                    placeholder="What if..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    maxLength={LIMIT}
                />
                <p className={styles.charCount}
                    style={{ color: LIMIT - text.length < 40 ? 'var(--spark)' : 'var(--mid)'}}>
                    {LIMIT - text.length} remaining
                </p>

                <label className={styles.label}> TAG A FIELD </label>
                <input
                    className={styles.tagInput}
                    placeholder="e.g. Neuroscience..."
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                />
                <div className={styles.tagSuggestions}>
                    {suggestedTags.map(t => (
                        <button
                            key={t}
                            className={`${styles.tagChip} ${tag === t ? styles.tagChipActive : ''}`}
                            onClick={() => setTag(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className={styles.hint}>
                    <strong>A Spark is not a Hypothesis.</strong>
                    <p>It's the raw curiosity of explorers who think differently. Post it as it comes</p>
                </div>

                {error && <p className={styles.error}>{error}</p>}
                <button
                    className={styles.postBtn}
                    onClick={handlePost}
                    disabled={!text.trim() || loading}
                >
                    ✨ Ignite this Spark!
                </button>
            </div>

            <Navbar />
        </div>
    )
}