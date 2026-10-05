import API from "../../../../api";

interface InvoiceResponse{
    success:boolean,
    message:string,
    data: {
        id: number,
        invoice_number:string
    }
}
export const createInvoice = async (bookingId: string) => {
  
    const response = await API.post(
      `/api/invoice/${bookingId}`
    );

    return response.data
};
export const downloadInvoice = async (invoiceId: string , c_id:string , w_id:string , b_id:string) => {
  try {
    const response = await API.get(
      `/api/invoice/${invoiceId}/pdf`,
      
      {
          params: {
          c_id,
          w_id,
          b_id,
        },
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `invoice-${invoiceId}.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Invoice download failed:", error);
  }
};