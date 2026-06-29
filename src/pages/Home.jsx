import { useEffect, useState } from "react"
import { supabase } from '../supabase'
import SparkCard from '../components/SparkCard'
import Navbar from '../components/Navbar'
import styles from './Page.module.css'

export default function Home() {
    const [sparks, setSparks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchSparks() {
            const { data, error } = await supabase
                .from('sparks')
                .select('*')
                .order('likes', { ascending: false })
                .limit(20)

            if (error) {
                setError('Loading Failed. Try Again...')
                setLoading(false)
                return
            }

            setSparks(data || [])
            setLoading(false)
        }
        fetchSparks()
    }, [])

    return (
        <div className={styles.page}>
            <div className={styles.topbar}>
                <div className={styles.logo}>✨ <span>Spark</span></div>
                <p className={styles.sub}>Trending "What ifs" today</p>
            </div>

            <div className={styles.hero}>
                <p>"A Spark doesn't need to be right. It just needs to <em>exist.</em>"</p>
            </div>

            <p className={styles.sectionLabel}>TRENDING SPARKS</p>

            {loading
                ? <p className={styles.loading}>Loading Sparks...</p>
                : error
                    ? <p className={styles.error}>{error}</p>
                    : sparks.map(spark => <SparkCard key={spark.id} spark={spark} />)
            }            
            <Navbar />
        </div>
    )
}