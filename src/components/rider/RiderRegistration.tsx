import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Camera, UserCircle, MapPin, Mic, Wifi, Phone, Sparkles } from 'lucide-react';

interface RiderRegistrationProps {
  onBack: () => void;
}

/**
 * 骑手注册组件
 * 核心功能：
 * 1. 三步走注册流程：基础信息 -> 实名认证 -> 权限授权
 * 2. 模拟摄像头拍摄与人脸识别
 * 3. 模拟系统权限申请
 */
const RiderRegistration: React.FC<RiderRegistrationProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState({ idCard: false, face: false });
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    phone: '',
    age: 25,
    gender: '男'
  });

  /**
   * 模拟拍照/识别逻辑
   */
  const handlePhotoClick = (type: 'idCard' | 'face') => {
    alert(`正在启动摄像头进行${type === 'idCard' ? '身份证拍摄' : '人脸识别'}...`);
    setTimeout(() => {
      setPhotos(prev => ({ ...prev, [type]: true }));
      alert(`${type === 'idCard' ? '身份证已确认' : '人脸识别成功'}`);
    }, 1000);
  };

  /**
   * 提交注册信息到后端
   */
  const handleRegister = async () => {
    if (!photos.idCard || !photos.face) {
      alert('请先完成身份证拍摄和人脸识别');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'rider' })
      });
      
      if (res.ok) {
        alert('注册成功！请使用新账号登录。');
        onBack();
      } else {
        const data = await res.json();
        alert(data.error || '注册失败');
      }
    } catch (error) {
      alert('网络异常，请稍后再试');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 space-y-8">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
          <ArrowRight className="rotate-180" size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">骑手入驻</h1>
      </div>

      {/* 进度条 */}
      <div className="flex gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-600' : 'bg-slate-100'}`} />
        ))}
      </div>

      {/* 第一步：基础账号信息 */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">基础信息</h2>
            <p className="text-xs text-slate-400 font-medium">请设置您的登录账号与密码</p>
          </div>
          <div className="space-y-4">
            <input 
              placeholder="设置用户名" 
              className="w-full p-4 rounded-2xl bg-slate-50 border border-transparent focus:border-indigo-500 outline-none transition-all"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
            <input 
              type="password"
              placeholder="设置登录密码" 
              className="w-full p-4 rounded-2xl bg-slate-50 border border-transparent focus:border-indigo-500 outline-none transition-all"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button 
            onClick={() => setStep(2)} 
            disabled={!formData.username || !formData.password}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            下一步
          </button>
        </motion.div>
      )}

      {/* 第二步：实名认证与拍照 */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">实名认证</h2>
            <p className="text-xs text-slate-400 font-medium">根据法律要求，骑手需完成实名认证</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handlePhotoClick('idCard')}
              className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${photos.idCard ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-300'}`}
            >
              {photos.idCard ? <Sparkles size={32} /> : <Camera size={32} />}
              <span className="text-[10px] mt-2 font-bold uppercase tracking-widest">{photos.idCard ? '身份证已上传' : '身份证正面'}</span>
            </button>
            <button 
              onClick={() => handlePhotoClick('face')}
              className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${photos.face ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-300'}`}
            >
              {photos.face ? <Sparkles size={32} /> : <UserCircle size={32} />}
              <span className="text-[10px] mt-2 font-bold uppercase tracking-widest">{photos.face ? '人脸识别成功' : '活体检测'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <input 
              placeholder="真实姓名" 
              className="w-full p-4 rounded-2xl bg-slate-50 border border-transparent focus:border-indigo-500 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <input 
              placeholder="手机号码" 
              className="w-full p-4 rounded-2xl bg-slate-50 border border-transparent focus:border-indigo-500 outline-none transition-all"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <button 
            onClick={() => setStep(3)} 
            disabled={!formData.name || !formData.phone}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            下一步
          </button>
        </motion.div>
      )}

      {/* 第三步：权限授权 */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">权限授权</h2>
            <p className="text-xs text-slate-400 font-medium">请开启以下权限以保证正常接单</p>
          </div>
          <div className="space-y-3">
            {[
              { icon: <MapPin size={18} />, label: '实时地理位置', desc: '用于订单精准分配和地图导航' },
              { icon: <Camera size={18} />, label: '摄像头与相册', desc: '用于取餐、送达时的拍照存证' },
              { icon: <Mic size={18} />, label: '麦克风', desc: '用于与商家/顾客进行语音沟通' },
              { icon: <Wifi size={18} />, label: 'WiFi与蓝牙', desc: '用于辅助室内定位与到店验证' },
              { icon: <Phone size={18} />, label: '拨打电话', desc: '用于紧急情况下直接联系相关方' },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-indigo-600 bg-white p-2 rounded-xl shadow-sm">{p.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-700">{p.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{p.desc}</div>
                </div>
                <div className="w-10 h-6 bg-indigo-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={handleRegister} 
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all"
          >
            完成注册并入驻
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default RiderRegistration;
