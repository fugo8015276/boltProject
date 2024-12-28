import React, { useState } from 'react';
import { format } from 'date-fns';
import { ExternalLink, Trash2, Edit2 } from 'lucide-react';
import type { Subscription } from '../types/subscription';
import { EditSubscriptionForm } from './EditSubscriptionForm';

interface Props {
  subscription: Subscription;
  onDelete: (id: string) => void;
  onUpdate: (subscription: Subscription) => void;
}

export function SubscriptionCard({ subscription, onDelete, onUpdate }: Props) {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const isNearingRenewal = new Date(subscription.next_billing_date).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{subscription.service_name}</h3>
            <p className="text-gray-600">{subscription.category}</p>
          </div>
          <div className="flex gap-2">
            {subscription.service_url && (
              <a
                href={subscription.service_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                <ExternalLink size={20} />
              </a>
            )}
            <button
              onClick={() => setIsEditFormOpen(true)}
              className="text-gray-500 hover:text-gray-600"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={() => onDelete(subscription.id)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-900">
            ¥{subscription.price.toLocaleString()}
            <span className="text-sm text-gray-600">/{subscription.billing_cycle === 'monthly' ? '月' : '年'}</span>
          </p>
          
          <p className={`mt-2 ${isNearingRenewal ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
            次回請求日: {format(new Date(subscription.next_billing_date), 'yyyy年MM月dd日')}
            {isNearingRenewal && ' (まもなく更新)'}
          </p>
        </div>

        {subscription.notes && (
          <p className="mt-4 text-gray-600 text-sm">{subscription.notes}</p>
        )}
      </div>

      <EditSubscriptionForm
        subscription={subscription}
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubscriptionUpdated={onUpdate}
      />
    </>
  );
}