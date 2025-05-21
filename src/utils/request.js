
import axios from 'axios'
const service = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  timeout: 100000,
  headers: { 'Accept': '*/*', 'Content-Type': 'application/json' }
})

// 请求拦截器
service.interceptors.request.use(config => {
  const token = localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIzNDE3ZjAxNi1hYWQ2LTQyMjgtOGNkMC1mYmU0YzI2NmYyNmEiLCJzdWIiOiJXZWIgQVBJIFBhc3Nwb3J0IiwiYXBwX2lkIjoiMzQxN2YwMTYtYWFkNi00MjI4LThjZDAtZmJlNGMyNjZmMjZhIiwiYXBwX2NvZGUiOiJHZ2pjb0hqd0RwSm9MU21JIiwiZW5kX3VzZXJfaWQiOiJlYWQ0MjE5Ny0yYmE4LTQ4YjMtOTNlNy00M2IwNTQ5NGQ1MDUifQ.PpFnSiNADHmfeexCyoXsoHulCxHE5CQWICRvc9C-Vm0'
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // router.push('/login')
    }
    return Promise.reject(error)
  }
)
export default service
