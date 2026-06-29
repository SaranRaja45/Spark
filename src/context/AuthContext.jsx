import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from '../supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(async ({data:{ session }}) => {
            setUser(session?.user ?? null)
            if (session?.user) await fetchProfile(session.user.id)
            setLoading(false)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) fetchProfile(session.user.id)
                else setProfile(null)
            }
        )
        return () => subscription.unsubscribe()
    }, [])
    async function fetchProfile(UserId){
        let { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', UserId)
            .single()
        if (!data) { //If no profile exists yet, create one now
            const { data: authUser } = await supabase.auth.getUser()
            const username = authUser.user.email.split('@')[0]

            const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                    id: UserId,
                    username: username,
                    interests: [],
                    sparks_count: 0,
                    visitors_count: 0,
                    connects_count: 0,
                })
                .select()
                .single()

            data = newProfile
        }
        setProfile(data)
    }
    const value = { user, profile, loading, fetchProfile }

    return(
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    return useContext(AuthContext)
}