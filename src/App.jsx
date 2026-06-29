import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Post from './pages/Post'
import Connect from './pages/Connect'
import Profile from './pages/Profile'
import './index.css'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children: <Navigate to="/login" />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
      <Route path="/post" element={<PrivateRoute><Post /></PrivateRoute>} />
      <Route path="/connect" element={<PrivateRoute><Connect /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}