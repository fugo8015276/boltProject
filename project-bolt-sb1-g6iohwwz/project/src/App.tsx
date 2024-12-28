import React, { useEffect, useState } from 'react';
import { Plus, BarChart2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { SubscriptionCard } from './components/SubscriptionCard';
import { SubscriptionForm } from './components/SubscriptionForm';
import { AuthForm } from './components/AuthForm';
import type { Subscription } from './types/subscription';
import toast from 'react-hot-toast';

function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [totalYearly, setTotalYearly] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    calculateTotals();
  }, [subscriptions]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getSession();
    setUser(user);

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  };

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('next_billing_date', { ascending: true });

    if (error) {
      toast.error('サブスクリプションの取得に失敗しました');
      return;
    }

    setSubscriptions(data);
  };

  const calculateTotals = () => {
    let monthly = 0;
    let yearly = 0;

    subscriptions.forEach((sub) => {
      if (sub.billing_cycle === 'monthly') {
        monthly += sub.price;
        yearly += sub.price * 12;
      } else {
        yearly += sub.price;
        monthly += sub.price / 12;
      }
    });

    setTotalMonthly(monthly);
    setTotalYearly(yearly);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('削除に失敗しました');
      return;
    }

    toast.success('サブスクリプションを削除しました');
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const handleSubscriptionAdded = (subscription: Subscription) => {
    setSubscriptions([...subscriptions, subscription]);
    setIsFormOpen(false);
  };

  const handleSubscriptionUpdated = (updatedSubscription: Subscription) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === updatedSubscription.id ? updatedSubscription : sub
    ));
  };

  if (!user) {
    return <AuthForm onSuccess={checkUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">サブスクリプション管理</h1>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus size={20} />
              新規登録
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="text-blue-500" size={24} />
            <h2 className="text-xl font-semibold">支出サマリー</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">月額合計</p>
              <p className="text-2xl font-bold">¥{Math.round(totalMonthly).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">年間合計</p>
              <p className="text-2xl font-bold">¥{Math.round(totalYearly).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onDelete={handleDelete}
              onUpdate={handleSubscriptionUpdated}
            />
          ))}
        </div>
      </main>

      <SubscriptionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubscriptionAdded={handleSubscriptionAdded}
      />
    </div>
  );
}

export default App;