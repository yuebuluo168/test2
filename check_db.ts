import Database from 'better-sqlite3';
import fs from 'fs';

try {
    const db = new Database('platform.db');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("当前数据库中的表:", tables.map(t => t.name).join(', '));
    
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    console.log("用户总数:", userCount.count);
    
    db.close();
    
    const stats = fs.statSync('platform.db');
    console.log(`文件 platform.db 存在，大小为: ${stats.size} 字节`);
    
    // 创建一个副本，尝试触发平台的文件刷新
    fs.copyFileSync('platform.db', 'platform_backup.db');
    console.log("已创建 platform_backup.db 副本");
} catch (err) {
    console.error("数据库检查失败:", err.message);
}
