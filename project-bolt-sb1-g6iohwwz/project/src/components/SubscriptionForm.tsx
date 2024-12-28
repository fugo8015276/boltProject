import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Subscription } from '../types/subscription';
import { subscriptionSchema } from '../utils/validation';
import { FormError } from './FormError';
import type { z } from 'zod';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionAdded: (subscription: Subscription) => void;
}

type FormErrors = {
  [K in keyof z.infer<typeof subscriptionSchema>]?: string;
};

export function SubscriptionForm({ isOpen, onClose, onSubscriptionAdded }: Props) {
  const [formData, setFormData] = useState({
    service_name: '',
    price: '',
    billing_cycle: 'monthly',
    next_billing_date: '',
    category: '',
    service_url: '',
    notes: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    try {
      subscriptionSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      toast.error('ユーザー情報の取得に失敗しました');
      return;
    }

    const subscription = {
      ...formData,
      user_id: userData.user.id,
      price: parseFloat(formData.price)
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();

    if (error) {
      toast.error('サブスクリプションの登録に失敗しました');
      return;
    }

    toast.success('サブスクリプションを登録しました');
    onSubscriptionAdded(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">新規サブスクリプション登録</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">サービス名 *</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.service_name}
              onChange={e => setFormData({ ...formData, service_name: e.target.value })}
            />
            {errors.service_name && <FormError message={errors.service_name} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">料金 *</label>
            <input
              type="number"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
            />
            {errors.price && <FormError message={errors.price} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">請求サイクル *</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.billing_cycle}
              onChange={e => setFormData({ ...formData, billing_cycle: e.target.value as 'monthly' | 'yearly' })}
            >
              <option value="monthly">月額</option>
              <option value="yearly">年額</option>
            </select>
            {errors.billing_cycle && <FormError message={errors.billing_cycle} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">次回請求日 *</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.next_billing_date}
              onChange={e => setFormData({ ...formData, next_billing_date: e.target.value })}
            />
            {errors.next_billing_date && <FormError message={errors.next_billing_date} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">カテゴリ *</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">選択してください</option>
              <option value="エンターテイメント">エンターテイメント</option>
              <option value="音楽">音楽</option>
              <option value="動画">動画</option>
              <option value="ソフトウェア">ソフトウェア</option>
              <option value="その他">その他</option>
            </select>
            {errors.category && <FormError message={errors.category} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">サービスURL</label>
            <input
              type="url"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.service_url}
              onChange={e => setFormData({ ...formData, service_url: e.target.value })}
            />
            {errors.service_url && <FormError message={errors.service_url} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">メモ</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
            {errors.notes && <FormError message={errors.notes} />}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}