import api from './api'
import * as toast from '../utils/toast'

// Note: Toast utilities are imported from utils for use in services
// Components should prefer using useToast context hook
const getErrorMessage = (error) => {
  // If there's a response from the server, use it
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  
  // Normalize array errors to a readable string
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors
    if (Array.isArray(errors)) {
      return errors.map(err => typeof err === 'string' ? err : err.message || err).join(', ')
    } else if (typeof errors === 'object') {
      return Object.values(errors).join(', ')
    }
    return String(errors)
  }
  
  // Handle different error types
  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check if the backend is running on port 5000.'
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.'
  }
  
  if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection and ensure the backend is running.'
  }
  
  if (error.message) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}

export const register = async (email, username, password) => {
  try {
    const response = await api.post('/auth/register', {
      email,
      username,
      password,
    })
    
    if (response.data.success) {
      toast.showSuccess('Registration successful! Please login.')
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Registration failed')
  } catch (error) {
    const errorMsg = getErrorMessage(error)
    toast.showError(errorMsg)
    throw errorMsg
  }
}

export const login = async (email, password, rememberMe = false) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
      rememberMe,
    })
    
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken)
      // Also store refresh token in localStorage as fallback for browsers that don't support httpOnly cookies
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      toast.showSuccess('Welcome back!')
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Login failed')
  } catch (error) {
    const errorMsg = getErrorMessage(error)
    toast.showError(errorMsg)
    throw errorMsg
  }
}

export const logout = async () => {
  try {
    await api.post('/auth/logout')
    toast.showInfo('Logged out successfully')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    clearStoredTokens()
  }
}

export const refreshToken = async () => {
  try {
    const storedRefreshToken = localStorage.getItem('refreshToken')
    
    // Try with cookie first, if it fails, use localStorage refresh token
    try {
      const response = await api.post('/auth/refresh')
      
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken)
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }
        return response.data.accessToken
      }
    } catch (error) {
      // If cookie-based refresh fails and we have a localStorage token, try sending it
      if (storedRefreshToken && error.response?.status !== 200) {
        const response = await api.post('/auth/refresh', {
          refreshToken: storedRefreshToken,
        })
        
        if (response.data.success) {
          localStorage.setItem('accessToken', response.data.accessToken)
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken)
          }
          return response.data.accessToken
        }
      }
      throw error
    }
    
    throw new Error('Token refresh failed')
  } catch (error) {
    clearStoredTokens()
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const { accessToken } = getStoredTokens()
    if (!accessToken) {
      throw new Error('No access token found')
    }
    
    const response = await api.get('/user/profile')
    return response.data.data
  } catch (error) {
    const errorMsg = getErrorMessage(error)
    console.error('getCurrentUser error:', errorMsg)
    throw errorMsg
  }
}

export const getStoredTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }
}

export const clearStoredTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', {
      email,
    })

    if (response.data.success) {
      toast.showSuccess('Reset email sent successfully!')
      return response.data
    }

    throw new Error(response.data.message || 'Failed to send reset email')
  } catch (error) {
    const errorMsg = getErrorMessage(error)
    toast.showError(errorMsg)
    throw errorMsg
  }
}

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
    })

    if (response.data.success) {
      clearStoredTokens()
      toast.showSuccess('Password reset successfully!')
      return response.data
    }

    throw new Error(response.data.message || 'Failed to reset password')
  } catch (error) {
    const errorMsg = getErrorMessage(error)
    toast.showError(errorMsg)
    throw errorMsg
  }
}
