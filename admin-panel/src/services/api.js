import axios from 'axios'
import * as authService from './authService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  isRefreshing = false
  failedQueue = []
}

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config
    if (originalRequest?.url?.includes('/auth/refresh')) return Promise.reject(error)
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          }).catch(err => Promise.reject(err))
      }
      originalRequest._retry = true
      isRefreshing = true
      try {
        return authService.refreshToken().then((token) => {
          api.defaults.headers.common.Authorization = `Bearer ${token}`
          originalRequest.headers.Authorization = `Bearer ${token}`
          processQueue(null, token)
          return api(originalRequest)
        }).catch((err) => {
          processQueue(err, null)
          authService.clearStoredTokens()
          window.location.href = '/login'
          return Promise.reject(err)
        })
      } catch (err) {
        processQueue(err, null)
        return Promise.reject(err)
      }
    }
    return Promise.reject(error)
  }
)

export default api;

// ==================== PROJECTS ====================
export async function fetchProjects() {
  const res = await api.get(`/admin/projects`);
  return res.data;
}

export async function createProject(data) {
  const res = await api.post(`/admin/projects`, data);
  return res.data;
}

export async function updateProject(id, data) {
  const res = await api.put(`/admin/projects/${id}`, data);
  return res.data;
}

export async function deleteProject(id) {
  const res = await api.delete(`/admin/projects/${id}`);
  return res.data;
}

// ==================== FEEDBACK ====================
export async function fetchFeedback() {
  const res = await api.get(`/admin/feedback`);
  return res.data;
}

export async function createFeedback(data) {
  const res = await api.post(`/admin/feedback`, data);
  return res.data;
}

export async function updateFeedback(id, data) {
  const res = await api.patch(`/admin/feedback/${id}`, data);
  return res.data;
}

export async function deleteFeedback(id) {
  const res = await api.delete(`/admin/feedback/${id}`);
  return res.data;
}

// ==================== MESSAGES ====================
export async function fetchMessages() {
  const res = await api.get(`/admin/messages`);
  return res.data;
}

export async function deleteMessage(id) {
  const res = await api.delete(`/admin/messages/${id}`);
  return res.data;
}

// ==================== STATS ====================
export async function fetchStats() {
  const res = await api.get(`/admin/stats`);
  return res.data;
}
// ==================== ANALYTICS ====================
export async function fetchAnalyticsStats() {
  const res = await api.get(`/analytics/stats`);
  return res.data;
}
