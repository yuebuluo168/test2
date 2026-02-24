import { io, Socket } from 'socket.io-client';

/**
 * 实时通信服务单例
 * 用于在整个应用中共享同一个 Socket 连接，避免重复连接浪费资源
 */
let socket: Socket | null = null;

export const getSocket = (userId?: number) => {
  if (!socket && userId) {
    // 初始化连接到后端服务器
    socket = io();
    // 告知服务器当前用户 ID，用于加入私有房间
    socket.emit('join', userId);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
