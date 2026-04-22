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
import { UploadVideo } from "./components/UploadVideo";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { TweetFeed } from "./components/TweetFeed";
import { ChannelProfile } from "./components/ChannelProfile";
import { VideoPlayerProvider } from "./components/VideoPlayerContext";
import { AccountSettings } from "./components/AccountSettings";
import { VerifyEmail } from "./components/VerifyEmail";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { TweetPlayerProvider } from "./context/TweetPlayerContext";

import { Toaster } from 'sonner';

import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="clustr-ui-theme">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Dashboard 
              We wrap EVERYTHING in VideoPlayerProvider here.
              This ensures the Global Modal is inside the Router.
          */}
          <Route
            path="/"
            element={
              <AuthLayout>
                <TweetPlayerProvider>
                  <VideoPlayerProvider>
                    <SidebarLayout />
                  </VideoPlayerProvider>
                </TweetPlayerProvider>
              </AuthLayout>
            }
          >
            {/* Default route */}
            <Route index element={<VideoFeed />} />

            {/* All these sub-routes can now call playVideo() safely */}
            <Route path="tweets" element={<TweetFeed />} />
            <Route path="my-videos" element={<MyVideos />} />
            <Route path="my-tweets" element={<MyTweets />} />
            <Route path="upload" element={<UploadVideo />} />
            <Route path="history" element={<History />} />
            <Route path="channel/:username" element={<ChannelProfile />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster richColors position="top-center" />
      </Router>
    </ThemeProvider>
  );
}

export default App;