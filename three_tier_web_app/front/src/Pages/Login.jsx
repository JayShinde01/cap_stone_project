// src/pages/Login1.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo'; // Optional: logo if you have one
import styles from '../page_style/login.module.css'; // ✅ Import CSS module

const { Title } = Typography;

function Login() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { user, logIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    const { email, password } = values;

    try {
      const result = await logIn(email, password);

      if (result?.user) {
        setAlert({ type: 'success', message: 'Login successful!' });
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        setAlert({ type: 'error', message: 'Invalid credentials!' });
      }
    } catch (error) {
      console.error(error);
      setAlert({ type: 'error', message: 'Something went wrong!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPageWrapper}>
      <Card className={styles.loginPageContainer} bordered>
        <div style={{ textAlign: 'center' }}>
          <Logo size={100} />
        </div>

        <Title level={3} style={{ textAlign: 'center' }}>
          Log in to Ambika Spare Parts
        </Title>

        {alert && (
          <Alert
            style={{ marginBottom: 16 }}
            message={alert.message}
            type={alert.type}
            showIcon
            closable
            onClose={() => setAlert(null)}
          />
        )}

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Invalid email format!' },
            ]}
          >
            <Input placeholder="Enter mail Id" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          {/* <Form.Item>
            <Link to="/signup">Not registered? Sign up</Link>
          </Form.Item> */}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
