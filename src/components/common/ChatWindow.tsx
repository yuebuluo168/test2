import React, { useState, useEffect, useContext } from 'react';
import { Camera, Mic, Send, X } from 'lucide-react';
import { ChatMessage } from '../../types';
import { AuthContext, SocketContext } from '../../App';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWindowProps {
  orderId: number;
  onClose: () => void;
}

/**
 * 实时聊天窗口组件
 * 核心功能：
 * 1. 实时收发文字消息
 * 2. 模拟语音、照片发送入口
 * 3. 自动滚动到底部
 */
const ChatWindow: React.FC<ChatWindowProps> = ({ orderId, onClose }) => {
  const auth = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // 监听该订单的实时消息
  useEffect(() => {
    if (socket) {
      socket.on(`chat:${orderId}`, (msg) => {
        setMessages(prev => [...prev, msg]);
      });
      return () => { socket.off(`chat:${orderId}`); };
    }
  }, [socket, orderId]);

  // 消息更新时自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /**
   * 发送文字消息
   */
  const sendMessage = () => {
    if (!input.trim()) return;
    socket?.emit('chat:send', { 
      orderId, 
      senderId: auth?.user?.id, 
      message: input, 
      type: 'text' 
    });
    setInput('');
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-white z-[60] flex flex-col"
    >
      {/* 聊天顶部栏 */}
      <header className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageSquare size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm">联系对话</h2>
            <p className="text-[10px] opacity-70">订单号: {orderId}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
      </header>

      {/* 消息展示区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex ${msg.sender_id === auth?.user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-3xl shadow-sm ${
                msg.sender_id === auth?.user?.id 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                <div className="text-sm font-medium leading-relaxed">{msg.message}</div>
                <div className={`text-[9px] mt-2 font-bold uppercase opacity-50 ${
                  msg.sender_id === auth?.user?.id ? 'text-right' : 'text-left'
                }`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t bg-white flex gap-2 items-center pb-8 sm:pb-4">
        <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-2xl">
          <Camera size={20} />
        </button>
        <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-2xl">
          <Mic size={20} />
        </button>
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..." 
          className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
        />
        <button 
          onClick={sendMessage} 
          disabled={!input.trim()}
          className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all"
        >
          <Send size={20} />
        </button>
      </div>
    </motion.div>
  );
};

// 辅助图标
const MessageSquare = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default ChatWindow;
