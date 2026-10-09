// components/Loading.jsx
import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "../page_style/loading.css";

const antIcon = (
  <LoadingOutlined style={{ fontSize: 48, color: "#1890ff" }} spin />
);

const Loading = () => {
  return (
    <div className="custom-loading">
      <Spin indicator={antIcon} tip="Loading Dashboard..." />
    </div>
  );
};

export default Loading;
