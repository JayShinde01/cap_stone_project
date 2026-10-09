// src/services/itemService.js
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/items";


//fetch all items from the database
export const fetchItems = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};


//add item in database
export const addItem = async (item) => {
  console.log(item);
  
  return await axios.post(BASE_URL, item, {
    headers: { "Content-Type": "application/json" },
  });
};


//update item in database
export const updateItem = async (id, item) => {
  console.log("in updateservice");
  
  return await axios.put(`${BASE_URL}/${id}`, item, {
    headers: { "Content-Type": "application/json" },
  });
};


//delets single item in database
export const deleteItem = async (id) => {
  console.log(id);
  
  return await axios.delete(`${BASE_URL}/${id}`);
};


// Fetch a single item by itemNumber
export const fetchItemByNumber = async (itemNumber) => {
  const res = await axios.get(`${BASE_URL}/${itemNumber}`);
  return res.data;
};



