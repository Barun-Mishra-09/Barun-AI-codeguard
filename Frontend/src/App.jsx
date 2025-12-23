import "./App.css";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import TitleManager from "./TitleManager";

// Google auth
import { GoogleOAuthProvider } from "@react-oauth/google";

// Common Layout wrapper - har route ke under TitleManger inject krna
const Layout = ({ children }) => {
  return (
    <>
      <TitleManager />
      {children}
    </>
  );
};

// create a fuction to use the routing
const MainRouter = () => {
  const appRouter = createBrowserRouter([
    {
      path: "/login",
      element: (
        <Layout>
          <Login />,
        </Layout>
      ),
    },
    {
      path: "/signup",
      element: (
        <Layout>
          <Register />,
        </Layout>
      ),
    },
    {
      path: "/",
      element: (
        <Layout>
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Layout>
      ),
    },
  ]);

  return <RouterProvider router={appRouter} />;
};

function App() {
  return (
    <>
      <GoogleOAuthProvider clientId="651509934418-ijdsc8b7cuo4ecboqfcva9jon6a3v7j2.apps.googleusercontent.com">
        <MainRouter />
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
