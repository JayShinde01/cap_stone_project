import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../page_style/home.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import {
  Typography, Card, Row, Col, Spin, Table, Statistic, Divider, DatePicker, Space,
} from "antd";
import {
  RiseOutlined, ShoppingOutlined, TeamOutlined, DollarOutlined, CalendarOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { fetchItems } from "../services/itemService";
  import { getCustomers } from "../services/customerService";
import { getSalesInvoices } from "../services/salesService";
const { Title } = Typography;
const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#845EC2", // Purple
  "#FF6F91", // Pink
  "#2C73D2", // Light Blue
  "#FFC75F", // Light Orange
  "#D65DB1", // Magenta
  "#FF9671", // Light Coral
  "#008E9B", // Cyan
  "#B39CD0", // Lavender
  "#4B4453", // Dark Gray
  "#FFC300", // Bright Yellow
  "#6A0572", // Dark Purple
];


const Home = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());

  

  useEffect(() => {

    const fetchDashboardData = async () => {
      try {
        
        
       const customerRes = await getCustomers();
       const itemRes = await fetchItems ();
       const salesRes = await getSalesInvoices();
        console.log(itemRes);
        

        setSales(salesRes.invoices || []);
        setCustomers(customerRes || []);
        setItems(itemRes || []);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setDate(today.getDate() - 30);

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    console.log(`${year}-${month}-${day}`);
    
    return `${year}-${month}-${day}`;
  };
console.log(sales);

  const salesData = sales.map((sale) => ({
    date: sale.invoice_date,
    amount: parseFloat(sale.paid_amount),
  }));
console.log(salesData);

  const getTotalSales = (filterFn) =>
    salesData.filter(filterFn).reduce((sum, sale) => sum + sale.amount, 0);

  const totalTodaySales = getTotalSales(
    (s) => formatDate(s.date) === formatDate(today)
  );

  const totalYesterdaySales = getTotalSales((s) => {
    const y = new Date(today);
    y.setDate(today.getDate() - 1);
    return formatDate(s.date) === formatDate(y);
  });

  const totalLastMonthSales = getTotalSales(
    (s) => new Date(s.date) >= lastMonth
  );

  const salesChartData = [
    { date: "Today", amount: totalTodaySales },
    { date: "Yesterday", amount: totalYesterdaySales },
    { date: "Last 30 Days", amount: totalLastMonthSales },
  ];

  const itemStockCounts = items
    .filter((item) => item.itemName)
    .map((item) => ({
      name: item.itemName,
      count: item.stock || 0,
    }));

  const sortedItems = [...items]
    .filter((item) => item.itemName)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0));

  const columns = [
    { title: "Item", dataIndex: "itemName", key: "itemName" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
  ];

  const totalSalesOnDate = getTotalSales(
    (s) => formatDate(s.date) === formatDate(selectedDate)
  );

  return (
    <div className="home-container">
      <Sidebar />
      <div className="home-content">
        <Title level={2} style={{ textAlign: "center" }}>
          Dashboard Overview
        </Title>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
            <Spin size="large" tip="Loading Dashboard..." />
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Today's Sales"
                    value={totalTodaySales}
                    prefix={<RiseOutlined />}
                    precision={2}
                    valueStyle={{ color: "#3f8600" }}
                    suffix="₹"
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Total Customers"
                    value={customers.length}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Statistic
                    title="Items Available"
                    value={items.length}
                    prefix={<ShoppingOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Card title="Sales Overview">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#1890ff" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={12} lg={8}>
                <Card title="Customer Bar Chart">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[{ name: "Customers", total: customers.length }]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#9254de" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={24} lg={8}>
                <Card title="Item Stock Pie">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={itemStockCounts}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {itemStockCounts.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

           <Card title="📅 Total Sales on Selected Date" style={{ marginTop: 24, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
  <Space direction="vertical" style={{ width: "100%" }}>
    <DatePicker
      value={selectedDate}
      onChange={setSelectedDate}
      style={{ width: "100%" }}
      suffixIcon={<CalendarOutlined />}
    />

    <Statistic
      title={`Sales on ${moment(selectedDate).format("Do MMM YYYY")}`}
      value={totalSalesOnDate.toFixed(2)}
      prefix="="
      valueStyle={{ color: "#3f8600", fontWeight: 600 }}
      suffix="₹"
    />
  </Space>
</Card>

            <Card title="Items Sorted by Stock" style={{ marginTop: 24 }} bordered>
              <Table
                dataSource={sortedItems}
                columns={columns}
                rowKey="itemName"
                pagination={{ pageSize: 6 }}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
