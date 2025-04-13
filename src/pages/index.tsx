"use client";

import { Dashboard, Login } from "@/components/pages";
import { authStateSelector } from "@/store/selectors";
import { useSelector } from "react-redux";

export default function Home() {
  const authState = useSelector(authStateSelector);

  return (
    <div className="min-h-full">
      {authState.isLoggedIn ? <Dashboard /> : <Login />}
    </div>
  );
}
