import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, BookOpen, ChevronDown, Feather } from "lucide-react";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navLinks = [
  { id: "dashboard", label: "Dashboard" },
  { id: "projects", label: "My Books" },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
            <Feather className="w-4 h-4 text-gold" />
          </div>
          <span className="font-display font-bold text-xl text-navy">
            Inkwell
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.id}
              data-ocid={`nav.${link.id}.link`}
              onClick={() =>
                onNavigate(link.id === "projects" ? "dashboard" : link.id)
              }
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === link.id ||
                (link.id === "projects" && currentPage === "dashboard")
                  ? "bg-navy/10 text-navy"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-navy text-white text-xs font-semibold">
                <BookOpen className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-foreground">
              My Profile
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
