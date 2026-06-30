import { useState } from "react"
import { supabase } from '../supabase'
import styles from './Login.module.css'

export default function Login() {
    const [isSignup, setIsSignup] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters long...')
            return
        }
        if (password.trim().length < 6) {
            setError('Password must be at least 6 characters long...')
            return
        }
        setLoading(true)

        const dumeEmail = `${username.trim().toLowerCase()}@spark.app`

        if (isSignup) {
            const { data: existing } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username.trim().toLowerCase())
                .single()

            if (existing) {
                setError('UserName Already Exists!')
                setLoading(false)
                return
            }
            
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: dumeEmail,
                password,
            })
            if (signUpError) { setError(signUpError.message); setLoading(false); return }

            await supabase.from('profiles').insert({
                id: data.user.id,
                username: username.toLowerCase(),
            })
        } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: dumeEmail,
                password,
            })
            if (signInError) {
                setError('Incorrect username or password...')
                setLoading(false)
                return
            }
        }
        setLoading(false)
    }
    return (
        <div className={styles.page}>
            <div className={styles.logo}>✨ Spark </div>
            <p className={styles.tagline}>
                A Space for "What if's?" -{'\n'}no evidence required, just curiosity...
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                />
                <div className={styles.passwordWrap}>
                    <input
                        className={styles.input}
                        type={showPassword ? "text" : "password"}
                        placeholder="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "🐵" : "🙈"}
                    </button>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <button className={styles.btn} type="submit" disabled={loading}>
                    {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
                </button>
            </form>

            <button className={styles.toggle} onClick={() => { setIsSignup(!isSignup); setError('') }}>
                {isSignup ? 'Already have an account? Sign in' : "New to Spark? Create account"}
            </button>

            <p className={styles.privacy}>🛡️ No email address needed. Ever!</p>
        </div>
    )
}