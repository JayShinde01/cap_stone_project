import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { getCustomers } from "../services/customerService";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { DownloadTableExcel } from "react-export-table-to-excel";
import {
  Layout,
  Typography,
  Tabs,
  DatePicker,
  Button,
  Table,
  Space,
  message,
} from "antd";
import dayjs from "dayjs";
import "../page_style/Report.css";
import { getSalesInvoices } from "../services/salesService";

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const Report = () => {
  const [activeTab, setActiveTab] = useState("Sale");
  const [dateRange, setDateRange] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const tableRef = useRef(null);
  
  const loadSales = async () => {
    try {
      const res =  await getSalesInvoices();
      setSales(res.invoices || []);
    } catch (error) {
      message.error("Error fetching sales");
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res);
    } catch (error) {
      message.error("Error fetching customers");
    }
  };

 

  
  const handleRefresh = () => {
    loadSales();
    loadCustomers();
   
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const data = {
    Sale: sales,
    Customer: customers,
   
  };

  const filteredData = Array.isArray(data[activeTab])
    ? data[activeTab].filter((entry) => {
        if (!dateRange || dateRange.length !== 2) return true;

        let dateKey = null;
        if (activeTab === "Sale") dateKey = "saleDate";
        
        else if (activeTab === "Customer") dateKey = "createdAt";
   

        if (!dateKey || !entry[dateKey]) return true;

        const entryDate = dayjs(entry[dateKey]);
        return (
          entryDate.isSameOrAfter(dayjs(dateRange[0]), "day") &&
          entryDate.isSameOrBefore(dayjs(dateRange[1]), "day")
        );
      })
    : [];

  const handleExportPDF = () => {
  const doc = new jsPDF("landscape"); // Use landscape for wider tables

  const title = `${activeTab} Report`;
  doc.setFontSize(18);
  doc.text(title, 14, 15);

  const tableColumn = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];
  const tableRows = filteredData.map((item) =>
    tableColumn.map((key) => {
      const value = item[key];
      if (Array.isArray(value)) {
        return value.map((v) => (typeof v === "object" ? v?.itemName : v)).join(", ");
      } else if (typeof value === "object" && value !== null) {
        return JSON.stringify(value);
      }
      return value !== undefined && value !== null ? value.toString() : "";
    })
  );

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      overflow: 'linebreak',
      halign: 'center',
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 10 },
    didDrawPage: (data) => {
      doc.setFontSize(10);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        data.settings.margin.left,
        pageHeight - 5
      );
    },
  });

  doc.save(`${activeTab}_report.pdf`);
};


  const columns =
    filteredData.length > 0
      ? Object.keys(filteredData[0]).map((key) => ({
          title: key.toUpperCase(),
          dataIndex: key,
          key: key,
          render: (value) => {
            if (Array.isArray(value)) {
              return value
                .map((v) => (typeof v === "object" ? v?.itemName : v))
                .join(", ");
            } else if (typeof value === "object" && value !== null) {
              return JSON.stringify(value);
            }
            return value;
          },
        }))
      : [];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout style={{ padding: "24px" }}>
        <Content
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            📊 Reports
          </Title>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setDateRange([]);
            }}
          >
            {Object.keys(data).map((tab) => (
              <TabPane tab={tab} key={tab} />
            ))}
          </Tabs>

          <Space wrap style={{ marginBottom: 16 }}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates || [])}
              format="YYYY-MM-DD"
            />
            <Button onClick={handleRefresh}>🔁 Refresh</Button>
            <Button onClick={() => setDateRange([])} danger>
              ❌ Clear
            </Button>
            <DownloadTableExcel
              filename={`${activeTab}_report`}
              sheet={`${activeTab}_sheet`}
              currentTableRef={tableRef.current}
            >
              <Button type="primary">📥 Export to Excel</Button>
            </DownloadTableExcel>
            <Button type="primary" onClick={handleExportPDF}>
              🧾 Export to PDF
            </Button>
          </Space>

          <div style={{ overflowX: "auto" }}>
            {/* Hidden table for Excel export */}
            <table ref={tableRef} style={{ display: "none" }}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render
                          ? col.render(record[col.dataIndex])
                          : record[col.dataIndex]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Visible Ant Design table */}
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey={(record, i) => i}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
              locale={{ emptyText: "No data found" }}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Report;
