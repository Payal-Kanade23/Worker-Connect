import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Service } from '../../Dashboard/api/dashboard.api';
import { getService, getSlots} from '../api/bookRequest.api';
import type { Slots } from '../api/bookRequest.api';
import { createBooking } from '../api/bookRequest.api';
import toast from 'react-hot-toast';
function BookRequest() {
  const { workerId } = useParams();

  const [service, setService] = useState<Service[]>([]);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [slot, setSlot] = useState<Slots[]>([]);

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchService = async () => {
    try {
      const res = await getService(workerId!);
      setService(res.data);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const fetchSlots = async (selectedDate: string) => {
    try {
      const res = await getSlots(workerId!, selectedDate);
      setHourlyRate(res.data.hourly_rate);
      setSlot(res.data.slots);
      
    } catch (error:any) {
      console.log('Error:', error);
      toast.error("Error:",error)
    }
  };

  useEffect(() => {
    fetchService();
    
  }, []);
  useEffect(() => {
  if (date) fetchSlots(date); // only fetch slots once a date is picked
}, [date]);
  const navigate = useNavigate()

 

  const availableToAdd = useMemo(
    () => service.filter(s => !selectedServices.some(sel => sel.id === s.id)),
    [service, selectedServices]
  );

  const addService = (s: Service) => {
    setSelectedServices(prev => [...prev, s]);
    setDropdownOpen(false);
  };

  const removeService = (id: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== id));
  };

  const estimatedTotal = hourlyRate * 2;
  const todayStr = new Date().toISOString().split('T')[0];

  const canSubmit =
    selectedServices.length > 0 && selectedSlotId !== null && date !== '' && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !workerId || selectedSlotId === null) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await createBooking({
        workerId,
        bookingDate:date,
        timeSlotId: selectedSlotId,
        serviceIds: selectedServices.map(s => s.id),
        description,
      });
      toast.success(res.message)
    

      // navigate(`/bookings/${res.bookingId}`);
    } catch (error: any) {
       
         setError(`Something went wrong sending your request.${error.response?.data?.message }`);
         toast.error(error.response?.data.message)
        fetchSlots(date);
        setSelectedSlotId(null);
    
       
      
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex justify-center px-5 py-12 font-sans text-[#14181f]">
      <button onClick={()=>{
  navigate(-1)
}}>
  ← Back
</button>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white border border-[#e2e5ea] rounded-2xl p-9 flex flex-col gap-7"
      >
        <header>
          <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Request this worker</h1>
          <p className="text-[#7d8695] text-sm">
            Pick what you need done, when, and we'll send your request.
          </p>
        </header>

        {/* Services */}
        <section className="flex flex-col gap-2.5">
          <label className="text-sm font-semibold text-[#3a4250]">Services needed</label>

          <div className="flex flex-wrap gap-2 items-center">
            {selectedServices.map(s => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 bg-[#e7f0eb] text-[#2f5d4c] rounded-full pl-3.5 pr-1.5 py-1.5 text-sm font-medium"
              >
                {s.name}
                <button
                  type="button"
                  onClick={() => removeService(s.id)}
                  aria-label={`Remove ${s.name}`}
                  className="leading-none text-base px-1 py-0.5 rounded-full hover:bg-[#2f5d4c]/15"
                >
                  ×
                </button>
              </span>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(o => !o)}
                disabled={availableToAdd.length === 0}
                className="border border-dashed border-[#7d8695] text-[#3a4250] rounded-full px-3.5 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:border-[#2f5d4c] hover:not-disabled:text-[#2f5d4c]"
              >
                + Add service
              </button>

              {dropdownOpen && availableToAdd.length > 0 && (
                <ul className="absolute top-[calc(100%+6px)] left-0 min-w-[200px] max-h-56 overflow-y-auto bg-white border border-[#e2e5ea] rounded-xl shadow-lg p-1.5 z-10 list-none">
                  {availableToAdd.map(s => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => addService(s)}
                        className="w-full text-left bg-transparent px-2.5 py-2 rounded-md text-sm hover:bg-[#f6f7f9]"
                      >
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {selectedServices.length === 0 && (
            <p className="text-sm text-[#7d8695]">Select at least one service.</p>
          )}
        </section>

        {/* Date */}
        <section className="flex flex-col gap-2.5">
          <label htmlFor="book-date" className="text-sm font-semibold text-[#3a4250]">
            Date
          </label>
          <input
            id="book-date"
            type="date"
            min={todayStr}
            value={date}
            onChange={e => {
              setDate(e.target.value);
              setSelectedSlotId(null);
            }}
            required
            className="border border-[#e2e5ea] rounded-lg px-3 py-2.5 text-sm w-fit"
          />
        </section>

        {/* Slots */}
        <section className="flex flex-col gap-2.5">
          <label className="text-sm font-semibold text-[#3a4250]">Available time</label>

          {!date ? (
            <p className="text-sm text-[#7d8695]">Choose a date to see open slots.</p>
          ) : slot.length === 0 ? (
            <p className="text-sm text-[#7d8695]">No slots configured for this worker.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
              {slot.map(s => {
                const isBusy = s.status === 'busy';
                const isSelected = selectedSlotId === s.timeSlotId;
                return (
                  <button
                    type="button"
                    key={s.timeSlotId}
                    disabled={isBusy}
                    onClick={() => setSelectedSlotId(s.timeSlotId)}
                    className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium border
                      ${isSelected
                        ? 'bg-[#2f5d4c] border-[#2f5d4c] text-white'
                        : isBusy
                        ? 'bg-[#f6f7f9] border-[#e2e5ea] text-[#7d8695] cursor-not-allowed'
                        : 'bg-white border-[#e2e5ea] text-[#14181f] hover:border-[#2f5d4c]'}`}
                  >
                    {s.label}
                    {isBusy && (
                      <span className="text-xs text-[#b3432f]">Booked</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {hourlyRate > 0 && (
            <p className="text-sm text-[#3a4250]">
              Rate: ₹{hourlyRate}/hr · Est. total for this slot:{' '}
              <strong>₹{estimatedTotal}</strong>
            </p>
          )}
        </section>

        {/* Description */}
        <section className="flex flex-col gap-2.5">
          <label htmlFor="book-desc" className="text-sm font-semibold text-[#3a4250]">
            Describe the work
          </label>
          <textarea
            id="book-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What needs doing? Any details the worker should know before accepting."
            rows={4}
            className="border border-[#e2e5ea] rounded-lg p-3 text-sm resize-y placeholder:text-[#7d8695]"
          />
        </section>

        {error && (
          <p className="bg-[#fbeae6] text-[#b3432f] px-3.5 py-2.5 rounded-lg text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-[#2f5d4c] text-white rounded-lg py-3.5 text-sm font-semibold disabled:bg-[#7d8695] disabled:cursor-not-allowed enabled:hover:bg-[#244a3d]"
        >
          {submitting ? 'Sending request…' : 'Send request'}
        </button>
      </form>
    </div>
  );
}

export default BookRequest;