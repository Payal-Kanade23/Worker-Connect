import type { FetchData } from "../../BookRequest/api/bookRequest.api";
import StatusBadge from "./StatusBadge";
import PayButton from "./PaymentButton";

interface RequestCardProps {
  item: FetchData;
  role?: string;
  onPay: (item: FetchData) => void;
  onView: (item: FetchData) => void;
     onInvoice: (item: FetchData) => void;
     onPaymentSuccess:()=>void;

}

export default function RequestCard({ item, role, onPay, onView,onInvoice,onPaymentSuccess}: RequestCardProps) {
  const isRejected = item?.status === 'rejected' || item?.status === 'pending';
  const isPayable = ( item?.status === 'accepted') ;
  const isPaymentSuccess = ( item?.status === 'Completed')
  const otherParty = role === 'worker' ? item?.customer_name : item?.worker_name;

  return (
    <div className="w-[300px] flex flex-col shrink-0 snap-center rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 leading-snug">
          Service request'
        </h3>
        <StatusBadge status={item?.status} />
      </div>

      <p className="mt-1.5 text-sm text-gray-500">
        {otherParty ? `With ${otherParty}` : 'Details unavailable'}
      </p>

      {item?.description && (
        <p className="mt-4 text-sm text-gray-600 line-clamp-3">{item.description || ""}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">
          {item?.total_amount != null ? `₹${item.total_amount}` : '—'}
        </span>
        <span className="text-xs text-gray-400">
          {item?.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
        </span>
      </div>

      <div className="mt-auto pt-5">
                    <div className="flex flex-col gap-2">

        {isRejected ? (
          <button
            onClick={() => onView(item)}
            className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition"
          >
            View request
          </button>
        ) : (

          <div className="flex gap-2">
            {role === 'customer' && isPayable && !isPaymentSuccess &&
             <PayButton onSuccess={() =>  onPaymentSuccess() } label={item.total_amount.toString()} bookingId={Number(item.id)}/>

              
         } 

          {isPaymentSuccess && <button
              onClick={() => onInvoice(item)}
              className="flex-1 rounded-lg border border-teal-600 bg-teal-600 w-48 py-2.5  text-sm font-medium text-white hover:bg-gray-50 hover:text-teal-600 active:scale-[0.98] transition"
            >
              Generate invoice
            </button> } 
          </div>
        )}
        </div>
      </div>
    </div>
  );
}