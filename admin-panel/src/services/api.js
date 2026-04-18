import axios from 'axios'
import * as authService from './authService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  isRefreshing = false
  failedQueue = []
}

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401/403 responses — attempt token refresh before failing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config

    // Do not retry refresh requests to prevent infinite loops
    if (originalRequest?.url?.includes('/auth/refresh')) return Promise.reject(error)

    const isAuthError =
      error.response?.status === 401 || error.response?.status === 403

    if (isAuthError && !originalRequest?._retry) {
      if (isRefreshing) {
        // Queue the request until the refresh completes
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        ).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      return authService
        .refreshToken()
        .then((token) => {
          api.defaults.headers.common.Authorization = `Bearer ${token}`
          originalRequest.headers.Authorization = `Bearer ${token}`
          processQueue(null, token)
          return api(originalRequest)
        })
        .catch((err) => {
          processQueue(err, null)
          authService.clearStoredTokens()
          if (
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')
          ) {
            window.location.href = '/login'
          }
          return Promise.reject(err)
        })
    }

    return Promise.reject(error)
  }
)

export default api

// ==================== PROJECTS ====================
export const fetchProjects = () => api.get('/admin/projects').then((r) => r.data)
export const createProject = (data) => api.post('/admin/projects', data).then((r) => r.data)
export const updateProject = (id, data) => api.put(`/admin/projects/${id}`, data).then((r) => r.data)
export const deleteProject = (id) => api.delete(`/admin/projects/${id}`).then((r) => r.data)

// ==================== FEEDBACK ====================
export const fetchFeedback = () => api.get('/admin/feedback').then((r) => r.data)
export const createFeedback = (data) => api.post('/admin/feedback', data).then((r) => r.data)
export const updateFeedback = (id, data) => api.patch(`/admin/feedback/${id}`, data).then((r) => r.data)
export const deleteFeedback = (id) => api.delete(`/admin/feedback/${id}`).then((r) => r.data)

// ==================== MESSAGES ====================
export const fetchMessages = () => api.get('/admin/messages').then((r) => r.data)
export const deleteMessage = (id) => api.delete(`/admin/messages/${id}`).then((r) => r.data)

// ==================== STATS ====================
export const fetchStats = () => api.get('/admin/stats').then((r) => r.data)

// ==================== ANALYTICS ====================
export const fetchAnalyticsStats = () => api.get('/analytics/stats').then((r) => r.data)
