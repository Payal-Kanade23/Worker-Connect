import React, { useMemo, useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { get_one_worker } from "../api/dashboard.api";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  ShieldQuestion,
  Clock,
  MapPin,
  Star,
  Briefcase,
  Wallet,
  CalendarDays,
  Navigation,
  CircleDot,
  Wrench,
  Zap,
  Droplet,
  Hammer,
  PaintBucket,
  Fan,
  Construction,
} from "lucide-react";
import { useParams } from "react-router-dom";
import type { Worker } from "../api/dashboard.api";
import { useNavigate } from "react-router-dom";


/* ------------------------------------------------------------------ */
/* Sample data — shaped exactly like the worker records supplied.     */
/* Swap this array for a real fetch() result; nothing else needs to   */
/* change.                                                             */
/* ------------------------------------------------------------------ */

 


/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const initials = (name = ""): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const AVATAR_HUES = ["#0F5B54", "#8A4B12", "#3D4F7D", "#7A2E3B", "#4B5A1F"];
const hueFor = (id = ""): string => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % AVATAR_HUES.length;
  return AVATAR_HUES[h];
};

const formatTime = (t?: string | null): string => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = ((hour + 11) % 12) + 1;
  return `${hour12}:${m} ${suffix}`;
};

const formatDate = (iso:string): string =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatRate = (rate: string | number): string =>
  `₹${Number(rate).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EMPLOYMENT_LABEL: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
};

/* Static map image (no iframe, so it isn't subject to the host site's  */
/* frame-embedding policy). Zoom is picked so the service radius fits   */
/* comfortably inside the frame.                                        */
const zoomForRadius = (radiusKm: number): number => {
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 10) return 12;
  if (radiusKm <= 20) return 11;
  if (radiusKm <= 40) return 10;
  return 9;
};

const buildMapSrc = (lat: number, lon: number, radiusKm: number): string => {
  const zoom = zoomForRadius(radiusKm);
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat}%2C${lon}&zoom=${zoom}&size=640x320&maptype=mapnik&markers=${lat}%2C${lon}%2Cred-pushpin`;
};

/* Best-effort icon for a service name */
const SERVICE_ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/electric/i, Zap],
  [/plumb/i, Droplet],
  [/carpent|wood/i, Hammer],
  [/paint/i, PaintBucket],
  [/mason|brick|construct/i, Construction],
  [/appliance|hvac|ac\b|fan/i, Fan],
];
const iconForService = (name = ""): LucideIcon => {
  const match = SERVICE_ICON_RULES.find(([re]) => re.test(name));
  return match ? match[1] : Wrench;
};


/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
const Avatar = ({ worker, size = 72 }: { worker: Worker; size?: number }) => {
  const dim = { width: size, height: size };
  if (worker?.profile_image) {
    return (
      <img
        src={worker?.profile_image}
        alt={worker?.name}
        style={dim}
        className="rounded-xl object-cover ring-1 ring-black/10"
      />
    );
  }
  return (
    <div
      style={{ ...dim, backgroundColor: hueFor(worker?.user_id) }}
      className="rounded-xl flex items-center justify-center text-white font-semibold ring-1 ring-black/10"
    >
      <span style={{ fontSize: size * 0.34 }}>{initials(worker?.name) || <User size={size * 0.4} />}</span>
    </div>
  );
};

const StatusPill = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
      active ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
    }`}
  >
    <CircleDot size={12} className={active ? "text-emerald-500" : "text-slate-400"} />
    {active ? "Active" : "Inactive"}
  </span>
);

const VerifiedPill = ({ verified }: { verified: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
      verified ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
    }`}
  >
    {verified ? <ShieldCheck size={12} /> : <ShieldQuestion size={12} />}
    {verified ? "Verified" : "Unverified"}
  </span>
);

interface FieldProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}

const Field = ({ icon: Icon, label, value }:FieldProps) => (
  <div className="flex items-start gap-2.5">
    <div className="mt-0.5 shrink-0 rounded-md bg-slate-100 p-1.5 text-slate-500">
      <Icon size={14} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="truncate text-sm font-medium text-slate-800">{value}</p>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Map card with animated radius pulse                                 */
/* ------------------------------------------------------------------ */
const RadiusMap = ({ worker }:{ worker: Worker }) => {
  const [failed, setFailed] = useState(false);
  const src = useMemo(
    () => buildMapSrc(worker?.latitude, worker?.longitude, worker?.service_radius_km),
    [worker?.latitude, worker?.longitude, worker?.service_radius_km]
  );

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
      <div className="relative h-64 w-full bg-slate-100">
        {!failed ? (
          <img
            key={worker?.user_id}
            src={src}
            alt={`Map showing ${worker?.name}'s service area`}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          /* Fallback: a lightweight radar-style visual, no external map needed */
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle,_#f1f5f9_1px,_transparent_1px)] [background-size:16px_16px]" />
        )}

        {/* Animated service-radius overlay, centered on the marker */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="absolute h-16 w-16 animate-ping rounded-full bg-amber-500/30" />
          <span className="absolute h-16 w-16 rounded-full ring-2 ring-amber-500/70" />
          <span className="h-2 w-2 rounded-full bg-amber-600 ring-4 ring-white" />
        </div>

        {/* Coordinate / radius legend */}
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-lg bg-white/90 px-2.5 py-1.5 font-mono text-[11px] text-slate-600 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-1.5">
            <Navigation size={11} className="text-amber-600" />
            {worker?.latitude?.toFixed(5)}, {worker?.longitude?.toFixed(5)}
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-2 right-2 rounded-lg bg-amber-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm">
          {worker?.service_radius_km} km radius
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Detail panel                                                        */
/* ------------------------------------------------------------------ */
const WorkerDetail = ({ worker }:{ worker: Worker }) =>{
  const navigate = useNavigate()
  return (
  <div key={worker?.user_id} className="animate-[fadeIn_.25s_ease-out] space-y-5">
    {/* Header: image beside personal details */}
    <button onClick={()=>{
  navigate(-1)
}}>
  ← Back
</button>
    <div className="rounded-2xl bg-
    white p-5 ring-1 ring-slate-200">
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-3 sm:items-start">
          <Avatar worker={worker} size={84} />
          <div className="flex flex-wrap gap-1.5">
            <StatusPill active={worker?.is_active} />
            <VerifiedPill verified={worker?.is_verified} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-xl font-semibold text-slate-900">{worker?.name}</h2>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-medium capitalize text-white">
              {worker?.role}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <Field icon={Mail} label="Email" value={worker?.email} />
            <Field icon={Phone} label="Phone" value={worker?.phone} />
            <Field icon={CalendarDays} label="Joined" value={formatDate(worker?.created_at)} />
            <button className="mt-0.5 shrink-0 rounded-md bg-[rgb(75,90,31)]  p-1.5 text-white"><Link to={`/book/worker/${worker.worker_id}`}>Book a Service</Link></button>
          </div>
        </div>
      </div>
    </div>

    {/* Worker-specific details, below the header block */}
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Briefcase size={15} className="text-amber-600" />
        Worker details
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
        <Field icon={Briefcase} label="Employment" value={EMPLOYMENT_LABEL[worker?.employment_type] ?? worker?.employment_type} />
        <Field icon={Wallet} label="Hourly rate" value={formatRate(worker?.hourly_rate)} />
        <Field icon={Clock} label="Hours / day" value={`${worker?.hour_per_day} hrs`} />
        <Field
          icon={Clock}
          label="Availability"
          value={`${formatTime(worker?.available_from)} – ${formatTime(worker?.available_to)}`}
        />
        <Field icon={Star} label="Rating" value={`${worker?.rating_avg} / 5`} />
      </div>
    </div>

    {/* Services offered — its own section, each with a representative icon */}
    {worker?.services?.length > 0 && (
      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Wrench size={15} className="text-amber-600" />
          Services offered
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {worker?.services.map((s, i) => {
            const Icon = iconForService(s.name);
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200"
              >
                <div className="shrink-0 rounded-lg bg-white p-1.5 text-amber-600 ring-1 ring-slate-200">
                  <Icon size={16} />
                </div>
                <span className="truncate text-sm font-medium text-slate-700">{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* Map + animated service radius */}
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <MapPin size={15} className="text-amber-600" />
        Service area
      </h3>
      <RadiusMap worker={worker} />
    </div>
  </div>
);

} 
/* ------------------------------------------------------------------ */
/* Root — this page is landed on directly (e.g. from a "View profile"  */
/* action elsewhere), so it renders one worker's full profile.         */
/* Pass the worker record in as a prop from your router/data fetch;    */
/* the sample record is only a fallback for preview purposes.          */
/* ------------------------------------------------------------------ */
export default function WorkerProfile() {

  const {userId} = useParams()
  const [worker ,setWorker ] = useState<Worker>();
  const [loading , setLoading]= useState(false)

   useEffect(() => {
      fetchWorker();
    }, [userId]);
  
    const fetchWorker = async () => {
      try {
        setLoading(true);
        const res = await get_one_worker(userId!);
        console.log(res.data)
        setWorker(res.data);
        
      } catch (error) {
        console.log('error:', error);
      } finally {
        setLoading(false);
      }
    };
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="mx-auto max-w-3xl">
        {loading ? (
  <div>Loading...</div>
) : worker ? (
  <WorkerDetail worker={worker} />
) : (
  <div>Worker not found</div>
)}
      </div>
    </div>
  );
}
