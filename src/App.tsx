import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Header from "@/components/Header";
import ScrollToHash from "@/components/ScrollToHash";
import Home from "@/pages/Home";
import Callback from "@/pages/Callback";
import SignIn from "@/pages/SignIn";
import PlannerGallery from "@/pages/planner/Gallery";
import PlannerEditor from "@/pages/planner/Editor";

/** Ordinary pages: centred column with padding. */
function Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Outlet />
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ScrollToHash />
      <Routes>
        <Route element={<Page />}>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/planner" element={<PlannerGallery />} />
        </Route>
        {/* The planner itself fills the window below the header. */}
        <Route path="/planner/new" element={<PlannerEditor />} />
        <Route path="/planner/d/:id" element={<PlannerEditor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
