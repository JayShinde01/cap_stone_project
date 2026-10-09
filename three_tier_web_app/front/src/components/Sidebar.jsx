import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Drawer,
  Grid,
} from "antd";
import {
  HomeOutlined,
  ShoppingOutlined,
  DollarOutlined,
  UserOutlined,
  SearchOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";
import "./sidebar.css";

const { Sider } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logOut } = useContext(AuthContext);
  const screens = useBreakpoint();

  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    setIsMobile(!screens.md);
  }, [screens]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      onClick={() => isMobile && setDrawerVisible(false)}
    >
      <Menu.Item key="/home" icon={<HomeOutlined />}>
        <Link to="/home">Home</Link>
      </Menu.Item>
      <Menu.Item key="/item" icon={<ShoppingOutlined />}>
        <Link to="/item">Products</Link>
      </Menu.Item>
      <Menu.Item key="/sales" icon={<DollarOutlined />}>
        <Link to="/sales">Sales</Link>
      </Menu.Item>
      <Menu.Item key="/customer" icon={<UserOutlined />}>
        <Link to="/customer">Customer</Link>
      </Menu.Item>
      <Menu.Item key="/search" icon={<SearchOutlined />}>
        <Link to="/search">Search</Link>
      </Menu.Item>
      <Menu.Item key="/report" icon={<BarChartOutlined />}>
        <Link to="/report">Report</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {isMobile ? (
        <>
          {/* Mobile Top Bar */}
          <div className="mobile-header">
            <Button
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              className="menu-toggle-btn"
              type="text"
            />
            <Title level={5} className="mobile-title">
              Ambika Spare Parts
            </Title>
          </div>

          {/* Mobile Drawer */}
          <Drawer
            placement="left"
            closable={false}
            onClose={() => setDrawerVisible(false)}
            visible={drawerVisible}
            width={240}
            bodyStyle={{ padding: 0, background: "#001529" }}
          >
            <div className="sidebar-headerbox">
              <Title level={4} className="sidebar-title">
                <AppstoreOutlined style={{ marginRight: 6 }} />
                Ambika Spare Parts
              </Title>
            </div>
            {menuItems}
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="sidebar-logout-btn"
            >
              LogOut
            </Button>
          </Drawer>
        </>
      ) : (
        <Sider width={220} className="sidebar-sider">
          <div className="sidebar-headerbox">
            <Title level={4} className="sidebar-title">
              <AppstoreOutlined style={{ marginRight: 6 }} />
              Ambika Spare Parts
            </Title>
          </div>
          {menuItems}
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="sidebar-logout-btn"
          >
            Logout
          </Button>
        </Sider>
      )}
    </>
  );
};

export default Sidebar;
