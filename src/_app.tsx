import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./_routes";

export default () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};
