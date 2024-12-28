import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Subscription } from '../types/subscription';

interface Props {
  subscription: Subscription;
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionUpdated: (subscription: Subscription) => void;
}

export function EditSubscriptionForm({ subscription, isOpen, onClose, onSubscriptionUpdated }: Props) {
  const [formData, setFormData] = useState({
    service_name: subscription.service_name,
    price: subscription.price.toString(),
    billing_cycle: subscription.billing_cycle,
    next_billing_date: new Date(subscription.next_billing_date).toISOString().split('T')[0],
    category: subscription.category,
    service_url: subscription.service_url || '',
    notes: subscription.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        ...formData,
        price: parseFloat(formData.price)
      })
      .eq('id', subscription.id)
      .select()
      .single();

    if (error) {
      toast.error('サブスクリプションの更新に失敗しました');
      return;
    }

    toast.success('サブスクリプションを更新しました');
    onSubscriptionUpdated(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">サブスクリプション編集</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">サービス名 *</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.service_name}
              onChange={e => setFormData({ ...formData, service_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">料金 *</label>
            <input
              type="number"
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">請求サイクル *</label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.billing_cycle}
              onChange={e => setFormData({ ...formData, billing_cycle: e.target.value })}
            >
              <option value="monthly">月額</option>
              <option value="yearly">年額</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">次回請求日 *</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.next_billing_date}
              onChange={e => setFormData({ ...formData, next_billing_date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">カテゴリ *</label>
            <select
              required
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">サービスURL</label>
            <input
              type="url"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.service_url}
              onChange={e => setFormData({ ...formData, service_url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">メモ</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
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
              更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}