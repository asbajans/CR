import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../lib/api';
import { ROUTES } from '../../lib/constants';

const schema = z.object({
  email: z.string().email('Geçersiz e-posta'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const res = await api.post('/auth/login', data);
      const { user, token } = res.data.data;
      localStorage.setItem('crdent_token', token);
      localStorage.setItem('crdent_user', JSON.stringify(user));
      setUser(user, token);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Giriş başarısız');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-600">CRDent</h1>
          <p className="text-sm text-slate-500">Diş Kliniği CRM Giriş</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="admin@crdent.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Giriş Yap
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-500">
          CRDent v1.0.0 - Diş Kliniği Modüler CRM
        </div>
      </div>
    </div>
  );
};
