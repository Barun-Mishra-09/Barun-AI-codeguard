import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();

    if (path === "/login") {
      document.title = "Login | Barun AI CodeGuard";
    } else if (path === "/signup") {
      document.title = "Create Account | Barun AI CodeGuard";
    } else {
      document.title =
        "Barun AI CodeGuard | AI-Powered Code Review & Refactoring";
    }
  }, [location]);
  return null;
};

export default TitleManager;
