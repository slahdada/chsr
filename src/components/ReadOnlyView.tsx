import React, { useEffect, useState } from 'react';
import { Delivery } from '../types';
import { DashboardStats } from './DashboardStats';
import { Truck } from 'lucide-react';
import { formatCurrency, cn } from '../utils';

export function ReadOnlyView() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const hash = window.location.hash.replace('#readonly=', '');
      if (hash) {
        const decoded = decodeURIComponent(escape(atob(hash)));
        const parsed = JSON.parse(decoded);
        setDeliveries(parsed);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans dir-rtl">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
          <p className="text-red-500 font-bold text-lg mb-2">عفواً، الرابط غير صالح</p>
          <p className="text-slate-500 text-sm">تأكد من نسخ الرابط بشكل صحيح.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: Delivery['status']) => {
    switch (status) {
      case 'to_deliver':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">قيد التوصيل</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">تم التوصيل</span>;
      case 'canceled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">أُلغيت</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 dir-rtl" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm shadow-blue-200">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">إدارة توصيل الأحذية</h1>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded inline-flex mt-1">
              وضع العرض فقط
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <DashboardStats deliveries={deliveries} />

        <div className="mt-8 space-y-4">
          <h2 className="font-bold text-lg text-slate-800">قائمة التوصيلات</h2>
          {deliveries.length === 0 ? (
            <p className="text-center py-8 text-slate-500">لا توجد بيانات</p>
          ) : (
            deliveries.map(delivery => {
              const itemShoePrice = delivery.status === 'delivered' ? (delivery.totalPrice || 0) : 0;
              const remaining = itemShoePrice - (delivery.received || 0) - (delivery.deliveryFee || 0);
              return (
                <div key={delivery.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start mb-3">
                        {getStatusBadge(delivery.status)}
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p className="font-medium dir-ltr inline-block" dir="ltr">{delivery.phone}</p>
                        <p className="truncate text-xs">{delivery.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-4 gap-2 text-center items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1">السعر الكلي</p>
                      <p className="text-xs font-semibold text-slate-700">{formatCurrency(delivery.totalPrice || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1">استلام</p>
                      <p className="text-xs font-semibold text-teal-600">{formatCurrency(delivery.received || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1">تسليم</p>
                      <p className="text-xs font-semibold text-purple-600">{formatCurrency(delivery.deliveryFee || 0)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg py-1">
                      <p className="text-[10px] text-slate-500 mb-0.5">المتبقي</p>
                      <p className={cn("text-sm font-bold", remaining > 0 ? "text-rose-600" : remaining < 0 ? "text-amber-600" : "text-slate-700")}>
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                  </div>
                  
                  {delivery.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-500 bg-slate-50/50 p-2 rounded-lg">
                      <p>{delivery.notes}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
