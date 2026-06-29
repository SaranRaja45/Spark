import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from './avatar'
import styles from './SparkCard.module.css'

/*
export default function SparkCard({ spark }) {
    const { user } = useAuth()
    const [liked, setLiked] = useState(() =>
        Array.isArray(spark.liked_by) && spark.liked_by.includes(user?.id)
    )
    const [likes, setLikes] = useState(spark.likes ?? 0)

    async function handleLike() {
        const newLiked = !liked
        const newLikes = newLiked ? likes + 1 : Math.max(0, likes - 1)
        setLiked(newLiked)
        setLikes(newLikes)

        const updatedLikedBy = newLiked
            ? [...Avatar(spark.liked_by || []), user.id]
            : (spark.liked_by || []).filter(id => id !== user.id)

        await supabase
            .from('sparks')
            .update({ likes: newLikes, liked_by: updatedLikedBy })
            .eq('id', spark.id)

        if (onLikeToggle) onLikeToggle(spark.id, newLiked)
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <Avatar username={spark.username} />
                <span className={styles.username}>@{spark.username}</span>
                <span className={styles.time}>
                    {formatDistanceToNow(new Date(spark.created_at), { addSuffix: true})}
                </span>
            </div>

            <p className={styles.text}>{spark.text}</p>

            <div className={styles.footer}>
                <span className={styles.tag}>{spark.tag}</span>
                <div className={styles.actions}>
                    <button className={`${styles.action} ${liked ? styles.liked : ''}`} onClick={handleLike}>🔥{likes}</button>
                    <button className={styles.action}>💬 {spark.comments}</button>
                </div>
            </div>
        </div>
    )
}
*/
export default function SparkCard({ spark }) {
    const { user, profile } = useAuth()
    const [liked, setLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [msgSent, setMsgSent] = useState(false)

    //Check if the current user already liked this spark
    useEffect(() => {
        async function checkLiked() {
            const { data, count } = await supabase
                .from('likes')
                .select('id, user_id', { count: 'exact' })
                .eq('spark_id', spark.id)
            setLikeCount(true)

            if (user && data) {
                setLiked(data.some(row => row.user_id === user.id))
            }
        }
        checkLiked()
    }, [spark.id, user])

    async function handleLike() {
        if (!user) return

        if (liked) {
            //Unlike
            await supabase
                .from('likes')
                .delete()
                .eq('user_id', user.id)
                .eq('spark_id', spark.id)

            setLiked(false)
            setLikedCount(prev => Math.max(0, prev - 1))
        } else {
            //Like
            await supabase
                .from('likes')
                .insert({ user_id: user.id, spark_id: spark.id })

            setLiked(true)
            setLikedCount(prev => prev + 1)
        }
        supabase
            .from('sparks')
            .update({ likes: liked ? likeCount - 1 : likeCount + 1 })
            .eq('id', spark.id)
    }

    async function handleMessage() {
        if (!user || !profile) return

        if (spark.user_id === user.id) return

        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: user.id,
                sender_username: profile.username,
                receiver_id: spark.user_id,
                receiver_username: spark.username,
                text: `Hi! Your Spark "${spark.text.slice(0,60)}${spark.text.length > 60 ? '...' : ''}" caught my attention! Can we talk about it?`,
            })

        if (!error) setMsgSent(true)
    }

    const isOwnSpark = user?.id === spark.user_id

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <Avatar username={spark.username} />
                <span className={styles.username}>@{spark.username || 'unknown'}</span>
                <span className={styles.time}>
                    {formatDistanceToNow(new Date(spark.created_at), { addSuffix: true })}
                </span>
            </div>

            <p className={styles.text}>{spark.text}</p>

            <div className={styles.footer}>
                <span className={styles.tag}>{spark.tag}</span>
                <div className={styles.actions}>
                    <button className={`${styles.action} ${liked ? styles.liked : ''}`} onClick={handleLike}>🔥 {likeCount} </button>
                    <button className={styles.action}>💬 {spark.comments} </button>
                    {!isOwnSpark && (
                        <button
                            className={`${styles.action} ${msgSent ? styles.msgSent : ''}`}
                            onClick={handleMessage}
                            disabled={msgSent}
                            title="Send a message"
                        >
                            {msgSent ? '✅' : '✉️'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}