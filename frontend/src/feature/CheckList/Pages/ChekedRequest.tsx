import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { FetchData } from '../../BookRequest/api/bookRequest.api';
import { getBookRequest } from '../../BookRequest/api/bookRequest.api';
import { useAuth } from '../../../context/authContext';
import { createInvoice, downloadInvoice } from './api/checkRequest.api';
import toast from 'react-hot-toast';
import DetailModal from '../ui/DetailRequest';
import RequestCard from '../ui/RequestCard';



function CardSkeleton() {
  return (
    <div className="w-[300px] shrink-0 snap-center rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
      <div className="mt-4 h-3 w-full rounded bg-gray-200" />
      <div className="mt-2 h-3 w-4/5 rounded bg-gray-200" />
      <div className="mt-5 h-8 w-full rounded-lg bg-gray-200" />
    </div>
  );
}



function ChekedRequest() {
  const [request, setRequest] = useState<FetchData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const trackRef = useRef<HTMLDivElement>(null);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await getBookRequest();
      const list = res?.data ?? [];
      setRequest(list);
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [user]);

  const sortedRequests = useMemo(
    () =>
      [...request].sort(
        (a, b) => new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime()
      ),
    [request]
  );

  const scrollByCard = (direction: 'prev' | 'next') => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = 240 + 12; // card width + gap
    track.scrollBy({ left: direction === 'next' ? cardWidth : -cardWidth, behavior: 'smooth' });
  };

  const handlePay = (item: FetchData) => {
    // TODO: wire up payment flow
    console.log('Pay for', item?.id);
  };

  const handleInvoice = async(item: FetchData) => {
    try{
      const res = await createInvoice(item.id)
      toast.success(res.message)
      const res2 = await downloadInvoice(res.data.id , item.customer_id , item.worker_id , item.id)
    }catch(error){
      console.log(error);
    }
  };


const [selectedItem, setSelectedItem] = useState<FetchData | null>(null);

const handleView = (item: FetchData) => {
  setSelectedItem(item);
};

const handleClose = () => setSelectedItem(null);

  

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Your requests</h2>
        <div className="flex gap-1">
          <button
            onClick={() => scrollByCard('prev')}
            className="grid h-7 w-7 place-items-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByCard('next')}
            className="grid h-7 w-7 place-items-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>
      {selectedItem && (
  <DetailModal item={selectedItem} onClose={handleClose}/>
)}

      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : sortedRequests.length === 0 ? (
          <div className="w-full rounded-2xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
            No requests yet
          </div>
        ) : (
          sortedRequests.map((item) => (
            <RequestCard
              key={item?.id}
              item={item}
              role={user?.role!}
              onPay={handlePay}
              onInvoice={handleInvoice}
              onView={handleView}
              onPaymentSuccess={fetchRequest}
            />
          ))
        )
        
        }
      </div>
    </div>
  );
}

export default ChekedRequest;