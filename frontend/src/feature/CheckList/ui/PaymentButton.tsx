// src/components/PayButton.tsx
import { useRazorpay } from "../../../hooks/useRazorpay";
interface Props {
  Flabel?:string;
  label?: string;
  onSuccess?: () => void;
  bookingId:number;

}

export default function PayButton({ Flabel= "Pay " ,label, onSuccess ,bookingId}: Props) {
  const { pay, loading } = useRazorpay();

  return (
    <button
      onClick={() =>
        pay(

          () => onSuccess?.(),
          (msg) => alert(msg) ,  // swap for your toast
          bookingId
        )
      }
      disabled={loading}
 className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 active:scale-[0.98] transition"
    >
      {loading ? "Processing..." : Flabel + label}
    </button>
  );
}