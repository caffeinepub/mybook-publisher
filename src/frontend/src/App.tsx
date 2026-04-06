import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Navbar from "./components/Navbar";
import type { BookId } from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Reader from "./pages/Reader";

export type Page =
  | { name: "dashboard" }
  | { name: "editor"; bookId: BookId }
  | { name: "reader"; bookId: BookId };

export default function App() {
  const [page, setPage] = useState<Page>({ name: "dashboard" });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        currentPage={page.name}
        onNavigate={(p) => setPage({ name: p as "dashboard" })}
      />
      <main className="flex-1">
        {page.name === "dashboard" && (
          <Dashboard
            onEdit={(bookId) => setPage({ name: "editor", bookId })}
            onRead={(bookId) => setPage({ name: "reader", bookId })}
          />
        )}
        {page.name === "editor" && (
          <Editor
            bookId={page.bookId}
            onBack={() => setPage({ name: "dashboard" })}
          />
        )}
        {page.name === "reader" && (
          <Reader
            bookId={page.bookId}
            onBack={() => setPage({ name: "dashboard" })}
          />
        )}
      </main>
      <footer className="bg-navy py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-label="Inkwell feather logo"
              role="img"
              className="text-gold"
            >
              <path
                d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="16"
                y1="8"
                x2="2"
                y2="22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="17.5"
                y1="15"
                x2="9"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-white font-display font-semibold">
              Inkwell
            </span>
          </div>
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
      <Toaster richColors />
    </div>
  );
}
