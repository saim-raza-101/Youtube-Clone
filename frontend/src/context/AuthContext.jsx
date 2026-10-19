import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

const clearAuthStorage = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [guestMode, setGuestMode] = useState(false)
  const enterGuestMode = useCallback(() => setGuestMode(true), [])
  const exitGuestMode = useCallback(() => setGuestMode(false), [])

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/users/current-user')
          setUser(response.data.data)
          setError(null)
          // #region agent log
          fetch('http://127.0.0.1:7378/ingest/242d3439-a918-4039-9cd4-63be8c550d3c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'192050'},body:JSON.stringify({sessionId:'192050',runId:'post-fix',hypothesisId:'F',location:'AuthContext.jsx:checkAuth',message:'checkAuth success',data:{hasUser:Boolean(response.data?.data),username:response.data?.data?.username||null},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        } catch (err) {
          console.error('Auth check failed:', err)
          // #region agent log
          fetch('http://127.0.0.1:7378/ingest/242d3439-a918-4039-9cd4-63be8c550d3c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'192050'},body:JSON.stringify({sessionId:'192050',runId:'post-fix',hypothesisId:'H',location:'AuthContext.jsx:checkAuth',message:'checkAuth failed',data:{status:err.response?.status||null,message:err.message||null},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          setToken(null)
          clearAuthStorage()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const register = useCallback(async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const { accessToken: newToken, user: userData } = response.data.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      exitGuestMode()
      return { success: true, data: userData }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [exitGuestMode])

  const login = useCallback(async (identifier, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/users/login', { identifier, password })
      const { accessToken: newToken, user: userData } = response.data.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      exitGuestMode()
      return { success: true, data: userData }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [exitGuestMode])

  const loginWithToken = useCallback(async (newToken) => {
    if (!newToken) {
      return { success: false, error: 'Missing access token' }
    }

    localStorage.setItem('token', newToken)
    setToken(newToken)
    setLoading(true)
    setError(null)

    try {
      const response = await api.get('/users/current-user')
      setUser(response.data.data)
      exitGuestMode()
      // #region agent log
      fetch('http://127.0.0.1:7378/ingest/242d3439-a918-4039-9cd4-63be8c550d3c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'192050'},body:JSON.stringify({sessionId:'192050',runId:'post-fix',hypothesisId:'F',location:'AuthContext.jsx:loginWithToken',message:'loginWithToken loaded user',data:{username:response.data?.data?.username||null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return { success: true, data: response.data.data }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to sign in with token'
      setError(message)
      setToken(null)
      clearAuthStorage()
      setUser(null)
      // #region agent log
      fetch('http://127.0.0.1:7378/ingest/242d3439-a918-4039-9cd4-63be8c550d3c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'192050'},body:JSON.stringify({sessionId:'192050',runId:'post-fix',hypothesisId:'H',location:'AuthContext.jsx:loginWithToken',message:'loginWithToken failed',data:{status:err.response?.status||null,message},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [exitGuestMode])

  const logout = useCallback(() => {
    clearAuthStorage()
    // #region agent log
    fetch('http://127.0.0.1:7378/ingest/242d3439-a918-4039-9cd4-63be8c550d3c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'192050'},body:JSON.stringify({sessionId:'192050',runId:'post-fix',hypothesisId:'L',location:'AuthContext.jsx:logout',message:'Logout cleared auth storage',data:{hasToken:Boolean(localStorage.getItem('token')),hasRefreshToken:Boolean(localStorage.getItem('refreshToken'))},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setToken(null)
    setUser(null)
    setError(null)
    exitGuestMode()
  }, [exitGuestMode])

  const updateProfile = useCallback(async (updates) => {
    setError(null)
    try {
      const response = await api.post('/users/update-account', updates)
      setUser(response.data.data)
      return { success: true, data: response.data.data }
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const value = {
    user,
    setUser,
    loading,
    error,
    token,
    isAuthenticated: !!token && !!user,
    guestMode,
    enterGuestMode,
    exitGuestMode,
    register,
    login,
    loginWithToken,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
