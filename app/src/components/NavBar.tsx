"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function NavBar() {
  const { user, userData } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-canvas px-6 py-4 md:px-12">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-black tracking-tighter text-ink">
          BIT2BYTE
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-ink hover:opacity-70 transition-opacity">
            Home
          </Link>
          {user && (
            <Link href="/profile" className="text-sm font-semibold text-ink hover:opacity-70 transition-opacity">
              Profile
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Google Translate Placeholder */}
        <div id="google_translate_element" className="scale-90 origin-right"></div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-ink">{userData?.name || "Student"}</p>
              <p className="text-[10px] text-mute uppercase tracking-wider">{userData?.xp || 0} XP</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm font-semibold text-ink underline underline-offset-4 hover:opacity-70"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-primary py-2 text-sm">
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
