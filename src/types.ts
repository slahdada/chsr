export type DeliveryStatus = 'to_deliver' | 'delivered' | 'canceled';

export interface Delivery {
  id: string;
  photo: string | null; // Base64 data URL
  phone: string;
  address: string;
  status: DeliveryStatus;
  received: number; // المبلغ المستلم (Reçu)
  deliveryFee: number; // رسوم التوصيل (Frais livraison)
  totalPrice: number; // السعر الإجمالي (Prix total)
  notes: string; // ملاحظات (Notes)
  createdAt: number;
}
