import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { SidebarLayout } from "./components/SidebarLayout";
import { VideoFeed } from "./components/VideoFeed";
import { MyVideos } from "./components/MyVideos";
import { MyTweets } from "./components/MyTweets";
import { History } from "./components/History";
import { UploadVideo } from "./components/UploadVideo"; // Added missing import
import { Login } from "./components/Login";
import { Register } from "./components/Register";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - No sidebar here */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard - AuthLayout checks verifyJWT */}
        <Route
          path="/"
          element={
            <AuthLayout>
              <SidebarLayout />
            </AuthLayout>
          }
        >
          {/* Use 'index' for the default route at '/' */}
          <Route index element={<VideoFeed />} />

          {/* Nested sub-routes - Render inside the Sidebar's <Outlet /> */}
          <Route path="my-videos" element={<MyVideos />} />
          <Route path="my-tweets" element={<MyTweets />} />
          <Route path="upload" element={<UploadVideo />} />
          <Route path="history" element={<History />} />
        </Route>

        {/* Catch-all: Redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
