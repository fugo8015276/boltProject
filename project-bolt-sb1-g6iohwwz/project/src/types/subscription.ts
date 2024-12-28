export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  next_billing_date: string;
  category: string;
  service_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SharedSubscription {
  id: string;
  subscription_id: string;
  shared_with_user_id: string;
  created_at: string;
}