import React, { memo } from 'react';
import { Delivery } from '../types';
import { formatCurrency } from '../utils';

interface DashboardStatsProps {
  deliveries: Delivery[];
}

export const DashboardStats = memo(function DashboardStats({ deliveries }: DashboardStatsProps) {
  const {
    deliveredShoes,
    toDeliverShoes,
    canceledShoes,
    totalDeliveredShoePrice,
    totalDeliveryFees,
    totalReceivedFees,
  } = deliveries.reduce((totals, delivery) => {
    if (delivery.status === 'delivered') {
      totals.deliveredShoes += 1;
      totals.totalDeliveredShoePrice += delivery.totalPrice || 0;
    } else if (delivery.status === 'to_deliver') {
      totals.toDeliverShoes += 1;
    } else if (delivery.status === 'canceled') {
      totals.canceledShoes += 1;
    }
    totals.totalDeliveryFees += delivery.deliveryFee || 0;
    totals.totalReceivedFees += delivery.received || 0;
    return totals;
  }, {
    deliveredShoes: 0,
    toDeliverShoes: 0,
    canceledShoes: 0,
    totalDeliveredShoePrice: 0,
    totalDeliveryFees: 0,
    totalReceivedFees: 0,
  });
  const totalShoes = deliveries.length;
  
  const totalRemaining = totalDeliveredShoePrice - totalReceivedFees - totalDeliveryFees;

  const StatCard = ({ title, value, colorClass }: any) => (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-1 min-w-[120px]">
      <span className="text-[0.75rem] text-slate-500 uppercase tracking-wide whitespace-nowrap">{title}</span>
      <span className={`text-[1.1rem] font-bold ${colorClass || 'text-slate-900'}`}>{value}</span>
    </div>
  );

  return (
    <div className="flex gap-4 p-4 bg-white border-b border-slate-200" style={{ width: 'max-content', minWidth: '100%' }}>
      <StatCard 
        title="إجمالي الأحذية" 
        value={totalShoes} 
      />
      <StatCard 
        title="تم التوصيل" 
        value={deliveredShoes} 
        colorClass="text-emerald-500" 
      />
      <StatCard 
        title="قيد التوصيل" 
        value={toDeliverShoes} 
        colorClass="text-amber-500" 
      />
      <StatCard 
        title="أُلغيت" 
        value={canceledShoes} 
        colorClass="text-red-500" 
      />
      <StatCard 
        title="إجمالي السلع" 
        value={formatCurrency(totalDeliveredShoePrice)} 
      />
      <StatCard 
        title="مصاريف استلام" 
        value={formatCurrency(totalReceivedFees)} 
        colorClass="text-emerald-500" 
      />
      <StatCard 
        title="مصاريف تسليم" 
        value={formatCurrency(totalDeliveryFees)} 
      />
      <StatCard 
        title="المتبقي" 
        value={formatCurrency(totalRemaining)} 
        colorClass={totalRemaining < 0 ? "text-red-500" : ""} 
      />
    </div>
  );
});
