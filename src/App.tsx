import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import Demo from "@/pages/Demo";
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
      <Routes>
        <Route element={<Page />}>
          <Route path="/" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
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
