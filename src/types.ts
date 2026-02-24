export type UserRole = 'admin' | 'merchant' | 'rider' | 'customer';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  name: string;
  phone: string;
  balance: number;
  status: string;
  id_card_url?: string;
  age?: number;
  gender?: string;
  merchant_name?: string;
  merchant_address?: string;
}

export interface Order {
  id: number;
  order_number: string;
  merchant_id: number;
  rider_id?: number;
  customer_id?: number;
  customer_name: string;
  customer_phone: string;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  weight: number;
  distance: number;
  price: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled' | 'transferring';
  type: 'instant' | 'scheduled';
  scheduled_time?: string;
  remarks?: string;
  created_at: string;
  accepted_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  transfer_deadline?: string;
  merchant_name?: string;
  merchant_address?: string;
}

export interface ChatMessage {
  id: number;
  order_id: number;
  sender_id: number;
  message: string;
  type: 'text' | 'voice' | 'photo' | 'video';
  url?: string;
  created_at: string;
}

export interface Report {
  id: number;
  order_id: number;
  rider_id: number;
  type: string;
  content: string;
  photo_url?: string;
  lat: number;
  lng: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
