"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, Moon, Sun, Video, Upload, LogOut, LogIn, Sparkles } from "lucide-react";
import { useNotification } from "./Notification";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDark(initialDark);
    document.documentElement.setAttribute(
      "data-theme",
      initialDark ? "dark" : "light"
    );
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    const theme = newTheme ? "dark" : "light";

    localStorage.setItem("theme", theme);

    document.documentElement.setAttribute("data-theme", theme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    showNotification(`Switched to ${theme} mode`, "success");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("Signed out successfully", "success");
      setIsDropdownOpen(false);
    } catch {
      showNotification("Failed to sign out", "error");
    }
  };

  const extractFirstName = (email: string) => {
    const username = email.split("@")[0];
    const mainPart = username.split(".")[0];
    const cleaned = mainPart.replace(/[0-9]+$/, ""); 
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 shadow-lg border-b border-gray-200/20 dark:border-neutral-700/20"
          : "bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-neutral-900/90 dark:to-neutral-800/90 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="group flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100/80 to-blue-100/80 dark:from-purple-900/30 dark:to-blue-900/30 hover:from-purple-200/80 hover:to-blue-200/80 dark:hover:from-purple-800/40 dark:hover:to-blue-800/40 transition-all duration-300 transform hover:scale-105"
              prefetch={true}
              onClick={() => showNotification("Welcome to Mivora", "info")}
            >
              <div className="relative">
                <Video className="w-6 h-6 text-purple-600 dark:text-purple-400 transition-transform duration-300 group-hover:rotate-12" />
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                Mivora
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle hover:bg-gray-200/50 dark:hover:bg-neutral-700/50 transition-all duration-300 hover:scale-110 border border-gray-200/50 dark:border-neutral-700/50"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <Sun
                  className={`w-5 h-5 absolute transition-all duration-300 ${
                    isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
                  } text-yellow-500`}
                />
                <Moon
                  className={`w-5 h-5 absolute transition-all duration-300 ${
                    isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"
                  } text-blue-400`}
                />
              </div>
            </button>

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle hover:bg-gradient-to-br hover:from-purple-100/50 hover:to-blue-100/50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-all duration-300 hover:scale-110 relative border border-gray-200/50 dark:border-neutral-700/50"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="relative">
                  {session?.user?.image ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  )}
                  {session && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900 animate-pulse"></div>
                  )}
                </div>
              </div>

              <ul
                className={`dropdown-content z-[100] shadow-2xl bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-2xl w-72 mt-4 py-3 border border-gray-200/20 dark:border-neutral-700/20 transition-all duration-300 ${
                  isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                {session ? (
                  <>
                    <li className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="avatar placeholder">
                          {session.user?.image ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img
                                src={session.user.image}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full w-10">
                              <span className="text-sm font-bold">
                                {session.user?.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="max-w-[180px] break-words whitespace-normal">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {session.user?.name || 
                              (session.user?.email && extractFirstName(session.user.email))}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                    </li>

                    <div className="divider my-2 mx-4 border-gray-200 dark:border-neutral-700"></div>

                    <li>
                      <Link
                        href="/upload"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-blue-100/50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 rounded-xl mx-2 transition-all duration-300 group text-gray-700 dark:text-gray-300"
                        onClick={() => {
                          showNotification(
                            "Welcome to Admin Dashboard",
                            "info"
                          );
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">Video Upload</span>
                      </Link>
                    </li>

                    <li className="px-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 group"
                      >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link
                      href="/login"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-blue-100/50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 rounded-xl mx-2 transition-all duration-300 group text-gray-700 dark:text-gray-300"
                      onClick={() => {
                        showNotification("Please sign in to continue", "info");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <LogIn className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">Sign In</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}