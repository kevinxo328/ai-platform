import { Outlet } from "react-router-dom";
import { Toaster } from "./components/shadcn/ui/sonner";
import { useTheme } from "./contexts/ui-theme";

function App() {
  const { theme } = useTheme();

  // const navigate = useNavigate();
  // const location = useLocation();
  // useEffect(() => {
  //   if (location.pathname === "/") {
  //     navigate("/home");
  //   }
  // }, [navigate, location.pathname]);

  return (
    <div className="App">
      <Outlet />
      <Toaster closeButton theme={theme} richColors />
    </div>
  );
}

export default App;
