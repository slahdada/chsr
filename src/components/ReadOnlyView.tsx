import React, { useEffect, useState } from 'react';
import { Delivery } from '../types';
import { DashboardStats } from './DashboardStats';
import { Truck, X } from 'lucide-react';
import { formatCurrency, cn } from '../utils';
import { supabase } from '../supabase';


export function ReadOnlyView() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedData = async () => {
      setLoading(true);
      try {
        const hash = window.location.hash;
        if (hash.startsWith('#readonly=')) {
          const rawHash = hash.replace('#readonly=', '');
          const decoded = decodeURIComponent(escape(atob(rawHash)));
          const parsed = JSON.parse(decoded);
          setDeliveries(parsed);
        } else if (hash.startsWith('#share=')) {
          const shareId = hash.replace('#share=', '');
          if (supabase) {
            const { data, error: fetchError } = await supabase
              .from('shares')
              .select('data')
              .eq('id', shareId)
              .single();
            
            if (fetchError) throw fetchError;
            if (data && data.data) {
              setDeliveries(data.data);
            } else {
              setError(true);
            }
          } else {
            console.error('Supabase client is not configured, cannot load share link.');
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (e) {
        console.error('Failed to load shared deliveries:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSharedData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans dir-rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm animate-pulse">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

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
                    {delivery.photo && (
                      <div 
                        onClick={() => setActivePhoto(delivery.photo)}
                        className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                        title="عرض الصورة كاملة"
                      >
                        <img src={delivery.photo} alt="حذاء" className="w-full h-full object-cover" />
                      </div>
                    )}
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

      {/* Image Preview Modal */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white/5 shadow-2xl p-1 animate-in zoom-in-95 duration-200">
            <img 
              src={activePhoto} 
              alt="معاينة الحذاء" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl select-none"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full p-2.5 transition-colors shadow-lg cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
