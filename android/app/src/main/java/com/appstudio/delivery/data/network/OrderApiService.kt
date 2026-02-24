package com.appstudio.delivery.data.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

/**
 * OrderApiService - 订单模块原生网络接口 (Retrofit 定义)
 * 
 * 核心功能：
 * 1. 使用协程 (suspend) 实现非阻塞式网络请求
 * 2. 对接后端 PostgreSQL 数据库 API
 */
interface OrderApiService {

    /**
     * 获取任务大厅订单列表
     */
    @GET("api/orders/hall")
    suspend fun getHallOrders(): List<OrderResponse>

    /**
     * 骑手抢单
     * @param orderId 订单ID
     * @param riderId 骑手ID
     */
    @POST("api/orders/accept")
    suspend fun acceptOrder(
        @Query("orderId") orderId: Int,
        @Query("riderId") riderId: Int
    ): CommonResponse

    /**
     * 上报骑手实时位置
     */
    @POST("api/rider/location")
    suspend fun updateLocation(
        @Body location: LocationData
    ): CommonResponse
}

data class OrderResponse(val id: Int, val price: Double, val address: String)
data class CommonResponse(val success: Boolean, val message: String)
data class LocationData(val riderId: Int, val lat: Double, val lng: Double)
