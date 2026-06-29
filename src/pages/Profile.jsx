import { useEffect, useState } from "react"
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import SparkCard from '../components/SparkCard'
import Avatar from "../components/avatar"
import Navbar from '../components/Navbar'
import styles from './Profile.module.css'
import pageStyles from './Page.module.css'

export default function Profile() {
    const { user, profile, fetchProfile } = useAuth()
    const [mySparks, setMySparks] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingInterests, setEditingInterests] = useState(false)
    const [interestInput, setInterestInput] = useState('')

    useEffect(() => {
        if (!user) return

        async function fetchMySparks() {
            const { data } = await supabase
                .from('sparks')
                .select('*')
                .eq('user_id',user.id)
                .order('created_at', { ascending: false })
            
            setMySparks(data || [])
            setLoading(false)
        }

        fetchMySparks()
    }, [user])

    async function handleLogOut() {
        await supabase.auth.signOut()
    }

    async function saveInterests() {
        if (!interestInput.trim()) {
            setEditingInterests(false)
            return
        }

        //Split by comma, trim whitespace, filter empty
        const newInterests = interestInput
            .split(',')
            .map(i => i.trim())
            .filter(Boolean)

        const merged = [...new Set([...(profile?.interests || []), ...newInterests])]
        const { error } = await supabase
            .from('profiles')
            .update({ interests: merged})
            .eq('id', user.id)

        if (error) {
            console.error('Interest update error:', error.message)
            alert('Could not save interests: ' + error.message)
            return
        }
        await fetchProfile(user.id)
        setInterestInput('')
        setEditingInterests(false)
    }

    async function removeInterest(interest) {
        const updated = (profile?.interests || []).filter(i => i !== interest)
        const { error } = await supabase
            .from('profiles')
            .update({ interests: updated })
            .eq('id', user.id)

        if (error) { console.error(error.message); return }
        await fetchProfile(user.id)
    }

    const formatCount = n => n>= 1000 ? `${(n / 1000).toFixed(1)}k` : n

    if (!profile) return (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#5A4F45'}}>
            <p style={{ fontFamily: 'serif', fontSize: '18px'}}>Loading your profile...</p>
        </div>
    )

    return (
        <div className={pageStyles.page}>
            {/* Profile Hero */}
            <div className={styles.hero}>
                <div className={styles.heroTop}>
                    <Avatar username={profile.username} size={72} />
                    <button className={styles.logoutBtn} onClick={handleLogOut}>
                        Sign Out
                    </button>
                </div>

                <p className={styles.name}>{profile.username}</p>
                <p className={styles.handle}>@{profile.username}</p>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <p className={styles.statNum}>{mySparks.length}</p>
                        <p className={styles.statLabel}>Sparks</p>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.stat}>
                        <p className={styles.statNum}>{formatCount(profile.visitors_count || 0)}</p>
                        <p className={styles.statLabel}>Visitors</p>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.stat}>
                        <p className={styles.statNum}>{profile.connects_count || 0}</p>
                        <p className={styles.statLabel}>Connects</p>
                    </div>
                </div>
            </div>

            {/* Interests */}
            <p className={pageStyles.sectionLabel}>INTERESTS</p>
            <div className={styles.interestWrap}>
                {(profile.interests || []).map(interest => (
                    <div key={interest} className={styles.interestTag}>
                        <span>{interest}</span>
                        <button className={styles.removeInterest} onClick={() => removeInterest(interest)}>
                            X
                        </button>
                    </div>
                ))}

                {editingInterests ? (
                    <div className={styles.interestInputRow}>
                        <input
                            className={styles.interestInput}
                            placeholder="e.g. Virology, Robotics"
                            value={interestInput}
                            onChange={e => setInterestInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveInterests()}
                            autoFocus
                        />
                        <button className={styles.saveBtn} onClick={saveInterests}>Save</button>
                        <button className={styles.cancelBtn} onClick={() => setEditingInterests(false)}>Cancel</button>
                    </div>
                ) : (
                    <button className={styles.addInterestBtn} onClick={() => setEditingInterests(true)}>
                        + Add
                    </button>
                )}
            </div>

            {/* My Sparks */}
            <p className={pageStyles.sectionLabel}>YOUR SPARKS</p>

            {loading ? (
                <p className={pageStyles.loading}>Loading your Sparks...</p>
            ) : mySparks.length === 0 ? (
                <div className={styles.empty}>
                    <p className={styles.emptyTitle}>Your Sparks haven't reached us yet!</p>
                    <p className={styles.emptyHint}>Let your Spark Ignite!</p>
                </div>
            ): (
                mySparks.map(spark => <SparkCard key={spark.id} spark={spark} />)
            )}

            <Navbar />
        </div>
    )
}