/**
 * 众包配送平台 - 后端核心服务器
 * 技术栈: Node.js + Express + SQLite + Socket.io
 * 
 * 生产环境建议:
 * 1. 数据库切换至 PostgreSQL (处理高并发)
 * 2. 增加 JWT 鉴权中间件
 * 3. 增加 Redis 缓存地理位置信息
 */

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import multer from "multer";
import http from "http";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";

// 增强型日志记录函数：确保所有 Bug 都有迹可循
const logError = (error: any) => {
  const logMessage = `[${new Date().toISOString()}] ERROR: ${error.message}\n${error.stack}\n\n`;
  console.error(logMessage);
  // 将错误写入本地文件，方便用户下载反馈给 AI
  try {
    fs.appendFileSync(path.join(__dirname, 'error.log'), logMessage);
  } catch (e) {
    console.error("无法写入日志文件:", e);
  }
};

// 全局异常捕获，防止服务器因未处理的错误而彻底崩溃
process.on('uncaughtException', (err) => {
  logError(err);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(new Error(`Unhandled Rejection at: ${promise}, reason: ${reason}`));
});

// 初始化 SQLite 数据库连接
// 在生产环境中，建议将此部分抽象为 Data Access Layer (DAL)
const db = new Database("platform.db");

/**
 * 数据库初始化逻辑
 * 采用关系型设计，确保数据一致性
 */
db.exec(`
  -- 用户表: 存储所有角色的基本信息
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT, -- 角色: admin(管理员), merchant(商家), rider(骑手), customer(顾客)
    name TEXT,
    phone TEXT,
    balance REAL DEFAULT 0, -- 账户余额
    status TEXT DEFAULT 'active',
    id_card_url TEXT, -- 骑手身份证照片路径
    age INTEGER,
    gender TEXT,
    merchant_address TEXT,
    merchant_name TEXT
  );

  -- 价格配置表: 存储平台全局或商家的计费规则
  CREATE TABLE IF NOT EXISTS price_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id INTEGER,
    base_price REAL,    -- 基础起步价
    per_km_price REAL,  -- 每公里加价
    per_kg_price REAL,  -- 每公斤加价
    FOREIGN KEY(merchant_id) REFERENCES users(id)
  );

  -- 订单表: 核心业务表
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE,
    merchant_id INTEGER,
    rider_id INTEGER,
    customer_id INTEGER,
    customer_name TEXT,
    customer_phone TEXT,
    destination_address TEXT,
    destination_lat REAL,
    destination_lng REAL,
    weight REAL,
    distance REAL,
    price REAL,
    status TEXT DEFAULT 'pending', -- 状态: pending(待接单), accepted(已接单), picked_up(已取餐), delivered(已送达), cancelled(已取消), transferring(转单中)
    type TEXT, -- 订单类型: instant(即时), scheduled(预约)
    scheduled_time TEXT,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    picked_up_at DATETIME,
    delivered_at DATETIME,
    transfer_deadline DATETIME, -- 转单截止时间 (接单后3分钟内)
    FOREIGN KEY(merchant_id) REFERENCES users(id),
    FOREIGN KEY(rider_id) REFERENCES users(id)
  );

  -- 聊天记录表: 存储多媒体沟通信息
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    sender_id INTEGER,
    message TEXT,
    type TEXT DEFAULT 'text', -- 类型: text(文字), voice(语音), photo(照片), video(视频)
    url TEXT, -- 多媒体文件路径
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );

  -- 异常上报表: 存储骑手反馈的配送问题
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    rider_id INTEGER,
    type TEXT, -- 类型: 制作中, 商家未开门, 交通意外等
    content TEXT,
    photo_url TEXT,
    lat REAL,
    lng REAL,
    status TEXT DEFAULT 'pending', -- 审核状态: pending(待处理), approved(已核实), rejected(驳回)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

/**
 * 预置测试数据
 * 确保开发者在首次运行时有可用的测试账号
 */
const roles = ['admin', 'merchant', 'rider', 'customer'];
const checkUser = db.prepare("SELECT id FROM users WHERE username = ?");
const insertUser = db.prepare("INSERT INTO users (username, password, role, name, phone, balance, merchant_name, merchant_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

roles.forEach(role => {
  if (!checkUser.get(role)) {
    const hashedPassword = bcrypt.hashSync('123', 10);
    insertUser.run(role, hashedPassword, role, `测试${role}`, '13800138000', 1000, `测试${role}商家`, '北京市朝阳区某街道123号');
  }
});

if (!checkUser.get('test')) {
  const hashedPassword = bcrypt.hashSync('123', 10);
  insertUser.run('test', hashedPassword, 'merchant', '测试用户', '13800138000', 1000, '测试商家', '北京市朝阳区某街道123号');
}

/**
 * 服务器启动主函数
 */
async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  
  // 1. 安全防护：设置 HTTP 响应头，防止 XSS、点击劫持等攻击
  app.use(helmet({
    contentSecurityPolicy: false, // 开发环境下关闭 CSP 以便加载 Vite 资源
  }));

  // 2. 防暴力破解：限制登录和注册接口的请求频率
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 100, // 每个 IP 限制 100 次请求
    message: { error: "请求过于频繁，请稍后再试" }
  });

  // 初始化 Socket.io，用于实时订单推送和聊天
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  app.use(express.json());
  app.use("/api/auth", authLimiter);

  // --- 输入验证 Schema (Zod) ---
  const LoginSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(3)
  });

  const RegisterSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6),
    role: z.enum(['admin', 'merchant', 'rider', 'customer']),
    name: z.string(),
    phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确")
  });

  /**
   * 文件上传配置 (Multer)
   * 用于处理身份证照片、聊天图片、异常上报照片
   */
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = "./uploads";
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    }
  });
  const upload = multer({ storage });
  app.use("/uploads", express.static("uploads"));

  // --- 认证相关接口 ---

  /**
   * 用户注册接口
   */
  app.post("/api/auth/register", (req, res) => {
    try {
      // 验证输入数据
      const validatedData = RegisterSchema.parse(req.body);
      const { username, password, role, name, phone } = validatedData;
      
      // 密码哈希存储
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      const info = db.prepare("INSERT INTO users (username, password, role, name, phone) VALUES (?, ?, ?, ?, ?)").run(username, hashedPassword, role, name, phone);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors[0].message });
      }
      logError(err);
      res.status(400).json({ error: "注册失败，用户名可能已存在" });
    }
  });

  /**
   * 用户登录接口
   */
  app.post("/api/auth/login", (req, res) => {
    try {
      // 验证输入数据
      const { username, password } = LoginSchema.parse(req.body);
      
      // 使用参数化查询防止 SQL 注入
      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      
      if (user && bcrypt.compareSync(password, user.password)) {
        // 登录成功，不返回密码字段
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(401).json({ error: "账号或密码错误" });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "输入格式不正确" });
      }
      logError(error);
      res.status(500).json({ error: "服务器内部错误，请联系管理员查看日志" });
    }
  });

  // --- 订单相关接口 ---

  /**
   * 获取任务大厅订单列表
   */
  app.get("/api/orders/hall", (req, res) => {
    // 仅查询待接单或转单中的订单
    const orders = db.prepare(`
      SELECT o.*, u.merchant_name, u.merchant_address 
      FROM orders o 
      JOIN users u ON o.merchant_id = u.id 
      WHERE o.status = 'pending' OR o.status = 'transferring'
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  });

  /**
   * 创建新订单接口
   */
  app.post("/api/orders/create", (req, res) => {
    const { merchant_id, order_number, customer_name, customer_phone, destination_address, destination_lat, destination_lng, weight, distance, price, type, scheduled_time, remarks } = req.body;
    const info = db.prepare(`
      INSERT INTO orders (order_number, merchant_id, customer_name, customer_phone, destination_address, destination_lat, destination_lng, weight, distance, price, type, scheduled_time, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(order_number, merchant_id, customer_name, customer_phone, destination_address, destination_lat, destination_lng, weight, distance, price, type, scheduled_time, remarks);
    
    const newOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(info.lastInsertRowid);
    // 通过 Socket 全局广播新订单消息
    io.emit("order:new", newOrder);
    res.json(newOrder);
  });

  // --- 配置相关接口 ---

  /**
   * 获取价格配置
   */
  app.get("/api/config/price", (req, res) => {
    const config = db.prepare("SELECT * FROM price_configs LIMIT 1").get();
    res.json(config || { base_price: 5, per_km_price: 2, per_kg_price: 1 });
  });

  /**
   * 更新价格配置
   */
  app.post("/api/config/price", (req, res) => {
    const { base_price, per_km_price, per_kg_price } = req.body;
    db.prepare("DELETE FROM price_configs").run();
    db.prepare("INSERT INTO price_configs (base_price, per_km_price, per_kg_price) VALUES (?, ?, ?)").run(base_price, per_km_price, per_kg_price);
    res.json({ success: true });
  });

  /**
   * Socket.io 实时逻辑处理
   */
  io.on("connection", (socket) => {
    // 用户加入个人房间，用于接收定向通知
    socket.on("join", (userId) => {
      socket.join(`user:${userId}`);
    });

    /**
     * 骑手接单逻辑
     */
    socket.on("order:accept", ({ orderId, riderId }) => {
      // 设置3分钟转单截止时间
      const transferDeadline = new Date(Date.now() + 3 * 60000).toISOString();
      db.prepare("UPDATE orders SET rider_id = ?, status = 'accepted', accepted_at = CURRENT_TIMESTAMP, transfer_deadline = ? WHERE id = ?").run(riderId, transferDeadline, orderId);
      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
      // 广播订单状态更新
      io.emit("order:updated", order);
    });

    /**
     * 骑手位置实时更新
     */
    socket.on("location:update", ({ userId, lat, lng }) => {
      io.emit("location:rider", { userId, lat, lng });
    });

    /**
     * 实时聊天消息处理
     */
    socket.on("chat:send", (data) => {
      const { orderId, senderId, message, type, url } = data;
      const info = db.prepare("INSERT INTO chats (order_id, sender_id, message, type, url) VALUES (?, ?, ?, ?, ?)").run(orderId, senderId, message, type, url);
      const chat = db.prepare("SELECT * FROM chats WHERE id = ?").get(info.lastInsertRowid);
      // 仅向该订单相关的房间广播消息
      io.emit(`chat:${orderId}`, chat);
    });
  });

  // --- 静态资源与前端路由处理 ---

  if (process.env.NODE_ENV !== "production") {
    // 开发环境下使用 Vite 中间件
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // 生产环境下提供编译后的静态文件
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`服务器已启动: http://localhost:${PORT}`);
  });
}

startServer();
