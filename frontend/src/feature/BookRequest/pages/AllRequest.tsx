import React, { useState, useEffect } from 'react';
import { acceptRequest, getBookRequest, rejectRequest, type FetchData } from '../api/bookRequest.api';
import { useAuth } from '../../../context/authContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  Theme: a dispatch board where every booking reads as a paper       */
/*  work-order ticket, stamped with its status. Colors/fonts/animation */
/*  live in tailwind.config.js (see tailwind.config.snippet.js) —      */
/*  this file uses Tailwind utility classes only. The only values set  */
/*  via the style prop are ones computed from runtime state (expand    */
/*  height, tab-underline position, per-item stagger delay), which     */
/*  Tailwind's static compiler can't generate classes for.             */
/* ------------------------------------------------------------------ */

type Status = FetchData['status'];

const STATUS_STYLES: Record<Status, string> = {
  pending: 'text-amber border-amber bg-amber/10',
  accepted: 'text-moss border-moss bg-moss/10',
  rejected: 'text-brick border-brick bg-brick/10',
};

const STATUS_DOT: Record<Status, string> = {
  pending: 'bg-amber',
  accepted: 'bg-moss',
  rejected: 'bg-brick',
};

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

function formatAmount(amount?: number) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date?: string) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ------------------------------- Stamp ------------------------------ */

function StatusStamp({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex -rotate-3 items-center rounded-sm border-2 px-2.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ------------------------------ Ticket ------------------------------- */

interface TicketProps {
  request: FetchData;
  isWorker: boolean;
  expanded: boolean;
  onToggle: () => void;
  rejecting: boolean;
  onStartReject: () => void;
  onCancelReject: () => void;
  reasonValue: string;
  onReasonChange: (v: string) => void;
  onConfirmReject: () => void;
  onAccept: () => void;
  index: number;
}

function Ticket({
  request,
  isWorker,
  expanded,
  onToggle,
  rejecting,
  onStartReject,
  onCancelReject,
  reasonValue,
  onReasonChange,
  onConfirmReject,
  onAccept,
  index,
}: TicketProps) {
  const headline = isWorker
    ? `Job from ${request.customer_name ?? 'a customer'}`
    : `Sent to ${request.worker_name ?? 'a worker'}`;

  return (
    <div
      className="animate-rise motion-reduce:animate-none rounded-md bg-black shadow-lg shadow-black/30"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="rounded-t-md bg-[repeating-linear-gradient(90deg,rgba(28,32,39,0.35)_0px,rgba(28,32,39,0.35)_7px,transparent_7px,transparent_14px)] bg-[length:14px_1px] bg-repeat-x h-px" />

      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-[15px] font-semibold text-paper">{headline}</h3>
            <p className="mt-0.5 text-xs text-paper">
              Request #{String(request.id).slice(-6)} · {formatDate(request.created_at)}
            </p>
          </div>
          <StatusStamp status={request.status} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={onToggle}
            className="text-xs font-medium text-paper underline-offset-2 hover:underline"
          >
            {expanded ? 'Hide details' : 'View details'}
          </button>
          <span className="font-display text-sm font-semibold text-paper">
            {formatAmount(request.total_amount)}
          </span>
        </div>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-paper-text/15 pt-3 text-[13px] text-paper">
              <p>Worker NAME: <span className="text-paper">{request.customer_name} </span></p>
              <p>Customer NAME: <span className="text-paper">{request.worker_name}</span></p>

              {request.rejection_reason && (
                <p className="col-span-2 text-paper">Rejected: {request.rejection_reason}</p>
              )}

            </div>
              <p>Description: <span className="text-paper">{request.description}</span></p>

          </div>
        </div>

        {isWorker && request.status === 'pending' && (
          <div className="mt-4 border-t border-paper pt-3">
            {!rejecting ? (
              <div className="flex gap-2">
                <button
                  onClick={onAccept}
                  className="flex-1 rounded-sm bg-white px-3 py-1.5 text-[13px] font-semibold text-brick transition-transform active:scale-[0.98]"
                >
                  Accept
                </button>
                <button
                  onClick={onStartReject}
                  className="flex-1 rounded-sm border border-brick px-3 py-1.5 text-[13px] font-semibold text-white transition-transform active:scale-[0.98]"
                >
                  Decline
                </button>
              </div>
            ) : (
              <div>
                <textarea
                  value={reasonValue}
                  onChange={(e) => onReasonChange(e.target.value)}
                  placeholder="Let the customer know why you're declining"
                  rows={2}
                  className="w-full rounded-sm border border-paper-text/25 bg-white px-3 py-2 text-[13px] text-paper-text outline-none focus:ring-1 focus:ring-brick"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={onConfirmReject}
                    disabled={!reasonValue.trim()}
                    className="flex-1 rounded-sm bg-brick px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-40"
                  >
                    Confirm decline
                  </button>
                  <button
                    onClick={onCancelReject}
                    className="rounded-sm px-3 py-1.5 text-[13px] font-medium text-paper"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Timeline entry --------------------------- */

function TimelineEntry({ request, isWorker, isLast }: { request: FetchData; isWorker: boolean; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const who = isWorker ? request.customer_name : request.worker_name;

  return (
    <div className="relative flex gap-4 pb-6">
      <div className="flex flex-col items-center">
        
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[request.status]}`} />
        {!isLast && <span className="mt-1 w-px flex-1 bg-panel-line" />}
      </div>
      <div className="flex-1 pb-1">
        <button onClick={() => setOpen((o) => !o)} className="w-full text-left">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] text-slate">
              <span className="font-display font-semibold text-slate">{STATUS_LABEL[request.status]}</span>{' '}
              — {isWorker ? `Got a job from ${who ?? 'a customer'}` : `Booked a request to ${who ?? 'a worker'}`}
            </p>
            <span className="whitespace-nowrap text-xs text-slate">{formatDate(request.created_at)}</span>
          </div>
        </button>
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
          style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="mt-2 rounded-md bg-panel p-3 text-[13px]">
              <p className="text-slate">Amount: {formatAmount(request.total_amount)}</p>
              {request.rejection_reason && <p className="mt-1 text-brick">Reason: {request.rejection_reason}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Skeleton -------------------------------- */

function TicketSkeleton() {
  return <div className="h-28 animate-pulse rounded-md bg-panel" />;
}

/* --------------------------------- Main ---------------------------------- */

function AllRequest() {
  const [request, setRequest] = useState<FetchData[]>([]);
  const [prevRequest, setPrevRequest] = useState<FetchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'open' | 'history'>('open');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const navigate = useNavigate()

  const { user } = useAuth();
  const isWorker = user?.role === 'worker';

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await getBookRequest();
      setRequest(res.data.filter((item) => item.status === 'pending'));
            console.log("=================",request)

      setPrevRequest(res.data.filter((item) => item.status !== 'pending'));
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const res = await acceptRequest(id);
      fetchRequest();
      toast.success(res.message);
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await rejectRequest(id, reason);
      setRejectingId(null);
      setReason('');
      fetchRequest();
      toast.success(res.message);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRequest();
                console.log("=================",request)

  }, []);

  const heading = isWorker ? 'Your dispatch board' : 'Your requests';
  const subheading = isWorker
    ? 'New jobs from customers .'
    : 'Track the work you\u2019ve sent out.';

  return (
    <div className="min-h-screen bg-ink font-body text-slate">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <button onClick={()=>{
  navigate(-1)
}}>
  ← Back
</button>
        <header className="mb-8">
          <p className="text-xs text-slate">{user?.name ? `Welcome, ${user.name}` : 'Welcome'}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-black">{heading}</h1>
          <p className="mt-1 text-sm text-slate">{subheading}</p>
        </header>

        <div className="relative mb-6 flex gap-6 border-b border-panel-line">
          <button
            onClick={() => setTab('open')}
            className={`pb-3 font-display text-sm font-semibold ${tab === 'open' ? 'text-slate' : 'text-gray-400' }`}
          >
            Open requests {request.length > 0 && <span className="text-amber">({request.length})</span>}
          </button>
          <button
            onClick={() => setTab('history')}
            className={`pb-3 font-display text-sm font-semibold ${tab === 'history' ? 'text-slate' :'text-gray-400' }`}
          >
            Recent updates
          </button>
          <span
            className="absolute bottom-0 left-0 h-0.5 w-28 bg-amber transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(${tab === 'open' ? 0 : 148}px)` }}
          />
        </div>

        {tab === 'open' && (
          <div className="space-y-3">
            {loading && (
              <>
                <TicketSkeleton />
                <TicketSkeleton />
              </>
            )}

            {!loading && request.length === 0 && (
              <div className="rounded-md border border-dashed border-panel-line p-8 text-center">
                <p className="font-display text-sm font-semibold text-slate">Nothing waiting on the board</p>
               
              </div>
            )}

            {!loading &&
              request.map((item, index) => (
                <Ticket
                  key={item.id}
                  request={item}
                  isWorker={isWorker}
                  index={index}
                  expanded={expandedId === item.id}
                  onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  rejecting={rejectingId === item.id}
                  onStartReject={() => {
                    setRejectingId(item.id);
                    setReason('');
                  }}
                  onCancelReject={() => {
                    setRejectingId(null);
                    setReason('');
                  }}
                  reasonValue={rejectingId === item.id ? reason : ''}
                  onReasonChange={setReason}
                  onConfirmReject={() => handleReject(item.id)}
                  onAccept={() => handleAccept(item.id)}
                />
              ))}
          </div>
        )}

        {tab === 'history' && (
          <div className="rounded-md bg-panel p-5">
            {prevRequest.length === 0 ? (
              <p className="text-sm text-slate">No past activity yet.</p>
            ) : (
              prevRequest.map((item, index) => (
                <TimelineEntry key={item.id} request={item} isWorker={isWorker} isLast={index === prevRequest.length - 1} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllRequest;
