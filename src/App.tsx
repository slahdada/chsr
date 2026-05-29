import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Truck, Plus, Share2, Search, Link as LinkIcon, AlertCircle, Camera, Trash2 } from 'lucide-react';
import { Delivery, DeliveryStatus } from './types';
import { DashboardStats } from './components/DashboardStats';
import { DeliveryList } from './components/DeliveryList';
import { DeliveryForm } from './components/DeliveryForm';
import { ReadOnlyView } from './components/ReadOnlyView';
import * as htmlToImage from 'html-to-image';
import { cn, resizeBase64ForShare } from './utils';


function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(error);
    }
  };

  return [storedValue, setValue] as const;
}

export default function App() {
  // Check if we're in read-only mode based on hash
  const [isReadOnly, setIsReadOnly] = useState(() => window.location.hash.startsWith('#readonly='));
  
  useEffect(() => {
    const handleHashChange = () => {
      setIsReadOnly(window.location.hash.startsWith('#readonly='));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [deliveries, setDeliveries] = useLocalStorage<Delivery[]>('shoe-deliveries-v1', []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<DeliveryStatus | 'all'>('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, action: () => void}>({isOpen: false, message: '', action: () => {}});

  const appRef = useRef<HTMLDivElement>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveDelivery = (data: Omit<Delivery, 'id' | 'createdAt'>) => {
    if (editingDelivery) {
      setDeliveries(prev => prev.map(d => d.id === editingDelivery.id ? { ...data, id: d.id, createdAt: d.createdAt } : d));
      showNotification('تم تحديث التوصيلة بنجاح');
    } else {
      const newDelivery: Delivery = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      };
      setDeliveries(prev => [...prev, newDelivery]);
      showNotification('تم إضافة التوصيلة بنجاح');
    }
    setIsFormOpen(false);
    setEditingDelivery(null);
  };

  const handleDeleteDelivery = (id: string) => {
    setDeliveries(prev => prev.filter(d => d.id !== id));
    showNotification('تم حذف التوصيلة');
  };

  const requestDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذه التوصيلة؟ لا يمكن التراجع بعد ذلك.',
      action: () => {
        handleDeleteDelivery(id);
        setConfirmDialog(prev => ({...prev, isOpen: false}));
      }
    });
  };

  const requestClearAll = () => {
    if (deliveries.length === 0) {
      showNotification('لا توجد بيانات لمسحها', 'error');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      message: 'هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع بعد التحذير.',
      action: () => {
        setDeliveries([]);
        showNotification('تم مسح جميع البيانات بنجاح');
        setConfirmDialog(prev => ({...prev, isOpen: false}));
      }
    });
  };

  const handleShareImage = async () => {
    if (!appRef.current) return;
    try {
      setIsExporting(true);
      showNotification('جاري تجهيز الصورة...');
      // Wait to allow React to apply full-height classes
      await new Promise(r => setTimeout(r, 300));
      
      const dataUrl = await htmlToImage.toJpeg(appRef.current, { quality: 0.9, backgroundColor: '#f8fafc', style: { height: 'auto', overflow: 'visible' } });
      
      const link = document.createElement('a');
      link.download = `تقارير_التوصيل_${new Date().toLocaleDateString('ar-DZ')}.jpg`;
      link.href = dataUrl;
      link.click();
      
      showNotification('تم حفظ الصورة بنجاح');
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء حفظ الصورة', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareLink = async () => {
    try {
      showNotification('جاري تجهيز الرابط...');
      
      const compressedDeliveries = await Promise.all(
        deliveries.map(async (delivery) => {
          if (delivery.photo) {
            try {
              const smallPhoto = await resizeBase64ForShare(delivery.photo, 100, 100, 0.5);
              return { ...delivery, photo: smallPhoto };
            } catch (e) {
              console.error('Failed to resize image for share:', e);
              return delivery;
            }
          }
          return delivery;
        })
      );

      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(compressedDeliveries))));
      const url = `${window.location.origin}${window.location.pathname}#readonly=${encoded}`;
      
      await navigator.clipboard.writeText(url);
      showNotification('تم نسخ الرابط! يمكنك مشاركته الآن في واتساب.');
    } catch (err) {
      showNotification('حدث خطأ أثناء إنشاء الرابط', 'error');
      console.error(err);
    }
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const matchSearch = d.phone.includes(searchQuery) || d.address.includes(searchQuery) || (d.notes || '').includes(searchQuery);
      const matchStatus = filterStatus === 'all' || d.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [deliveries, searchQuery, filterStatus]);

  if (isReadOnly) {
    return <ReadOnlyView />;
  }

  return (
    <div 
      className={cn(
        "bg-slate-50 font-sans hidden-scrollbar",
        isExporting ? "h-auto min-h-screen overflow-visible" : "h-screen flex flex-col overflow-hidden"
      )} 
      dir="rtl" 
      ref={appRef}
    >
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className={`px-4 py-2 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 ${notification.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-red-600 text-white shadow-red-200'}`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0" data-html2canvas-ignore>
        <div className="flex items-center gap-3 text-blue-600 font-bold text-lg md:text-xl">
           👟 إدارة توصيل الأحذية <span className="text-sm font-normal text-slate-500 hidden sm:inline">(النسخة الاحترافية)</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleShareLink} className="bg-white border border-slate-200 text-slate-900 font-semibold px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all hover:bg-slate-50" title="مشاركة رابط للقراءة فقط">
            <LinkIcon className="w-4 h-4" />
            <span className="hidden sm:inline">نسخ الرابط</span>
          </button>
          <button onClick={handleShareImage} className="bg-white border border-slate-200 text-slate-900 font-semibold px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all hover:bg-slate-50" title="مشاركة كصورة">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">مشاركة كصورة</span>
          </button>
        </div>
      </header>

      {/* Stats Strip */}
      <div className={cn("shrink-0", isExporting ? "overflow-visible" : "overflow-x-auto")}>
        <DashboardStats deliveries={deliveries} />
      </div>

      <main className={cn("flex-1 flex flex-col p-4 md:p-6 gap-4", isExporting ? "overflow-visible" : "overflow-hidden")}>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0" data-html2canvas-ignore>
          <input 
            type="text" 
            placeholder="بحث برقم الهاتف أو العنوان..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px] bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold text-slate-900 outline-none flex-1 sm:flex-none cursor-pointer"
            >
              <option value="all">كل الحالات</option>
              <option value="to_deliver">قيد التوصيل</option>
              <option value="delivered">تم التوصيل</option>
              <option value="canceled">أُلغيت</option>
            </select>
            <button onClick={requestClearAll} className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 flex-1 sm:flex-none justify-center" title="مسح الكل">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">مسح الكل</span>
            </button>
            <button onClick={() => { setEditingDelivery(null); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 flex-1 sm:flex-none justify-center">
              <Plus className="w-4 h-4" />
              <span>إضافة طلب جديد</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className={cn("bg-white border border-slate-200 rounded-xl flex flex-col", isExporting ? "overflow-visible h-auto" : "flex-1 overflow-hidden min-h-0")}>
           <DeliveryList 
             deliveries={filteredDeliveries} 
             onEdit={(d) => { setEditingDelivery(d); setIsFormOpen(true); }}
             onDelete={requestDelete}
           />
        </div>
      </main>

      {/* Floating Add Button for Mobile */}
      <button 
        onClick={() => { setEditingDelivery(null); setIsFormOpen(true); }}
        className="md:hidden fixed bottom-6 left-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 active:scale-95 transition-transform"
        data-html2canvas-ignore
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Form Modal */}
      {isFormOpen && (
        <div data-html2canvas-ignore>
          <DeliveryForm 
            initialData={editingDelivery} 
            onSave={handleSaveDelivery} 
            onCancel={() => { setIsFormOpen(false); setEditingDelivery(null); }} 
          />
        </div>
      )}

      {/* Confirm Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto" data-html2canvas-ignore>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200 my-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-2">تأكيد</h3>
            <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button onClick={confirmDialog.action} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-xl transition-colors">
                نعم، متأكد
              </button>
              <button onClick={() => setConfirmDialog(prev => ({...prev, isOpen: false}))} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 rounded-xl transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
