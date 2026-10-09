// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css'; // 👈 Required for message/notification
import { AuthProvider } from './context/AuthContext.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ Needed for useRoutes */}
      <ConfigProvider>
         <AuthProvider>
        <App />

         </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
