import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import SellProduct from "./pages/SellProduct";
import Messages from "./pages/Messages";
import AllMessages from "./pages/AllMessages";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import MyProducts from "./pages/MyProducts";
import EditProduct from "./pages/EditProduct";
import InfoPage from "./pages/InfoPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/products" element={<Products />} />

      <Route path="/products/:id" element={<ProductDetails />} />

      <Route path="/sell" element={<SellProduct />} />

      <Route path="/favorites" element={<Favorites />} />

      <Route path="/messages" element={<AllMessages />} />

      <Route path="/messages/:id" element={<Messages />} />

      <Route path="/profile" element={<Profile />} />

      <Route path="/my-products" element={<MyProducts />} />

      <Route path="/edit-product/:id" element={<EditProduct />} />

      <Route path="/info/:page" element={<InfoPage />} />
    </Routes>
  );
}

export default App;
