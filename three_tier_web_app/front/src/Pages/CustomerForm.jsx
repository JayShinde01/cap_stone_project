import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  Space,
  Alert,
} from "antd";

import Sidebar from "../components/Sidebar";
import "../page_style/CustomerForm.css";

import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "../services/customerService";

const { Title } = Typography;
const { Option } = Select;

const CustomerForm = () => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [currentCustomerId, setCurrentCustomerId] = useState("");
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message, description = "") => {
    setAlert({ type, message, description });
    setTimeout(() => setAlert(null), 3000);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      showAlert("error", "Failed to fetch customers", "Please check your server or network.");
    }
  };

  const handleCheck = async () => {
    const phoneMobile = form.getFieldValue("phoneMobile");
    if (!phoneMobile) {
      showAlert("warning", "Missing Mobile Number", "Please enter a mobile number before checking.");
      return;
    }

    try {
      const data = await getCustomerById(phoneMobile);
      if (data) {
        form.setFieldsValue({
          fullName: data.full_name,
          status: data.status,
          customerId: data.customer_id,
          phoneMobile: data.phone_mobile,
          phone2: data.phone2,
          email: data.email,
          address: data.address,
          address2: data.address2,
          city: data.city,
        });
        setCurrentCustomerId(data.customer_id);
        showAlert("success", "Customer Found", "Customer details loaded successfully.");
      } else {
        showAlert("error", "No Match", "No customer found with this mobile number.");
        handleClear();
      }
    } catch (err) {
      console.error(err);
      showAlert("error", "Error", "Something went wrong while searching for the customer.");
    }
  };

  const handleSubmit = async () => {
    showAlert("info", "Processing", "Saving customer details...");
    try {
      console.log("try");
      
      const values = await form.validateFields();
      console.log(values);

      const { customerId, ...submitValues } = values;
      console.log("after try");

      const response = await addCustomer(submitValues);
      console.log("after after try");

      console.log(response);
      console.log(response.ok);
      
      if (response.status === 400) {
        const data = await response.json();
        if (data.message === "exists") {
          showAlert("warning", "Duplicate Entry", "A customer with this mobile number already exists.");
          return;
        }
      }

      if (response) {
        showAlert("success", "Success", "Customer has been added to the database.");
        handleClear();
        fetchCustomers();
      } else {
        showAlert("error", "Failed", "Could not add customer. Please try again.");
      }
    } catch (err) {
      console.error(err);
      showAlert("error", "Unexpected Error", "Something went wrong while saving the customer.");
    }
  };

  const handleUpdate = async () => {
    if (!currentCustomerId) {
      showAlert("warning", "No Customer Selected", "Use the 'Check' button to load customer details first.");
      return;
    }

    try {
      const values = await form.validateFields();
      const { customerId, ...updateValues } = values;
      console.log(updateValues);

      const response = await updateCustomer(currentCustomerId, updateValues);
      console.log(response);
      
      if (response && response.message === "updated") {
  showAlert("success", "Update Successful", "Customer details updated.");
  handleClear();
  fetchCustomers();
} else {
  showAlert("error", "Update Failed", "Could not update customer. Try again.");
}

    } catch (err) {
      console.error(err);
      showAlert("error", "Error", "An error occurred while updating the customer.");
    }
  };

  const handleDelete = async () => {
    if (!currentCustomerId) {
      showAlert("warning", "No Customer Selected", "Please load a customer before attempting to delete.");
      return;
    }

    try {
      const response = await deleteCustomer(currentCustomerId);
      console.log(response);
      
      if (response && response.message === "deleted") {
  showAlert("success", "Delete Successful", "Customer details deleted.");
  handleClear();
  fetchCustomers();
} else {
  showAlert("error", "Delete Failed", "Could not Delete customer. Try again.");
}

    } catch (err) {
      console.error(err);
      showAlert("error", "Error", "Something went wrong while deleting the customer.");
    }
  };

  const handleClear = () => {
    form.resetFields();
    setCurrentCustomerId("");
  };

  return (
    <div className="customer-form-container">
      
        <Sidebar />
      

      <main className="customer-form-content" style={{ zIndex: 0, position: 'relative' }}>
        <Title className="customer-form-title" level={3}>
          Customer Details
        </Title>

        {alert && (
          <Alert
            message={alert.message}
            description={alert.description}
            type={alert.type}
            showIcon
            closable
            style={{ marginBottom: "1rem", borderRadius: "8px" }}
          />
        )}

        <Form form={form} layout="vertical" className="customer-form-form">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[{ required: true, message: "Full Name is required" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="status" label="Status" initialValue="Active">
                <Select>
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={8}>
              <Form.Item name="customerId" label="Customer ID">
                <Input placeholder="Auto-filled" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="phoneMobile"
                label="Phone (Mobile)"
                rules={[
                  { required: true, message: "Mobile number is required" },
                  { pattern: /^\d{10}$/, message: "Must be 10 digits" },
                ]}
              >
                <Input
                  placeholder="Enter mobile number"
                  addonAfter={
                    <Button type="default" onClick={handleCheck}>
                      Check
                    </Button>
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item name="phone2" label="Phone 2">
                <Input placeholder="Alternate phone number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Invalid email format" }]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Address is required" }]}
              >
                <Input placeholder="Enter address" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="address2" label="Address 2">
                <Input placeholder="Additional address details" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="city" label="Village">
                <Input placeholder="Enter village or city" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="customer-form-buttons">
            <Space wrap>
              <Button type="primary" onClick={handleSubmit}>
                Add Customer
              </Button>
              <Button onClick={handleUpdate}>Update</Button>
              <Button danger onClick={handleDelete}>
                Delete
              </Button>
              <Button onClick={handleClear}>Clear</Button>
              
            </Space>
          </Form.Item>
        </Form>
      </main>
    </div>
  );
};

export default CustomerForm;
