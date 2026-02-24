package com.appstudio.delivery.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * OrderEntity - 订单本地数据库实体 (Room 框架)
 * 
 * 核心功能：
 * 1. 针对你担心的“几千用户崩溃”问题，原生开发使用 Room (SQLite 增强版) 做本地持久化。
 * 2. 即使服务器暂时宕机或网络波动，骑手手机端依然能秒开订单列表，不会白屏。
 */
@Entity(tableName = "orders")
data class OrderEntity(
    @PrimaryKey val id: Int,
    val orderNumber: String,
    val merchantName: String,
    val customerName: String,
    val destinationAddress: String,
    val price: Double,
    val status: String,
    val createdAt: Long
)
