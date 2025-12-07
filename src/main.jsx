import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import "./styles/global.css";
import "./styles/app-layout.css";
import "./styles/home-grid.css";
import "./styles/product-detail-and-modal.css";
import "./styles/cart-sidebar.css";


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
