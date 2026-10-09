import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./pages/Dashboardlayout.jsx";
import ProtectedRoute from "./components/auth/Protectedroute.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import VideoDetail from "./pages/VideoDetail";
import ChannelProfile from "./pages/ChannelProfile.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/studio" element={<Dashboard />} />
            <Route path="/videos/:id" element={<VideoDetail />} />
            <Route path="/channel/:username" element={<ChannelProfile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
