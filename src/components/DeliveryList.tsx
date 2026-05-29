import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Delivery } from '../types';
import { formatCurrency } from '../utils';

interface DeliveryListProps {
  deliveries: Delivery[];
  onEdit: (delivery: Delivery) => void;
  onDelete: (id: string) => void;
}

export function DeliveryList({ deliveries, onEdit, onDelete }: DeliveryListProps) {
  if (deliveries.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        لا توجد بيانات
      </div>
    );
  }

  const getStatusPill = (status: Delivery['status']) => {
    switch (status) {
      case 'to_deliver':
        return <span className="px-2 py-1 rounded-full text-[0.7rem] font-bold bg-[#fef9c3] text-[#854d0e]">قيد التوصيل</span>;
      case 'delivered':
        return <span className="px-2 py-1 rounded-full text-[0.7rem] font-bold bg-[#dcfce7] text-[#166534]">تم التوصيل</span>;
      case 'canceled':
        return <span className="px-2 py-1 rounded-full text-[0.7rem] font-bold bg-[#fee2e2] text-[#991b1b]">أُلغيت</span>;
    }
  };

  return (
    <div className="overflow-x-auto overflow-y-visible w-full h-full">
      <table className="w-full border-collapse text-right text-[0.875rem] min-w-[600px] md:min-w-full">
        <thead className="bg-[#f1f5f9] sticky top-0 z-10 border-b border-slate-200">
          <tr>
            <th className="px-4 py-2.5 font-semibold text-[#475569] text-[0.75rem]">صورة</th>
            <th className="px-4 py-2.5 font-semibold text-[#475569] text-[0.75rem]">العميل والعنوان</th>
            <th className="px-4 py-2.5 font-semibold text-[#475569] text-[0.75rem]">الحالة</th>
            <th className="px-4 py-2.5 font-semibold text-[#475569] text-[0.75rem] hidden md:table-cell">السعر الكلي</th>
            <th className="px-4 py-2.5 font-semibold text-[#475569] text-[0.75rem] hidden sm:table-cell">استلام</th>
            <th className="px-4 py-2.5 font-semibold text-[#475569] text-[0.75rem] hidden sm:table-cell">تسليم</th>
            <th className="px-4 py-2.5 font-semibold text-[#475569] text-[0.75rem]">المتبقي</th>
            <th className="px-4 py-2.5 font-semibold text-[#475569] text-[0.75rem] text-left">عمليات</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((delivery) => {
            const itemShoePrice = delivery.status === 'delivered' ? (delivery.totalPrice || 0) : 0;
            const remaining = itemShoePrice - (delivery.received || 0) - (delivery.deliveryFee || 0);
            return (
              <tr key={delivery.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 align-middle">
                  <div className="w-10 h-10 rounded-md bg-slate-200 overflow-hidden shrink-0">
                    {delivery.photo && <img src={delivery.photo} alt="حذاء" className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="px-4 py-2 align-middle">
                   <div className="font-bold text-slate-900 block dir-ltr text-right" dir="ltr">{delivery.phone}</div>
                   <div className="text-[0.75rem] text-slate-500 truncate max-w-[120px] sm:max-w-xs">{delivery.address}</div>
                </td>
                <td className="px-4 py-2 align-middle whitespace-nowrap">
                  {getStatusPill(delivery.status)}
                </td>
                <td className="px-4 py-2 align-middle hidden md:table-cell whitespace-nowrap text-slate-600">
                  {formatCurrency(delivery.totalPrice || 0)}
                </td>
                <td className="px-4 py-2 align-middle hidden sm:table-cell whitespace-nowrap text-slate-600">
                  {formatCurrency(delivery.received || 0)}
                </td>
                <td className="px-4 py-2 align-middle hidden sm:table-cell whitespace-nowrap text-slate-600">
                  {formatCurrency(delivery.deliveryFee || 0)}
                </td>
                <td className="px-4 py-2 align-middle font-bold whitespace-nowrap">
                  {remaining === 0 ? (
                    <span className="text-emerald-500">0</span>
                  ) : remaining > 0 ? (
                    <span className="text-red-500">{formatCurrency(remaining)}</span>
                  ) : (
                    <span className="text-amber-500">{formatCurrency(remaining)}</span>
                  )}
                </td>
                <td className="px-4 py-2 align-middle text-left whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(delivery)} className="text-blue-600 hover:text-blue-800 bg-transparent shrink-0 text-sm font-semibold" title="تعديل">
                      تعديل
                    </button>
                    <button onClick={() => onDelete(delivery.id)} className="text-red-500 hover:text-red-700 bg-transparent shrink-0" title="حذف">
                      <Trash2 className="w-4 h-4 ml-2 inline-block" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
