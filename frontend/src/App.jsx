import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./pages/Dashboardlayout";
import Dashboard from "./pages/Dashboard";
import ChannelVideos from "./pages/ChannelVideos";
import VideoDetail from "./pages/VideoDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/videos" element={<ChannelVideos />} />
          <Route path="/videos/:id" element={<VideoDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
