import { NavLink } from "react-router-dom"
import styles from './Navbar.module.css'

const links = [
    {to: '/', icon: '🏠', label: 'Home'},
    {to: '/explore', icon: '🧭', label: 'Explore'},
    {to: '/post', icon: '📫', label: 'Post', isPost: true},
    {to: '/connect', icon: '✉️', label: 'Connect'},
    {to: '/profile', icon: '😎', label: 'Profile'},
]

export default function Navbar() {
    return (
        <nav className={styles.nav}>
            {links.map(link => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                        link.isPost ? styles.postBtn
                        : isActive ? `${styles.item} ${styles.active}`
                        : styles.item
                    }
                >
                    <span className={styles.icon}>{link.icon}</span>
                    {!link.isPost && <span className={styles.label}>{link.label}</span>}
                </NavLink>
            ))}
        </nav>
    )
}