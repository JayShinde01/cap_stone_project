import React, { useState, useEffect, useCallback } from "react";
import { Tabs, Table, Input, Button, Typography, message } from "antd";
import Sidebar from "../components/Sidebar";
import { fetchItems } from "../services/itemService";
import { getCustomers } from "../services/customerService";
import axios from "axios";
import { debounce } from "lodash";
import "../page_style/Search.css";
import { getSalesInvoices } from "../services/salesService";

const { TabPane } = Tabs;
const { Title } = Typography;
const { Search } = Input;

const BASE_URL = "http://localhost:3000/api";

const InventorySearch = () => {
  const [activeTab, setActiveTab] = useState("Item");
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    try {
      const result = await fetchItems();
      setItems(result);
    } catch (error) {
      message.error("Error fetching items");
      console.error(error);
    }
  };

  const loadCustomers = async () => {
    try {
      const result = await getCustomers();
      setCustomers(result);
    } catch (error) {
      message.error("Error fetching customers");
      console.error(error);
    }
  };

  const loadSales = async () => {
    try {
      const res = await getSalesInvoices();
      setSales(res.invoices || []);
    } catch (error) {
      message.error("Error fetching sales");
      console.error(error);
    }
  };



  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([loadItems(), loadCustomers(), loadSales()]);
    setLoading(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const staticData = {
    Purchase: [
      { id: 301, supplier: "MNO Pvt Ltd", date: "2025-03-01", amount: 4000, status: "Completed" },
      { id: 302, supplier: "DEF Corp", date: "2025-03-02", amount: 3500, status: "Pending" },
    ],
  };

  const data = {
    Item: items,
    Customer: customers,
    Sale: sales,
    Vendor: vendors,
    ...staticData,
  };

  // Debounced search input handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const filteredData = data[activeTab]?.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const generateColumns = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return [];
    const keys = Object.keys(dataArray[0]);
    return keys.map((key) => ({
      title: key.toUpperCase(),
      dataIndex: key,
      key,
      render: (text) => {
        if (key === "products") {
          let products = text;
          if (!Array.isArray(products)) {
            try {
              products = JSON.parse(products);
            } catch {
              return "Invalid Products";
            }
          }
          return Array.isArray(products)
            ? products.map((p) => p.itemName).join(", ")
            : "Invalid Products";
        }
        return text?.toString();
      },
      sorter: (a, b) => {
        if (typeof a[key] === "number" && typeof b[key] === "number") {
          return a[key] - b[key];
        }
        return a[key]?.toString().localeCompare(b[key]?.toString());
      },
    }));
  };

  return (
    <div className="maindiv">
      <Sidebar />
      <div className="container">
        <Title level={3} className="search_title">Search Inventory</Title>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setSearchTerm("");
          }}
          centered
          style={{ marginBottom: 16 }}
        >
          {Object.keys(data).map((tab) => (
            <TabPane tab={tab} key={tab} />
          ))}
        </Tabs>

        <div className="top-bar">
          <Search
            placeholder={`Search ${activeTab}...`}
            onChange={(e) => debouncedSearch(e.target.value)}
            allowClear
            enterButton
            style={{ maxWidth: 400 }}
          />
          <Button onClick={handleRefresh} loading={loading} type="primary">
            Refresh
          </Button>
        </div>

        <div className="table-container">
          <Table
            columns={generateColumns(filteredData)}
            dataSource={filteredData}
            rowKey={(record, index) => record.id || record._id || index}
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "No results found" }}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>
    </div>
  );
};

export default InventorySearch;
