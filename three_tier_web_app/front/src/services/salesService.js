import axios from "axios";

const BASE_URL = "http://localhost:3000/api/sales";

// ✅ Create a new sales invoice
export const createSalesInvoice = async (invoiceData) => {
  try {
    const response = await axios.post(BASE_URL, invoiceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create invoice");
  }
};

// ✅ Get all sales invoices
export const getSalesInvoices = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch sales invoices");
  }
};

// ✅ Update stock after sale (used separately)
export const updateItemStock = async (productId, quantitySold) => {
  try {
    console.log(productId);
    console.log(quantitySold);
    
    
    const response = await axios.put(
      `http://localhost:3000/api/items/update-stock/${productId}`,
      { quantitySold }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update item stock");
  }
};
