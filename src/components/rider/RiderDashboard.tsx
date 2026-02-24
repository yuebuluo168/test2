import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  LogOut, 
  ClipboardList, 
  Truck, 
  UserCircle, 
  Store, 
  MapPin,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Order } from '../../types';
import { AuthContext, SocketContext } from '../../App';
import MapView from '../common/MapView';

/**
 * 异常上报弹窗
 */
const ReportModal = ({ orderId, onClose }: { orderId: number, onClose: () => void }) => {
  const [type, setType] = useState('制作中');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    // 实际开发中应调用 /api/reports/create
    alert('上报成功，平台正在核实。请保持电话畅通。');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-6 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl"
      >
        <h2 className="text-xl font-bold text-slate-800">异常情况上报</h2>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">异常类型</label>
          <select 
            className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            {['制作中', '虚假出餐', '商家未开门', '错拿餐点', '交通意外', '个人原因'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">情况说明</label>
          <textarea 
            placeholder="请详细描述您遇到的问题，以便平台快速核实..." 
            className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none h-32 focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>
        <div className="flex gap-4 pt-2">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">取消</button>
          <button onClick={handleSubmit} className="flex-1 py-4 rounded-2xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">提交上报</button>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * 订单详情页面
 */
const OrderDetail = ({ order, onBack }: { order: Order, onBack: () => void }) => {
  const [showReport, setShowReport] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 模拟30分钟倒计时

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
      {/* 顶部栏 */}
      <header className="p-4 bg-white border-b flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
          <ArrowRight className="rotate-180" size={20} />
        </button>
        <h2 className="font-bold text-slate-800">订单详情</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* 倒计时卡片 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">剩余配送时间</div>
          <div className={`text-5xl font-mono font-bold tracking-tighter ${timeLeft < 300 ? 'text-red-500' : 'text-indigo-600'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* 配送地址信息 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <h3 className="font-bold text-slate-800">配送路径</h3>
            <span className="text-indigo-600 font-bold text-xl">¥{order.price}</span>
          </div>
          <div className="space-y-6 relative">
            {/* 垂直连接线 */}
            <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-slate-100" />
            
            <div className="flex gap-4 relative z-10">
              <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-lg shadow-emerald-100">取</div>
              <div>
                <div className="font-bold text-slate-800">{order.merchant_name}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">{order.merchant_address}</div>
              </div>
            </div>
            
            <div className="flex gap-4 relative z-10">
              <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-lg shadow-amber-100">送</div>
              <div>
                <div className="font-bold text-slate-800">{order.customer_name}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">{order.destination_address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 地图展示 */}
        <div className="h-72 rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <MapView riderLocation={{ lat: 39.91, lng: 116.4 }} />
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex gap-3">
        <button onClick={() => setShowReport(true)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">异常上报</button>
        <button className="flex-[2] py-4 rounded-2xl font-bold bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all">确认送达</button>
      </div>

      {showReport && <ReportModal orderId={order.id} onClose={() => setShowReport(false)} />}
    </div>
  );
};

/**
 * 骑手主仪表盘
 */
const RiderDashboard = () => {
  const [activeTab, setActiveTab] = useState<'hall' | 'my' | 'profile'>('hall');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const socket = useContext(SocketContext);
  const auth = useContext(AuthContext);

  // 初始化加载订单并监听实时更新
  useEffect(() => {
    fetch('/api/orders/hall').then(res => res.json()).then(setOrders);
    
    if (socket) {
      // 监听新订单推送
      socket.on('order:new', (order) => setOrders(prev => [order, ...prev]));
      // 监听订单状态变更
      socket.on('order:updated', (updatedOrder) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      });
      return () => {
        socket.off('order:new');
        socket.off('order:updated');
      };
    }
  }, [socket]);

  /**
   * 抢单逻辑
   */
  const acceptOrder = (orderId: number) => {
    socket?.emit('order:accept', { orderId, riderId: auth?.user?.id });
    alert('抢单成功！请尽快前往商家取餐。');
    setActiveTab('my');
  };

  // 如果进入了订单详情页，渲染详情组件
  if (selectedOrder) return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 顶部状态栏 */}
      <header className="bg-white p-4 sticky top-0 z-10 border-b border-slate-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold italic">A</div>
          <h1 className="text-lg font-bold text-slate-800">骑手工作台</h1>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors relative">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button onClick={auth?.logout} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* 任务大厅视图 */}
        {activeTab === 'hall' && (
          <div className="space-y-4">
            <div className="h-52 shadow-sm">
              <MapView />
            </div>
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800">待接订单 ({orders.filter(o => o.status === 'pending').length})</h2>
              <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">刷新列表</button>
            </div>
            {orders.filter(o => o.status === 'pending' || o.status === 'transferring').map(order => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">单号: {order.order_number}</div>
                    <div className="font-bold text-2xl text-indigo-600 mt-1">¥{order.price}</div>
                  </div>
                  <div className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-slate-100">
                    {order.distance}km · {order.weight}kg
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="font-bold text-sm text-slate-700">{order.merchant_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-sm text-slate-500 font-medium">{order.destination_address}</span>
                  </div>
                </div>
                <button 
                  onClick={() => acceptOrder(order.id)}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                >
                  立即抢单
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* 配送中视图 */}
        {activeTab === 'my' && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-slate-800">正在配送</h2>
            {orders.filter(o => o.rider_id === auth?.user?.id && o.status !== 'delivered').map(order => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4 cursor-pointer hover:border-indigo-200 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">配送中</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-bold">{order.order_number}</span>
                </div>
                <div className="font-bold text-slate-800 text-lg leading-tight">{order.destination_address}</div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Truck size={14} />
                    <span>预计 12:30 送达</span>
                  </div>
                  <span className="font-bold text-indigo-600">¥{order.price}</span>
                </div>
              </div>
            ))}
            {orders.filter(o => o.rider_id === auth?.user?.id && o.status !== 'delivered').length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <ClipboardList size={48} className="opacity-20 mb-4" />
                <p className="text-sm font-medium">暂无配送中的订单，去大厅看看吧</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-3 flex justify-around items-center z-20">
        <button onClick={() => setActiveTab('hall')} className={`flex flex-col items-center transition-all ${activeTab === 'hall' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
          <ClipboardList size={24} />
          <span className="text-[10px] font-bold mt-1">任务大厅</span>
        </button>
        <button onClick={() => setActiveTab('my')} className={`flex flex-col items-center transition-all ${activeTab === 'my' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
          <Truck size={24} />
          <span className="text-[10px] font-bold mt-1">配送中</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center transition-all ${activeTab === 'profile' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
          <UserCircle size={24} />
          <span className="text-[10px] font-bold mt-1">个人中心</span>
        </button>
      </nav>
    </div>
  );
};

export default RiderDashboard;
