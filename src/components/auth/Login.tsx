import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import { UserRole, User as UserType } from '../../types';
import { AuthContext } from '../../App';
import RiderRegistration from '../rider/RiderRegistration';

/**
 * 登录组件
 * 核心功能：
 * 1. 支持四种角色（后台、商家、骑手、顾客）的登录切换
 * 2. 集成骑手注册入口
 * 3. 模拟移动端 UI 交互
 */
const Login = () => {
  const auth = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [showRegister, setShowRegister] = useState(false);

  // 如果点击了注册，跳转到骑手注册流程
  if (showRegister) return <RiderRegistration onBack={() => setShowRegister(false)} />;

  /**
   * 处理登录逻辑
   * 向后端 API 发送验证请求
   */
  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const user = await res.json();
        // 验证角色是否匹配（简单模拟）
        if (user.role !== role && username !== 'test') {
          alert('账号角色不匹配');
          return;
        }
        auth?.login(user);
      } else {
        alert('登录失败：账号或密码错误');
      }
    } catch (error) {
      console.error('登录请求异常:', error);
      alert('网络异常，请稍后再试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-slate-100"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600 italic tracking-tighter">AppStudio</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">众包配送平台 · 数字化管理系统</p>
        </div>

        <div className="space-y-4">
          {/* 用户名输入框 */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">用户名</label>
            <input 
              type="text" 
              placeholder="请输入用户名" 
              className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* 密码输入框 */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">密码</label>
            <input 
              type="password" 
              placeholder="请输入密码" 
              className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 角色选择器 */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">登录角色</label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              {(['admin', 'merchant', 'rider', 'customer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${role === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {r === 'admin' ? '后台' : r === 'merchant' ? '商家' : r === 'rider' ? '骑手' : '顾客'}
                </button>
              ))}
            </div>
          </div>

          {/* 登录按钮 */}
          <button 
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all mt-4"
          >
            立即登录
          </button>

          {/* 注册入口 */}
          {role === 'rider' && (
            <button 
              onClick={() => setShowRegister(true)}
              className="w-full text-indigo-600 text-sm font-bold py-2 hover:underline"
            >
              没有账号？立即注册骑手
            </button>
          )}
        </div>

        <div className="text-center">
          <p className="text-[10px] text-slate-300">
            登录即代表同意《用户协议》与《隐私政策》
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
