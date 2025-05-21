import request from '@/utils/request'

export const upload = (data) => request.post('/files/upload', data)
export const getMessage = (data) => request.post('/chat-messages', data)
