import React, { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = user !== null

  useEffect(() => {
    const checkAuth = async () => {
      const { accessToken } = authService.getStoredTokens()
      
      if (accessToken) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Failed to fetch user on mount:', error)
          // If user profile fetch failed, try to refresh the token
          try {
            console.log('Attempting to refresh token...')
            const newAccessToken = await authService.refreshToken()
            // Try to fetch user again with new token
            const userData = await authService.getCurrentUser()
            setUser(userData)
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            // Only clear tokens if refresh also fails
            authService.clearStoredTokens()
          }
        }
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email, password, rememberMe = false) => {
    try {
      const userData = await authService.login(email, password, rememberMe)
      setUser(userData)
      return { success: true, data: userData }
    } catch (error) {
      return { success: false, error }
    }
  }

  const register = async (email, username, password) => {
    try {
      const userData = await authService.register(email, username, password)
      setUser(userData)
      return { success: true, data: userData }
    } catch (error) {
      return { success: false, error }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      // Clear all stored tokens and user data
      authService.clearStoredTokens()
      // Redirect to login after clearing state
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
    }
  }

  const refreshAccessToken = async () => {
    try {
      const newAccessToken = await authService.refreshToken()
      return newAccessToken
    } catch (error) {
      logout()
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    userRole: user?.role || null,
    login,
    register,
    logout,
    refreshAccessToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
