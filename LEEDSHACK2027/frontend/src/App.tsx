import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar";

import Home from "./pages/home";
import Register from "./pages/register";
import TeamRegister from "./pages/teamRegister";
import Admin from "./pages/admin";
import Confirmation from "./pages/confirmation";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route 
          path="/register" 
          element={<Register />} 
        />

        <Route 
          path="/team" 
          element={<TeamRegister />} 
        />

        <Route 
          path="/admin" 
          element={<Admin />} 
        />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;