import React from 'react';
import { Delivery } from '../types';
import { formatCurrency } from '../utils';

interface DashboardStatsProps {
  deliveries: Delivery[];
}

export function DashboardStats({ deliveries }: DashboardStatsProps) {
  const totalShoes = deliveries.length;
  const deliveredShoes = deliveries.filter(d => d.status === 'delivered').length;
  const toDeliverShoes = deliveries.filter(d => d.status === 'to_deliver').length;
  const canceledShoes = deliveries.filter(d => d.status === 'canceled').length;

  const totalDeliveredShoePrice = deliveries
    .filter(d => d.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  
  const totalDeliveryFees = deliveries.reduce((acc, curr) => acc + (curr.deliveryFee || 0), 0);
  const totalReceivedFees = deliveries.reduce((acc, curr) => acc + (curr.received || 0), 0);
  
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
}

