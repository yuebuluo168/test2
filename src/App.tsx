/**
 * 众包配送平台 - 前端入口文件
 * 技术栈: React 19 + Tailwind CSS + Framer Motion
 * 
 * 架构设计:
 * 1. 采用 Context API 管理全局状态 (认证、Socket)
 * 2. 角色路由分发: 根据用户角色动态渲染不同的工作台
 * 3. 移动端优先: 所有的 UI 组件均针对手机端进行了优化
 */

import React, { useState, useEffect, createContext } from 'react';
import { AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { User as UserType } from './types';

// 导入拆分后的业务组件
import Login from './components/auth/Login';
import RiderDashboard from './components/rider/RiderDashboard';
import MerchantDashboard from './components/merchant/MerchantDashboard';
import CustomerDashboard from './components/customer/CustomerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

/**
 * 全局认证上下文
 * 存储当前登录用户信息及登录/退出方法
 */
export const AuthContext = createContext<{
  user: UserType | null;
  login: (user: UserType) => void;
  logout: () => void;
} | null>(null);

/**
 * 全局 Socket 上下文
 * 确保整个应用生命周期内只维护一个实时通信连接
 */
export const SocketContext = createContext<Socket | null>(null);

export default function App() {
  // 核心状态: 当前登录用户
  const [user, setUser] = useState<UserType | null>(null);
  // 核心状态: Socket 实例
  const [socket, setSocket] = useState<Socket | null>(null);

  /**
   * 监听用户登录状态
   * 当用户登录成功时，初始化 Socket 连接并加入私有房间
   */
  useEffect(() => {
    if (user) {
      const newSocket = io();
      // 告知服务器用户 ID，以便接收定向推送（如：你的订单被接了）
      newSocket.emit('join', user.id);
      setSocket(newSocket);
      
      // 组件卸载或用户退出时，断开连接
      return () => { newSocket.close(); };
    }
  }, [user]);

  // 登录回调
  const login = (u: UserType) => setUser(u);
  
  // 退出登录回调
  const logout = () => {
    setUser(null);
    setSocket(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <SocketContext.Provider value={socket}>
        {/* 路由分发逻辑 */}
        {!user ? (
          // 未登录展示登录/注册页
          <Login />
        ) : (
          // 已登录根据角色展示对应的工作台
          <AnimatePresence mode="wait">
            {user.role === 'rider' && <RiderDashboard />}
            {user.role === 'merchant' && <MerchantDashboard />}
            {user.role === 'customer' && <CustomerDashboard />}
            {user.role === 'admin' && <AdminDashboard />}
          </AnimatePresence>
        )}
      </SocketContext.Provider>
    </AuthContext.Provider>
  );
}
