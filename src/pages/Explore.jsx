import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SparkCard from '../components/SparkCard'
import Navbar from '../components/Navbar'
import styles from './Explore.module.css'
import pageStyles from './Page.module.css'

const STARTER_TAGS = [
    'Neuroscience', 'Molecular Biology', 'Physics', 'Philosophy', 'Ecology', 'Mathematics', 'Genetic Engineering', 'Bio-Engineering', 'Botany', 'Chemistry', 'Astronomy', 'General'
]

export default function Explore() {
    const [tags, setTags] = useState(['ALL', ...STARTER_TAGS])
    const [activeTag, setActiveTag] = useState('ALL')
    const [sparks, setSparks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTags() {
            const { data } = await supabase
                .from('sparks')
                .select('tag')

            if (data) {
                const fromDB = data.map(s => s.tag).filter(Boolean)
                const merged = ['ALL', ...new Set([...STARTER_TAGS, ...fromDB].sort())]
                setTags(merged)
            }
        }
        fetchTags()
    }, [])

    useEffect(() => {
        async function fetchSparks() {
            setLoading(true)

            let query = supabase
                .from('sparks')
                .select('*')
                .order('likes', { ascending: false })
                .limit(30)
            
            if (activeTag !== 'ALL') {
                query = query.eq('tag', activeTag)
            }

            const { data } = await query
            setSparks(data || [])
            setLoading(false)
        }
        fetchSparks()
    }, [activeTag])

    return (
        <div className={pageStyles.page}>
            {/* Top Bar */}
            <div className={pageStyles.topbar}>
                <p className={pageStyles.title}>Explore</p>
                <p className={pageStyles.sub}>Find Sparks by field</p>
            </div>

            {/* Tag Scroll Strip */}
            <div className={styles.tagStrip}>
                {tags.map(tag => (
                    <button
                        key={tag}
                        className={`${styles.tagPill} ${activeTag === tag ? styles.tagPillActive : ''}`}
                        onClick={() => setActiveTag(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Results */}
            <div className={styles.results}>
                {loading ? (
                    <p className={pageStyles.loading}>Loading sparks...</p>
                ) : sparks.length === 0 ? (
                    <div className={styles.empty}>
                        <p className={styles.emptyTitle}>Infinite Oppurtunities, Just one Spark away</p>
                        <p className={styles.emptyHint}>Be the first to ignite one!</p>
                    </div>
                ) : (
                    sparks.map(spark => <SparkCard key={spark.id} spark={spark} />)
                )}
            </div>
            
            <Navbar />
        </div>
    )
}