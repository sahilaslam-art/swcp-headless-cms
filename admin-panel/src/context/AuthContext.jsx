import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authService from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = user !== null

  // Restore session from stored access token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { accessToken } = authService.getStoredTokens()
      if (accessToken) {
        try {
          const userData = await authService.getCurrentUser()
          if (userData) setUser(userData)
        } catch {
          // Token is invalid or expired — user will need to log in again
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
      // Call setUser to automatically log the user in after registration
      setUser(userData)
      return { success: true, data: userData }
    } catch (error) {
      return { success: false, error }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      authService.clearStoredTokens()
    }
  }

  const refreshAccessToken = async () => {
    try {
      return await authService.refreshToken()
    } catch (error) {
      await logout()
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
