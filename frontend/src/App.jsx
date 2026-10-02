import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./pages/Dashboardlayout.jsx";
import ProtectedRoute from "./components/auth/Protectedroute.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ChannelVideos from "./pages/ChannelVideos";
import VideoDetail from "./pages/VideoDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/videos" element={<ChannelVideos />} />
            <Route path="/videos/:id" element={<VideoDetail />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
