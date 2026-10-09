import axios from "axios";

const API_URL = "http://localhost:3000/api/customer";

export const getCustomers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addCustomer = async (customer) => {
  const response = await axios.post(API_URL, customer);
  return response.data;
};

export const updateCustomer = async (customerId, customer) => {
  console.log(customerId);
  console.log(customer);
  
  const response = await axios.put(`${API_URL}/${customerId}`, customer);
  return response.data;
};

export const deleteCustomer = async (customerId) => {
  const response = await axios.delete(`${API_URL}/${customerId}`);
  return response.data;
};

// Function to get customer data by mobile number
export const getCustomerById = async (phoneMobile) => {
  try {
    const response = await axios.get(`${API_URL}/${phoneMobile}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer by phone number:", error);
    throw error;
  }
};
