import api from './api'

const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.response?.data?.errors) {
    const errors = error.response.data.errors
    if (Array.isArray(errors)) {
      return errors.map((err) => (typeof err === 'string' ? err : err.message || err)).join(', ')
    } else if (typeof errors === 'object') {
      return Object.values(errors).join(', ')
    }
    return String(errors)
  }

  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your connection.'
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.'
  }
  if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection.'
  }

  return error.message || 'An unexpected error occurred. Please try again.'
}

export const register = async (email, username, password) => {
  try {
    const response = await api.post('/auth/register', { email, username, password })
    if (response.data.success) {
      // Save tokens so the session is established immediately
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken)
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      return response.data.data
    }
    throw new Error(response.data.message || 'Registration failed')
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const login = async (email, password, rememberMe = false) => {
  try {
    const response = await api.post('/auth/login', { email, password, rememberMe })
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken)
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      return response.data.data
    }
    throw new Error(response.data.message || 'Login failed')
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const logout = async () => {
  try {
    await api.post('/auth/logout')
  } catch {
    // Fail silently — we will still clear local state
  } finally {
    clearStoredTokens()
  }
}

export const refreshToken = async () => {
  try {
    const storedRefreshToken = localStorage.getItem('refreshToken')

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
      // Cookie-based refresh failed — try localStorage fallback
      if (storedRefreshToken && error.response?.status !== 200) {
        const response = await api.post('/auth/refresh', { refreshToken: storedRefreshToken })
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
  const { accessToken } = getStoredTokens()
  if (!accessToken) {
    throw new Error('No access token found')
  }
  const response = await api.get('/user/profile')
  return response.data.data
}

export const getStoredTokens = () => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
})

export const clearStoredTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email })
    if (response.data.success) {
      return response.data
    }
    throw new Error(response.data.message || 'Failed to send reset email')
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, { password })
    if (response.data.success) {
      clearStoredTokens()
      return response.data
    }
    throw new Error(response.data.message || 'Failed to reset password')
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
