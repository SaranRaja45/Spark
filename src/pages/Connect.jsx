import { useEffect, useState, useRef } from "react"
import { supabase } from '../supabase'
import { useAuth } from'../context/AuthContext'
import { formatDistanceToNow } from "date-fns"
import Avatar from '../components/avatar'
import Navbar from '../components/Navbar'
import styles from './Connect.module.css'
import pageStyles from './Page.module.css'

export default function Connect() {
    const { user, profile } = useAuth()
    const [conversations, setConversations] = useState([])
    const [activeConvo, setActiveConvo] = useState(null)
    const [draft, setDraft] = useState('')
    const [loading, setLoading] = useState(true)
    const bottomRef = useRef(null)

    useEffect(() => {
        if (!user) return

        async function fetchConversations() {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
            
            if (!data) { setLoading(false); return }

            const seen = new Map()
            data.forEach(msg => {
                const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
                const otherName = msg.sender_id === user.id ? msg.receiver_username : msg.sender_username
                if (!seen.has(otherId)) {
                    seen.set(otherId, { otherId, otherName, lastMsg: msg})
                }
            })

            setConversations([...seen.values()])
            setLoading(false)
        }

        fetchConversations()
    }, [user])

    //Open a conversation and load its messages
    async function openConvo(otherId, otherName) {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .or(
                `and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),` + `and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`
            )
            .order('created_at', { ascending: true })
        
        setActiveConvo({ otherId, otherName, messages:data || [] })
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }

    //Send a Message
    async function sendMessage() {
        if (!draft.trim() || !activeConvo) return

        const newMsg = {
            sender_id: user.id,
            sender_username: profile.username,
            receiver_id: activeConvo.otherId,
            receiver_username: activeConvo.otherName,
            text: draft.trim(),
        }

        const { data } = await supabase
            .from('messages')
            .insert(newMsg)
            .select()
            .single()

        if (data) {
            setActiveConvo(prev => ({...prev, messages: [...prev.messages, data]}))
            setDraft('')
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth'}), 100)
        }
    }

    //Handle Enter Key to Send
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    //Chat View
    if (activeConvo) {
        return (
            <div className={styles.chatPage}>
                {/* Chat Header */}
                <div className={styles.chatHeader}>
                    <button className={styles.backBtn} onClick={() => setActiveConvo(null)}>
                        ⬅️
                    </button>
                    <Avatar username={activeConvo.otherName} size={34} />
                    <div>
                        <p className={styles.chatName}>@{activeConvo.otherName}</p>
                        <p className={styles.chatSub}>Connected via a Spark</p>
                    </div>
                </div>

                {/* Messages */}
                <div className={styles.messages}>
                    {activeConvo.messages.length === 0 && (
                        <p className={styles.noMessages}>
                            No messages yet. Say what sparked your curiosity.
                        </p>
                    )}
                    {activeConvo.messages.map(msg => {
                        const isOwn = msg.sender_id === user.id
                        return (
                            <div key={msg.id} className={`${styles.bubble} ${isOwn ? styles.bubbleOut : styles.bubbleIn}`}>
                                <p className={styles.bubbleText}>{msg.text}</p>
                                <p className={styles.bubbleTime}>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</p>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input Row */}
                <div className={styles.inputRow}>
                    <textarea className={styles.msgInput} placeholder="Message..." value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown} rows={1} />
                    <button className={styles.sendBtn} onClick={sendMessage} disabled={!draft.trim()}> 🕊️ </button>
                </div>
            </div>
        )
    }

    // Conversation List View
    return (
        <div className={pageStyles.page}>
            <div className={pageStyles.topbar}>
                <p className={pageStyles.title}>Connect</p>
                <p className={pageStyles.sub}>Conversations born from Sparks</p>
            </div>

            {loading ? (
                <p className={pageStyles.loading}>Loading conversations...</p>
            ) : conversations.length === 0 ? (
                <div className={styles.empty}>
                    <p className={styles.emptyTitle}>No Connections yet.</p>
                    <p className={styles.emptyHint}> Post a Spark that won't let you sleep </p>
                </div>
            ) : (
                <div className={styles.list}>
                    {conversations.map(convo => (
                        <button key={convo.otherId} className={styles.dmRow} onClick={() => openConvo(convo.otherId, convo.otherName)}>
                            <Avatar username={convo.otherName} size={46} />
                            <div className={styles.dmInfo}>
                                <p className={styles.dmName}>@{convo.otherName}</p>
                                <p className={styles.dmPreview}>{convo.lastMsg.text}</p>
                            </div>
                            <p className={styles.dmTime}>
                                {formatDistanceToNow(new Date(convo.lastMsg.created_at), { addSuffix: false })}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            <Navbar />
        </div>
    )
}