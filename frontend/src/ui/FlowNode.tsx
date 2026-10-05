import { useState , useRef , useEffect } from "react";
type FlowStep = { label: string; detail: string };

export const sharedSteps: FlowStep[] = [
  { label: 'User', detail: 'Anyone joining Worker Connect' },
  { label: 'Login', detail: 'One account, two paths' },
];

export const workerPath: FlowStep[] = [
  { label: 'Worker', detail: 'Set your rate, skills, and hours' },
  { label: 'Find a job', detail: 'Matched to nearby requests' },
  { label: 'Get paid', detail: 'Online or cash, tracked either way' },
];

export const customerPath: FlowStep[] = [
  { label: 'Customer', detail: 'Post what you need done' },
  { label: 'Book a service', detail: 'Pick a worker, set a time' },
  { label: 'Anytime, anywhere', detail: 'Track it live until it\u2019s done' },
];

export const accentClasses = {
  amber: { dot: 'bg-amber shadow-[0_0_0_4px_rgba(232,163,61,0.15)]', title: 'text-amber' },
  teal: { dot: 'bg-teal shadow-[0_0_0_4px_rgba(79,166,151,0.15)]', title: 'text-teal' },
};


function FlowNode({
  step,
  accent,
  index,
  isFirst,
}: {
  step: FlowStep;
  accent?: 'amber' | 'teal';
  index: number;
  isFirst?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { root: el.closest('.flow-scroll'), threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dotColor = accent ? accentClasses[accent].dot : 'bg-paper';

  return (
    <div
      ref={ref}
      className={`relative flex items-start gap-4 min-h-[4.2rem] transition-all duration-500 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-25 -translate-x-1'
      }`}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      {!isFirst && (
        <span
          className={`absolute left-[0.35rem] -top-6 w-0.5 h-6 bg-white/15 origin-top transition-transform duration-500 delay-100 ${
            visible ? 'scale-y-100' : 'scale-y-0'
          }`}
        />
      )}
      <span
        className={`w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0 transition-colors duration-400 ${
          visible ? dotColor : 'bg-white/25'
        }`}
      />
      <div>
        <p className="font-display font-semibold text-base text-paper m-0">{step.label}</p>
        <p className="text-sm text-paper/50 mt-1 m-0">{step.detail}</p>
      </div>
    </div>
  );
}
 export default FlowNode;

