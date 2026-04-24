import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { IconGradientDefs } from "./components/icons";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ActivityPage } from "./pages/ActivityPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { ConnectLeetcodePage } from "./pages/ConnectLeetcodePage";
import { DashboardPage } from "./pages/DashboardPage";
import { FriendsPage } from "./pages/FriendsPage";
import { LandingPage } from "./pages/LandingPage";
import {
  LeaderboardPage,
  PublicLeaderboardPage,
} from "./pages/LeaderboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <IconGradientDefs />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/leaderboard" element={<PublicLeaderboardPage />} />

            <Route
              path="/app/connect"
              element={
                <ProtectedRoute>
                  <ConnectLeetcodePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="friends" element={<FriendsPage />} />
              <Route path="challenges" element={<ChallengesPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="profile/:idOrUsername" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
