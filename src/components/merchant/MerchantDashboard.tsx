import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  LogOut, 
  Sparkles, 
  PlusCircle, 
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Order } from '../../types';
import { AuthContext } from '../../App';
import OrderPublishModal from './OrderPublishModal';

/**
 * 商家端主仪表盘
 * 核心功能：
 * 1. 展示账户余额
 * 2. 统计订单状态
 * 3. 发布新订单
 * 4. 查看历史订单
 */
const MerchantDashboard = () => {
  const auth = useContext(AuthContext);
  const [balance] = useState(auth?.user?.balance || 0);
  const [showPublish, setShowPublish] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 space-y-6 pb-20">
      {/* 顶部栏 */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold italic shadow-lg shadow-indigo-100">A</div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-none">商家中心</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{auth?.user?.merchant_name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <CreditCard size={16} className="text-indigo-600" />
            <span className="font-bold text-sm text-slate-700">¥{balance.toFixed(2)}</span>
          </div>
          <button onClick={auth?.logout} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* 快捷操作卡片 */}
      <section className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold tracking-tight">生意兴隆，{auth?.user?.name}</h2>
          <p className="text-indigo-100 text-sm mt-2 opacity-80">今天已有 0 个订单通过平台送达</p>
          <div className="mt-8 flex gap-3">
            <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl text-sm font-bold transition-all backdrop-blur-md">
              余额充值
            </button>
            <button 
              onClick={() => setShowPublish(true)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl flex items-center gap-2 active:scale-95"
            >
              <PlusCircle size={18} />
              发布新单
            </button>
          </div>
        </div>
        {/* 背景装饰图标 */}
        <Sparkles className="absolute -right-8 -bottom-8 text-white/10 w-48 h-48 rotate-12" />
      </section>

      {/* 核心数据统计 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">待接单</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">0</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">已送达</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">0</div>
        </div>
      </div>

      {/* 最近订单列表 */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold text-lg text-slate-800">实时动态</h3>
          <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
            查看历史 <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
              <Clock size={32} className="opacity-20 mb-2" />
              <p className="text-xs font-medium">暂无活跃订单</p>
            </div>
          ) : (
            orders.map(order => (
              <motion.div 
                key={order.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-800">{order.customer_name}</div>
                  <div className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{order.destination_address}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-600">¥{order.price.toFixed(2)}</div>
                  <div className="text-[8px] text-slate-300 font-bold uppercase mt-1 px-2 py-0.5 bg-slate-50 rounded-full inline-block">
                    {order.status === 'pending' ? '等待接单' : '配送中'}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* 发布弹窗组件 */}
      {showPublish && (
        <OrderPublishModal 
          onClose={() => setShowPublish(false)} 
          onSuccess={(o) => setOrders([o, ...orders])} 
        />
      )}
    </div>
  );
};

export default MerchantDashboard;
