/*
  # サブスクリプション管理システムの初期スキーマ

  1. 新規テーブル
    - `subscriptions`
      - `id` (uuid, プライマリーキー)
      - `user_id` (uuid, 外部キー)
      - `service_name` (text)
      - `price` (numeric)
      - `billing_cycle` (text)
      - `next_billing_date` (timestamptz)
      - `category` (text)
      - `service_url` (text, オプション)
      - `notes` (text, オプション)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `shared_subscriptions`
      - `id` (uuid, プライマリーキー)
      - `subscription_id` (uuid, 外部キー)
      - `shared_with_user_id` (uuid, 外部キー)
      - `created_at` (timestamptz)

  2. セキュリティ
    - RLSを有効化
    - ユーザーは自分のサブスクリプションのみ閲覧・編集可能
    - 共有されたサブスクリプションも閲覧可能
*/

-- updated_at列を自動更新する関数の作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- subscriptionsテーブルの作成
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  service_name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  next_billing_date timestamptz NOT NULL,
  category text NOT NULL,
  service_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- shared_subscriptionsテーブルの作成
CREATE TABLE shared_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions ON DELETE CASCADE NOT NULL,
  shared_with_user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subscription_id, shared_with_user_id)
);

-- RLSの有効化
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_subscriptions ENABLE ROW LEVEL SECURITY;

-- サブスクリプションの閲覧・編集ポリシー
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM shared_subscriptions
      WHERE subscription_id = subscriptions.id
      AND shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 共有サブスクリプションのポリシー
CREATE POLICY "Users can view own shared subscriptions"
  ON shared_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE id = subscription_id AND user_id = auth.uid()
    ) OR
    shared_with_user_id = auth.uid()
  );

CREATE POLICY "Users can share own subscriptions"
  ON shared_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE id = subscription_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove own shared subscriptions"
  ON shared_subscriptions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE id = subscription_id AND user_id = auth.uid()
    ) OR
    shared_with_user_id = auth.uid()
  );

-- 自動更新日時の設定
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();