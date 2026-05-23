import { Navigate, Route, Routes } from "react-router-dom";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import Demo from "@/pages/Demo";
import Callback from "@/pages/Callback";
import SignIn from "@/pages/SignIn";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
