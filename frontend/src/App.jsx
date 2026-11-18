import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import NotesDetails from "./pages/NotesDetails";
import CreatePage from "./pages/CreatePage";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/notes/:id" element={<NotesDetails />} />
      </Routes>
    </>
  );
}

export default App;
