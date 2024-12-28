import { z } from 'zod';

export const subscriptionSchema = z.object({
  service_name: z.string().min(1, '必須項目です'),
  price: z.string().min(1, '必須項目です').refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    '0以上の数値を入力してください'
  ),
  billing_cycle: z.enum(['monthly', 'yearly'], {
    invalid_type_error: '請求サイクルを選択してください',
  }),
  next_billing_date: z.string().min(1, '必須項目です'),
  category: z.string().min(1, '必須項目です'),
  service_url: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const authSchema = z.object({
  email: z.string().min(1, '必須項目です').email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
});