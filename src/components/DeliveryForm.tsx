import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Save, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Delivery, DeliveryStatus } from '../types';
import { cn, compressAndResizeImage } from '../utils';

interface DeliveryFormProps {
  initialData?: Delivery | null;
  onSave: (data: Omit<Delivery, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function DeliveryForm({ initialData, onSave, onCancel }: DeliveryFormProps) {
  const [photo, setPhoto] = useState<string | null>(initialData?.photo || null);
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [status, setStatus] = useState<DeliveryStatus>(initialData?.status || 'to_deliver');
  const [received, setReceived] = useState<number>(initialData?.received || 0);
  const [deliveryFee, setDeliveryFee] = useState<number>(initialData?.deliveryFee || 0);
  const [totalPrice, setTotalPrice] = useState<number>(initialData?.totalPrice || 0);
  const [notes, setNotes] = useState(initialData?.notes || '');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const itemShoePrice = status === 'delivered' ? totalPrice : 0;
  const remaining = itemShoePrice - received - deliveryFee;

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const compressedDataUrl = await compressAndResizeImage(file);
      setPhoto(compressedDataUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'حدث خطأ أثناء معالجة الصورة');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUrlSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!tempUrl.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);
    
    if (tempUrl.startsWith('http://') || tempUrl.startsWith('https://') || tempUrl.startsWith('data:image/')) {
      setPhoto(tempUrl.trim());
      setShowUrlInput(false);
      setTempUrl('');
      setIsProcessing(false);
    } else {
      setErrorMsg('الرجاء إدخال رابط صالح يبدأ بـ http أو https');
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      photo,
      phone,
      address,
      status,
      received,
      deliveryFee,
      totalPrice,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'تعديل التوصيلة' : 'توصيلة جديدة'}
          </h2>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex flex-col items-center justify-center border border-slate-100 bg-slate-50/50 p-4 rounded-2xl mb-6">
            <div className="relative w-36 h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-500 overflow-hidden shadow-inner">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center p-2 text-center text-blue-600">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-[11px] font-semibold">جاري معالجة وضغط الصورة...</span>
                </div>
              ) : photo ? (
                <>
                  <img src={photo} alt="Shoe Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-colors"
                    title="حذف الصورة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
                  <Camera className="w-10 h-10 mb-2 stroke-1" />
                  <span className="text-xs">لا توجد صورة</span>
                </div>
              )}
            </div>

            {/* If there is no photo and not processing, show the options */}
            {!photo && !isProcessing && (
              <div className="mt-4 w-full max-w-sm">
                <p className="text-center text-xs font-semibold text-slate-500 mb-2">إختر طريقة إضافة الصورة:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-1.5 py-2 px-3 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-slate-700 rounded-xl text-xs font-medium transition-all shadow-sm active:scale-95"
                  >
                    <Camera className="w-5.5 h-5.5 text-blue-600" />
                    <span>الكاميرا</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex flex-col items-center gap-1.5 py-2 px-3 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-slate-700 rounded-xl text-xs font-medium transition-all shadow-sm active:scale-95"
                  >
                    <Upload className="w-5.5 h-5.5 text-emerald-600" />
                    <span>معرض الصور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowUrlInput(!showUrlInput); setErrorMsg(null); }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-medium transition-all shadow-sm active:scale-95",
                      showUrlInput 
                        ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700" 
                        : "bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-slate-700"
                    )}
                  >
                    <LinkIcon className="w-5.5 h-5.5 text-amber-600" />
                    <span>رابط صورة</span>
                  </button>
                </div>
              </div>
            )}

            {/* URL input field */}
            {showUrlInput && !photo && !isProcessing && (
              <div className="mt-3 w-full max-w-sm bg-white p-3 border border-slate-200 rounded-xl space-y-2 animate-in slide-in-from-top-2 duration-200">
                <input 
                  type="url" 
                  placeholder="https://example.com/image.jpg"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 dir-ltr text-left"
                />
                <div className="flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={handleUrlSubmit} 
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    تحميل
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowUrlInput(false); setTempUrl(''); setErrorMsg(null); }} 
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Error display */}
            {errorMsg && (
              <p className="mt-2 text-xs text-red-600 font-medium bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                {errorMsg}
              </p>
            )}

            {/* Hidden Inputs */}
            <input 
              type="file" 
              ref={cameraInputRef} 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              onChange={handleCameraUpload}
            />
            <input 
              type="file" 
              ref={galleryInputRef} 
              accept="image/*,image/heic,image/heif,.heic,.heif"
              className="hidden" 
              onChange={handleGalleryUpload}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">هاتف العميل</label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dir-ltr text-right" placeholder="05..." />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">الحالة</label>
              <select value={status} onChange={e => setStatus(e.target.value as DeliveryStatus)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="to_deliver">قيد التوصيل</option>
                <option value="delivered">تم التوصيل</option>
                <option value="canceled">أُلغيت</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">عنوان العميل</label>
            <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="المدينة، الحي..." />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">السعر الإجمالي</label>
              <input type="number" min="0" value={totalPrice || ''} onChange={e => setTotalPrice(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">استلام</label>
              <input type="number" min="0" value={received || ''} onChange={e => setReceived(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="text-sm font-medium text-slate-700">تسليم</label>
              <input type="number" min="0" value={deliveryFee || ''} onChange={e => setDeliveryFee(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="flex justify-between items-center px-4 py-3 bg-blue-50 text-blue-900 rounded-xl">
            <span className="font-semibold text-sm">المتبقي (تلقائي):</span>
            <span className="font-bold text-lg dir-ltr">{remaining}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">ملاحظات</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl shadow-sm shadow-blue-200 flex justify-center items-center gap-2 transition-colors">
              <Save className="w-5 h-5" />
              حفظ البيانات
            </button>
            <button type="button" onClick={onCancel} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-xl transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
