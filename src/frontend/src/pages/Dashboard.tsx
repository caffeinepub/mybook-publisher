import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Clapperboard,
  Edit3,
  Eye,
  Loader2,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  type BookId,
  useCreateBook,
  useDeleteBook,
  useGetAllBooks,
} from "../hooks/useQueries";

const MOVIE_IDEAS_KEY = "inkwell_movie_ideas";

interface MovieIdea {
  id: string;
  title: string;
  notes: string;
}

function loadMovieIdeas(): MovieIdea[] {
  try {
    const raw = localStorage.getItem(MOVIE_IDEAS_KEY);
    return raw ? (JSON.parse(raw) as MovieIdea[]) : [];
  } catch {
    return [];
  }
}

function saveMovieIdeas(ideas: MovieIdea[]) {
  localStorage.setItem(MOVIE_IDEAS_KEY, JSON.stringify(ideas));
}

const SAMPLE_BOOKS = [
  {
    title: "The Midnight Garden",
    author: "Eleanor Voss",
    genre: "Literary Fiction",
    description:
      "A haunting tale of a botanist who discovers a secret garden that blooms only at midnight, hiding centuries of forgotten memories within its petals.",
  },
  {
    title: "Echoes of Tomorrow",
    author: "Marcus Webb",
    genre: "Science Fiction",
    description:
      "When a physicist accidentally receives transmissions from her future self, she must decide whether to trust a stranger who claims to be her — and whether changing the future is worth losing everything she loves.",
  },
];

const SAMPLE_CHAPTERS: Record<
  string,
  Array<{ title: string; content: string }>
> = {
  "The Midnight Garden": [
    {
      title: "The First Petal",
      content: `The greenhouse smelled of earth and memory. Dr. Sera Calloway pressed her palm against the cold glass, watching her breath fog against the midnight air. She had not meant to come here — not at this hour, not after what she'd found in the old estate records.

But the garden had called to her. It always did.

The iron gate stood slightly ajar, as though someone had passed through just moments before. Sera eased it open further, wincing at the groan of old hinges. Inside, the path was lit only by moonlight and the faint, phosphorescent glow of something she could not immediately name.

Then she saw it: a flower she had never encountered in thirty years of botanical research. Its petals were deep indigo, edged with gold, and it pulsed with a slow, rhythmic light — like a heartbeat.`,
    },
    {
      title: "The Keeper of Roots",
      content: `The old journals were written in three languages, none of them Sera's native tongue. Latin she managed; the floral taxonomy was familiar ground. But the second script — angular and precise — belonged to no alphabet she recognized.

She photographed every page with trembling hands.

The third language was worse: it was English, but the handwriting shifted mid-sentence, as though different hands — separated by decades, perhaps centuries — had continued the same thought. One passage read: *Do not pick the midnight bloom. It does not die. It remembers.*

Sera set the journal down. Through the greenhouse window, the indigo flower pulsed once, twice. Then went still.`,
    },
  ],
  "Echoes of Tomorrow": [
    {
      title: "Signal from the Future",
      content: `The quantum receiver wasn't supposed to do anything on a Tuesday.

Dr. Lena Park had built it over three years in the basement of the Harmon Institute, fed it her savings, her marriage, and a sabbatical she'd never actually taken. It was designed to detect quantum entanglement signatures at cosmological distances — not, emphatically not, to receive text messages.

And yet.

*Lena. It's you. Don't adjust the phase modulator at 11:47 tonight. Trust me. — L.*

She read the message four times. Checked the timestamp on the receiver log. Checked her own watch.

It was 11:31 PM.`,
    },
    {
      title: "The Other Her",
      content: `They met in a parking garage, because where else do you meet yourself?

The woman who stepped from the shadows was unmistakably Lena — same sharp jaw, same way of holding her shoulders slightly too high when nervous. But her hair was shorter, her eyes carried a particular exhaustion that Lena recognized as the aftermath of grief, and she moved with the careful deliberateness of someone who had survived something.

"You're going to want to ask me about the machine," the other Lena said. "Don't. Not yet."

"Then what do I ask?"

The woman looked at her for a long moment — something between recognition and mourning. "Ask me if Dad was happy. At the end."`,
    },
  ],
};

const GENRES = [
  "Literary Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery & Thriller",
  "Romance",
  "Historical Fiction",
  "Horror",
  "Non-Fiction",
  "Memoir",
  "Poetry",
  "Young Adult",
  "Children's",
  "Other",
];

interface DashboardProps {
  onEdit: (bookId: BookId) => void;
  onRead: (bookId: BookId) => void;
}

export default function Dashboard({ onEdit, onRead }: DashboardProps) {
  const { data: books, isLoading } = useGetAllBooks();
  const { actor } = useActor();
  const createBook = useCreateBook();
  const deleteBook = useDeleteBook();

  const [showNewBookDialog, setShowNewBookDialog] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
  });
  const [seedDone, setSeedDone] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<BookId | null>(null);

  // Movie Ideas state
  const [movieIdeas, setMovieIdeas] = useState<MovieIdea[]>(loadMovieIdeas);
  const [showMovieDialog, setShowMovieDialog] = useState(false);
  const [newMovieIdea, setNewMovieIdea] = useState({ title: "", notes: "" });
  const [movieDeleteConfirm, setMovieDeleteConfirm] = useState<string | null>(
    null,
  );

  // Seed sample content on first load
  useEffect(() => {
    if (!actor || isLoading || seedDone || !books) return;
    if (books.length > 0) {
      setSeedDone(true);
      return;
    }
    const seed = async () => {
      for (const sample of SAMPLE_BOOKS) {
        const bookId = await actor.createBook(
          sample.title,
          sample.author,
          sample.genre,
          sample.description,
        );
        const chapters = SAMPLE_CHAPTERS[sample.title] || [];
        for (const ch of chapters) {
          await actor.createChapter(bookId, ch.title, ch.content);
        }
      }
      setSeedDone(true);
    };
    seed().catch(console.error);
  }, [actor, isLoading, books, seedDone]);

  const handleCreateBook = async () => {
    if (!newBook.title.trim() || !newBook.author.trim() || !newBook.genre) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const bookId = await createBook.mutateAsync(newBook);
      toast.success("Book created!");
      setShowNewBookDialog(false);
      setNewBook({ title: "", author: "", genre: "", description: "" });
      onEdit(bookId);
    } catch {
      toast.error("Failed to create book");
    }
  };

  const handleDeleteBook = async (bookId: BookId) => {
    try {
      await deleteBook.mutateAsync(bookId);
      toast.success("Book deleted");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete book");
    }
  };

  const handleAddMovieIdea = () => {
    if (!newMovieIdea.title.trim()) {
      toast.error("Please enter a movie title");
      return;
    }
    const idea: MovieIdea = {
      id: String(Date.now()),
      title: newMovieIdea.title.trim(),
      notes: newMovieIdea.notes.trim(),
    };
    const updated = [idea, ...movieIdeas];
    setMovieIdeas(updated);
    saveMovieIdeas(updated);
    toast.success("Movie idea saved!");
    setShowMovieDialog(false);
    setNewMovieIdea({ title: "", notes: "" });
  };

  const handleDeleteMovieIdea = (id: string) => {
    const updated = movieIdeas.filter((m) => m.id !== id);
    setMovieIdeas(updated);
    saveMovieIdeas(updated);
    toast.success("Idea removed");
    setMovieDeleteConfirm(null);
  };

  const bookCovers: Record<string, string> = {
    "The Midnight Garden":
      "/assets/generated/book-cover-midnight-garden.dim_300x400.jpg",
    "Echoes of Tomorrow": "/assets/generated/book-cover-echoes.dim_300x400.jpg",
  };

  return (
    <div>
      {/* Hero Banner */}
      <section
        className="relative py-14 px-6 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.25 0.04 230) 0%, oklch(0.48 0.06 75) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-2">
              Your Writing Studio
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
              Welcome to Inkwell
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              Write, edit, and publish your stories — completely free. Your
              words, your world.
            </p>
          </motion.div>
          <motion.div
            className="mt-8 flex gap-4 flex-wrap"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gold" />
              <div>
                <p className="text-white font-semibold text-lg leading-none">
                  {books?.length ?? 0}
                </p>
                <p className="text-white/60 text-xs mt-0.5">Books Created</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-gold" />
              <div>
                <p className="text-white font-semibold text-lg leading-none">
                  {books?.filter(([, b]) => b.published).length ?? 0}
                </p>
                <p className="text-white/60 text-xs mt-0.5">Published</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
              <Clapperboard className="w-5 h-5 text-gold" />
              <div>
                <p className="text-white font-semibold text-lg leading-none">
                  {movieIdeas.length}
                </p>
                <p className="text-white/60 text-xs mt-0.5">Movie Ideas</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ── My Books ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              My Books
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your literary projects
            </p>
          </div>
          <Button
            data-ocid="dashboard.new_book.open_modal_button"
            onClick={() => setShowNewBookDialog(true)}
            className="bg-navy hover:bg-navy-light text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            New Book
          </Button>
        </div>

        {isLoading ? (
          <div
            data-ocid="dashboard.loading_state"
            className="flex items-center justify-center py-24"
          >
            <Loader2 className="w-8 h-8 animate-spin text-navy" />
          </div>
        ) : books && books.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.07 } },
              hidden: {},
            }}
          >
            <AnimatePresence>
              {books.map(([bookId, book], idx) => (
                <motion.div
                  key={bookId.toString()}
                  data-ocid={`books.item.${idx + 1}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35 },
                    },
                  }}
                >
                  <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden group">
                    {/* Cover thumbnail */}
                    <div className="h-40 relative overflow-hidden bg-gradient-to-br from-navy to-navy-light">
                      {bookCovers[book.title] ? (
                        <img
                          src={bookCovers[book.title]}
                          alt={book.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          className={
                            book.published
                              ? "bg-gold text-navy font-semibold text-xs"
                              : "bg-white/20 text-white backdrop-blur-sm text-xs font-medium"
                          }
                        >
                          {book.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-display font-semibold leading-tight line-clamp-2">
                        {book.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        by {book.author}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>{book.genre}</span>
                        <span>{book.chapterOrder.length} chapters</span>
                      </div>
                      <Progress
                        value={
                          book.published
                            ? 100
                            : Math.min(book.chapterOrder.length * 20, 95)
                        }
                        className="h-1.5 mb-4"
                      />
                      <div className="flex gap-2">
                        <Button
                          data-ocid={`books.item.${idx + 1}.edit_button`}
                          size="sm"
                          className="flex-1 bg-navy hover:bg-navy-light text-white text-xs"
                          onClick={() => onEdit(bookId)}
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          data-ocid={`books.item.${idx + 1}.secondary_button`}
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => onRead(bookId)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Read
                        </Button>
                        <Button
                          data-ocid={`books.item.${idx + 1}.delete_button`}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                          onClick={() => setDeleteConfirm(bookId)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            data-ocid="books.empty_state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 bg-navy/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-navy/50" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No books yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Start your first book and begin your publishing journey today.
            </p>
            <Button
              onClick={() => setShowNewBookDialog(true)}
              className="bg-navy hover:bg-navy-light text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Book
            </Button>
          </motion.div>
        )}

        {/* ── Movie Ideas ── */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                <Clapperboard className="w-6 h-6 text-[oklch(0.55_0.18_290)]" />
                Movie Ideas
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Capture your cinematic concepts before they slip away
              </p>
            </div>
            <Button
              data-ocid="movie_ideas.open_modal_button"
              onClick={() => setShowMovieDialog(true)}
              className="gap-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.38 0.18 290) 0%, oklch(0.28 0.14 260) 100%)",
                color: "white",
              }}
            >
              <Plus className="w-4 h-4" />
              Add Idea
            </Button>
          </div>

          {movieIdeas.length === 0 ? (
            <motion.div
              data-ocid="movie_ideas.empty_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 rounded-2xl border-2 border-dashed border-border"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{
                  background: "oklch(0.38 0.18 290 / 0.12)",
                }}
              >
                <Clapperboard
                  className="w-10 h-10"
                  style={{ color: "oklch(0.55 0.18 290)" }}
                />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Lights, Camera... Ideas?
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                Every great film starts with a spark. Add your first movie idea
                and start building your vision.
              </p>
              <Button
                onClick={() => setShowMovieDialog(true)}
                className="gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.38 0.18 290) 0%, oklch(0.28 0.14 260) 100%)",
                  color: "white",
                }}
              >
                <Plus className="w-4 h-4" />
                Add Your First Idea
              </Button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.07 } },
                hidden: {},
              }}
            >
              <AnimatePresence>
                {movieIdeas.map((idea, idx) => (
                  <motion.div
                    key={idea.id}
                    data-ocid={`movie_ideas.item.${idx + 1}`}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.35 },
                      },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden group">
                      {/* Cinematic gradient top */}
                      <div
                        className="h-32 relative overflow-hidden flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.22 0.14 290) 0%, oklch(0.32 0.18 260) 50%, oklch(0.28 0.10 240) 100%)",
                        }}
                      >
                        <Clapperboard className="w-12 h-12 text-white/20 group-hover:text-white/30 transition-colors" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <Button
                            data-ocid={`movie_ideas.item.${idx + 1}.delete_button`}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-white/50 hover:text-white hover:bg-white/20"
                            onClick={() => setMovieDeleteConfirm(idea.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <CardHeader className="pb-1.5">
                        <CardTitle className="text-base font-display font-semibold leading-tight line-clamp-2">
                          {idea.title}
                        </CardTitle>
                      </CardHeader>

                      {idea.notes && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {idea.notes}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* New Book Dialog */}
      <Dialog open={showNewBookDialog} onOpenChange={setShowNewBookDialog}>
        <DialogContent data-ocid="new_book.dialog" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Create a New Book
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="book-title" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="book-title"
                data-ocid="new_book.title.input"
                placeholder="Enter your book title"
                value={newBook.title}
                onChange={(e) =>
                  setNewBook((p) => ({ ...p, title: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="book-author" className="text-sm font-medium">
                Author Name *
              </Label>
              <Input
                id="book-author"
                data-ocid="new_book.author.input"
                placeholder="Your name or pen name"
                value={newBook.author}
                onChange={(e) =>
                  setNewBook((p) => ({ ...p, author: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Genre *</Label>
              <Select
                value={newBook.genre}
                onValueChange={(v) => setNewBook((p) => ({ ...p, genre: v }))}
              >
                <SelectTrigger
                  data-ocid="new_book.genre.select"
                  className="mt-1.5"
                >
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="book-desc" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="book-desc"
                data-ocid="new_book.description.textarea"
                placeholder="A brief synopsis of your book..."
                value={newBook.description}
                onChange={(e) =>
                  setNewBook((p) => ({ ...p, description: e.target.value }))
                }
                className="mt-1.5 resize-none h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="new_book.cancel_button"
              variant="outline"
              onClick={() => setShowNewBookDialog(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="new_book.submit_button"
              onClick={handleCreateBook}
              disabled={createBook.isPending}
              className="bg-navy hover:bg-navy-light text-white"
            >
              {createBook.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {createBook.isPending ? "Creating..." : "Create Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Book Confirm Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent data-ocid="delete_book.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Book?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All chapters will be permanently
            removed.
          </p>
          <DialogFooter className="mt-4">
            <Button
              data-ocid="delete_book.cancel_button"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="delete_book.confirm_button"
              variant="destructive"
              onClick={() =>
                deleteConfirm !== null && handleDeleteBook(deleteConfirm)
              }
              disabled={deleteBook.isPending}
            >
              {deleteBook.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Movie Idea Dialog */}
      <Dialog open={showMovieDialog} onOpenChange={setShowMovieDialog}>
        <DialogContent data-ocid="movie_ideas.dialog" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Clapperboard
                className="w-5 h-5"
                style={{ color: "oklch(0.55 0.18 290)" }}
              />
              New Movie Idea
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="movie-title" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="movie-title"
                data-ocid="movie_ideas.title.input"
                placeholder="What's your movie called?"
                value={newMovieIdea.title}
                onChange={(e) =>
                  setNewMovieIdea((p) => ({ ...p, title: e.target.value }))
                }
                className="mt-1.5"
                onKeyDown={(e) => e.key === "Enter" && handleAddMovieIdea()}
              />
            </div>
            <div>
              <Label htmlFor="movie-notes" className="text-sm font-medium">
                Pitch / Notes
              </Label>
              <Textarea
                id="movie-notes"
                data-ocid="movie_ideas.notes.textarea"
                placeholder="Describe the concept, genre, key scenes, or anything that sparked the idea..."
                value={newMovieIdea.notes}
                onChange={(e) =>
                  setNewMovieIdea((p) => ({ ...p, notes: e.target.value }))
                }
                className="mt-1.5 resize-none h-28"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="movie_ideas.cancel_button"
              variant="outline"
              onClick={() => {
                setShowMovieDialog(false);
                setNewMovieIdea({ title: "", notes: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="movie_ideas.submit_button"
              onClick={handleAddMovieIdea}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.38 0.18 290) 0%, oklch(0.28 0.14 260) 100%)",
                color: "white",
              }}
            >
              Save Idea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Movie Idea Confirm Dialog */}
      <Dialog
        open={movieDeleteConfirm !== null}
        onOpenChange={() => setMovieDeleteConfirm(null)}
      >
        <DialogContent
          data-ocid="delete_movie_idea.dialog"
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Remove Idea?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This idea will be permanently removed from your list.
          </p>
          <DialogFooter className="mt-4">
            <Button
              data-ocid="delete_movie_idea.cancel_button"
              variant="outline"
              onClick={() => setMovieDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="delete_movie_idea.confirm_button"
              variant="destructive"
              onClick={() =>
                movieDeleteConfirm !== null &&
                handleDeleteMovieIdea(movieDeleteConfirm)
              }
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
