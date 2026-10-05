import { useEffect } from "react";
import type { FetchData } from "../../BookRequest/api/bookRequest.api";
type Props = {
  item: FetchData;
  onClose: () => void;
};
 export default function DetailModal({ item, onClose ,  }: Props) {
  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 8, padding: 24,
          width: 500, maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        <div className="flex justify-between h-5 bg-teal-600 p-5 rounded-lg text-center items-center text-white" 
>          <h3>Request Details</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <table style={{ width: '100%' }}>
          <tbody>
            {Object.entries(item).map(([key, value]) => (
              <tr key={key}>
                <td style={{ fontWeight: 600, padding: '6px 8px' }}>{key}</td>
                <td style={{ padding: '6px 8px' }}>
                  {typeof value === 'object' && value !== null
                    ? JSON.stringify(value)
                    : String(value ?? '-')}
                </td>
              </tr>
            ))}
             
          </tbody>
        </table>
      </div>
    </div>
  );
}
