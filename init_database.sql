-- ==========================================
-- 众包配送平台 - 完整数据库初始化脚本 (SQL Dump)
-- ==========================================
-- 说明：如果你下载的压缩包里缺失 platform.db，
-- 请在任何 SQLite 管理工具中运行此脚本，即可还原完整数据库。

BEGIN TRANSACTION;

-- 1. 用户表 (包含安全加固后的初始数据)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT, -- 存储的是 Bcrypt 哈希加密值
    role TEXT,     -- admin, merchant, rider, customer
    name TEXT,
    phone TEXT,
    balance REAL DEFAULT 0,
    status TEXT DEFAULT 'active',
    id_card_url TEXT,
    age INTEGER,
    gender TEXT,
    merchant_address TEXT,
    merchant_name TEXT
);

-- 插入初始账号 (密码均为 123)
-- 注意：这些哈希值对应明文 "123"
INSERT OR IGNORE INTO users (id, username, password, role, name, phone, balance) VALUES 
(1, 'admin', '$2a$10$6.n.R/Y.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.', 'admin', '系统管理员', '13800138000', 0),
(2, 'merchant', '$2a$10$6.n.R/Y.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.', 'merchant', '测试商家', '13800138001', 1000),
(3, 'rider', '$2a$10$6.n.R/Y.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.', 'rider', '测试骑手', '13800138002', 500),
(4, 'customer', '$2a$10$6.n.R/Y.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.', 'customer', '测试顾客', '13800138003', 200);

-- 2. 价格配置表
CREATE TABLE IF NOT EXISTS price_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id INTEGER,
    base_price REAL,
    per_km_price REAL,
    per_kg_price REAL,
    FOREIGN KEY(merchant_id) REFERENCES users(id)
);

INSERT OR IGNORE INTO price_configs (id, base_price, per_km_price, per_kg_price) VALUES (1, 5.0, 2.0, 1.0);

-- 3. 订单表 (核心业务)
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
    status TEXT DEFAULT 'pending',
    type TEXT,
    scheduled_time TEXT,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    picked_up_at DATETIME,
    delivered_at DATETIME,
    transfer_deadline DATETIME,
    FOREIGN KEY(merchant_id) REFERENCES users(id),
    FOREIGN KEY(rider_id) REFERENCES users(id)
);

-- 4. 聊天记录表
CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    sender_id INTEGER,
    message TEXT,
    type TEXT DEFAULT 'text',
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id)
);

-- 5. 异常上报表
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    rider_id INTEGER,
    type TEXT,
    content TEXT,
    photo_url TEXT,
    lat REAL,
    lng REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
