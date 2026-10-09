import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Table,
  Tabs,
  Modal,
  Spin,
  Alert,
} from "antd";
import {
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
  fetchItemByNumber,
} from "../services/itemService";
import { uploadImage } from "../services/uploadService";
import Sidebar from "../components/Sidebar";
import "../page_style/item.css";

const { TabPane } = Tabs;
const { TextArea } = Input;

const Item = () => {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="item-wrapper">
      <Sidebar />
      <div className="item-main">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="🛒 Item Details" key="details">
            <ItemDetails />
          </TabPane>
          <TabPane tab="🖼️ Upload Image" key="upload">
            <UploadImage />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

const ItemDetails = () => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });

  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => setAlert({ ...alert, visible: false }), 3000);
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch {
      showAlert("error", "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const onFinish = async (values) => {
    try {
      const payload = { ...values, imageURL: null };

      if (selectedItem && selectedItem.item_id) {
        await updateItem(selectedItem.item_id, payload);
        showAlert("success", "Item updated successfully");
      } else {
        await addItem(payload);
        showAlert("success", "Item added successfully");
      }

      form.resetFields();
      setSelectedItem(null);
      loadItems();
    } catch (err) {
      showAlert("error", "Operation failed");
    }
  };

  const handleEdit = (item) => {
    form.setFieldsValue(item);
    setSelectedItem(item);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      await deleteItem(id);
      showAlert("success", "Item deleted successfully");
      loadItems();
    } catch (error) {
      showAlert("error", "Error deleting item");
    }
  };

  const handleCheck = async () => {
    const itemNumber = form.getFieldValue("itemNumber");
    if (!itemNumber) {
      showAlert("warning", "Enter item number to check");
      return;
    }
    try {
      const data = await fetchItemByNumber(itemNumber);
      if (data) {
        form.setFieldsValue(data);
        setSelectedItem(data);
        showAlert("success", "Item found");
      } else {
        showAlert("info", "Item not found");
      }
    } catch {
      showAlert("error", "Failed to fetch item");
    }
  };

  const columns = [
    { title: "Item Number", dataIndex: "itemNumber", key: "itemNumber" },
    { title: "Item Name", dataIndex: "itemName", key: "itemName" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)} type="link">
            Edit
          </Button>
          <Button onClick={() => handleDelete(record.item_id)} type="link" danger>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="item-panel">
      <h3 className="item-heading">Manage Items</h3>

      {alert.visible && (
        <Alert
          message={alert.message}
          type={alert.type}
          showIcon
          closable
          style={{ marginBottom: "16px" }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Item Number" name="itemNumber" rules={[{ required: true }]}>
          <Input addonAfter={<Button onClick={handleCheck}>Check</Button>} />
        </Form.Item>

        <Form.Item label="Item Name" name="itemName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Discount (%)" name="discount">
          <InputNumber min={0} max={100} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Stock" name="stock" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Unit Price" name="unitPrice" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Status" name="status" initialValue="Active">
          <Select>
            <Select.Option value="Active">Active</Select.Option>
            <Select.Option value="Inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
            {selectedItem ? "Update Item" : "Add Item"}
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
              setSelectedItem(null);
              showAlert("info", "Form reset");
            }}
          >
            Reset
          </Button>
        </Form.Item>
      </Form>

      <h3 className="item-heading">Item List</h3>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={items} rowKey="item_id" />
      </Spin>
    </div>
  );
};

const UploadImage = () => {
  const [file, setFile] = useState(null);
  const [itemNumber, setItemNumber] = useState("");
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });

  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => setAlert({ ...alert, visible: false }), 3000);
  };

  const handleUpload = async () => {
    if (!file || !itemNumber) {
      showAlert("warning", "Please select a file and enter item number");
      return;
    }
    setUploading(true);
    try {
      await uploadImage(file, itemNumber);
      showAlert("success", "Image uploaded successfully");
      setFile(null);
      setItemNumber("");
    } catch {
      showAlert("error", "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="item-panel">
      <h3 className="item-heading">Upload Item Image</h3>

      {alert.visible && (
        <Alert
          message={alert.message}
          type={alert.type}
          showIcon
          closable
          style={{ marginBottom: "16px" }}
        />
      )}

      <Form layout="vertical" onFinish={handleUpload}>
        <Form.Item label="Item Number" required>
          <Input
            value={itemNumber}
            onChange={(e) => setItemNumber(e.target.value)}
            placeholder="Enter item number"
          />
        </Form.Item>

        <Form.Item label="Choose Image">
          <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={uploading}>
            Upload
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Item;
