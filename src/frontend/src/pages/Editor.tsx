import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type BookId,
  type Chapter,
  type ChapterId,
  useCreateChapter,
  useDeleteChapter,
  useGetBook,
  useGetChaptersByBook,
  usePublishBook,
  useReorderChapters,
  useUpdateBook,
  useUpdateChapter,
} from "../hooks/useQueries";

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

interface EditorProps {
  bookId: BookId;
  onBack: () => void;
}

interface LocalChapter {
  chapterId: ChapterId;
  chapter: Chapter;
  dirty: boolean;
}

export default function Editor({ bookId, onBack }: EditorProps) {
  const { data: book, isLoading: bookLoading } = useGetBook(bookId);
  const { data: chapters, isLoading: chapsLoading } =
    useGetChaptersByBook(bookId);

  const updateBook = useUpdateBook();
  const publishBook = usePublishBook();
  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();
  const reorderChapters = useReorderChapters();

  const [meta, setMeta] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
  });
  const [metaDirty, setMetaDirty] = useState(false);
  const [localChapters, setLocalChapters] = useState<LocalChapter[]>([]);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingChapter, setSavingChapter] = useState<string | null>(null);
  const [publishingBook, setPublishingBook] = useState(false);

  // Sync book meta
  useEffect(() => {
    if (book) {
      setMeta({
        title: book.title,
        author: book.author,
        genre: book.genre,
        description: book.description,
      });
      setMetaDirty(false);
    }
  }, [book]);

  // Sync chapters
  useEffect(() => {
    if (chapters) {
      const sorted = [...chapters].sort(
        ([, a], [, b]) => Number(a.order) - Number(b.order),
      );
      setLocalChapters(
        sorted.map(([id, ch]) => ({
          chapterId: id,
          chapter: ch,
          dirty: false,
        })),
      );
    }
  }, [chapters]);

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    try {
      await updateBook.mutateAsync({ bookId, ...meta });
      toast.success("Book details saved");
      setMetaDirty(false);
    } catch {
      toast.error("Failed to save book details");
    } finally {
      setSavingMeta(false);
    }
  };

  const handlePublish = async () => {
    setPublishingBook(true);
    try {
      if (metaDirty) await updateBook.mutateAsync({ bookId, ...meta });
      await publishBook.mutateAsync(bookId);
      toast.success("Book published! 🎉");
    } catch {
      toast.error("Failed to publish book");
    } finally {
      setPublishingBook(false);
    }
  };

  const handleAddChapter = async () => {
    try {
      await createChapter.mutateAsync({
        bookId,
        title: `Chapter ${localChapters.length + 1}`,
        content: "",
      });
      toast.success("Chapter added");
    } catch {
      toast.error("Failed to add chapter");
    }
  };

  const handleSaveChapter = async (lc: LocalChapter) => {
    setSavingChapter(lc.chapterId.toString());
    try {
      await updateChapter.mutateAsync({
        chapterId: lc.chapterId,
        title: lc.chapter.title,
        content: lc.chapter.content,
        bookId,
      });
      setLocalChapters((prev) =>
        prev.map((c) =>
          c.chapterId === lc.chapterId ? { ...c, dirty: false } : c,
        ),
      );
      toast.success("Chapter saved");
    } catch {
      toast.error("Failed to save chapter");
    } finally {
      setSavingChapter(null);
    }
  };

  const handleDeleteChapter = async (chapterId: ChapterId) => {
    try {
      await deleteChapter.mutateAsync({ chapterId, bookId });
      toast.success("Chapter deleted");
    } catch {
      toast.error("Failed to delete chapter");
    }
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    const newArr = [...localChapters];
    const target = index + dir;
    if (target < 0 || target >= newArr.length) return;
    [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
    setLocalChapters(newArr);
    await reorderChapters.mutateAsync({
      bookId,
      newOrder: newArr.map((c) => c.chapterId),
    });
  };

  const updateLocalChapter = (
    id: ChapterId,
    field: "title" | "content",
    value: string,
  ) => {
    setLocalChapters((prev) =>
      prev.map((c) =>
        c.chapterId === id
          ? { ...c, chapter: { ...c.chapter, [field]: value }, dirty: true }
          : c,
      ),
    );
  };

  if (bookLoading) {
    return (
      <div
        data-ocid="editor.loading_state"
        className="flex items-center justify-center py-32"
      >
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          data-ocid="editor.back.button"
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          {book?.published && (
            <Badge className="bg-gold text-navy font-semibold">Published</Badge>
          )}
          {!book?.published && (
            <Button
              data-ocid="editor.publish.primary_button"
              onClick={handlePublish}
              disabled={publishingBook}
              className="bg-gold hover:bg-gold-dark text-navy font-semibold gap-2"
            >
              {publishingBook ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookCheck className="w-4 h-4" />
              )}
              {publishingBook ? "Publishing..." : "Publish Book"}
            </Button>
          )}
        </div>
      </div>

      {/* Book Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="font-display text-lg">Book Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <Input
                  data-ocid="editor.title.input"
                  value={meta.title}
                  onChange={(e) => {
                    setMeta((p) => ({ ...p, title: e.target.value }));
                    setMetaDirty(true);
                  }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Author</Label>
                <Input
                  data-ocid="editor.author.input"
                  value={meta.author}
                  onChange={(e) => {
                    setMeta((p) => ({ ...p, author: e.target.value }));
                    setMetaDirty(true);
                  }}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Genre</Label>
              <Select
                value={meta.genre}
                onValueChange={(v) => {
                  setMeta((p) => ({ ...p, genre: v }));
                  setMetaDirty(true);
                }}
              >
                <SelectTrigger
                  data-ocid="editor.genre.select"
                  className="mt-1.5"
                >
                  <SelectValue placeholder="Select genre" />
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
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                data-ocid="editor.description.textarea"
                value={meta.description}
                onChange={(e) => {
                  setMeta((p) => ({ ...p, description: e.target.value }));
                  setMetaDirty(true);
                }}
                className="mt-1.5 resize-none h-24"
              />
            </div>
            <div className="flex justify-end">
              <Button
                data-ocid="editor.save_meta.save_button"
                onClick={handleSaveMeta}
                disabled={!metaDirty || savingMeta}
                className="bg-navy hover:bg-navy-light text-white gap-2"
              >
                {savingMeta ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {savingMeta ? "Saving..." : "Save Details"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chapters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">Chapters</h2>
          <span className="text-sm text-muted-foreground">
            {localChapters.length} chapters
          </span>
        </div>

        {chapsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-navy" />
          </div>
        ) : localChapters.length === 0 ? (
          <div
            data-ocid="chapters.empty_state"
            className="text-center py-16 border-2 border-dashed border-border rounded-xl"
          >
            <p className="text-muted-foreground text-sm mb-4">
              No chapters yet. Start writing!
            </p>
            <Button
              onClick={handleAddChapter}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Chapter
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {localChapters.map((lc, idx) => (
              <motion.div
                key={lc.chapterId.toString()}
                data-ocid={`chapters.item.${idx + 1}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="shadow-card">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      {/* Chapter number + reorder */}
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                        <span className="text-xs font-bold text-navy bg-navy/10 rounded-full w-7 h-7 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <button
                          type="button"
                          data-ocid={`chapters.item.${idx + 1}.button`}
                          onClick={() => handleMove(idx, -1)}
                          disabled={idx === 0}
                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`chapters.item.${idx + 1}.toggle`}
                          onClick={() => handleMove(idx, 1)}
                          disabled={idx === localChapters.length - 1}
                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 space-y-3">
                        <Input
                          data-ocid={`chapters.item.${idx + 1}.input`}
                          value={lc.chapter.title}
                          onChange={(e) =>
                            updateLocalChapter(
                              lc.chapterId,
                              "title",
                              e.target.value,
                            )
                          }
                          placeholder="Chapter title"
                          className="font-semibold text-sm"
                        />
                        <Textarea
                          data-ocid={`chapters.item.${idx + 1}.editor`}
                          value={lc.chapter.content}
                          onChange={(e) =>
                            updateLocalChapter(
                              lc.chapterId,
                              "content",
                              e.target.value,
                            )
                          }
                          placeholder="Start writing your chapter..."
                          className="resize-none min-h-[160px] text-sm leading-relaxed"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {
                              lc.chapter.content.split(/\s+/).filter(Boolean)
                                .length
                            }{" "}
                            words
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              data-ocid={`chapters.item.${idx + 1}.delete_button`}
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
                              onClick={() => handleDeleteChapter(lc.chapterId)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                            <Separator orientation="vertical" className="h-4" />
                            <Button
                              data-ocid={`chapters.item.${idx + 1}.save_button`}
                              size="sm"
                              onClick={() => handleSaveChapter(lc)}
                              disabled={
                                !lc.dirty ||
                                savingChapter === lc.chapterId.toString()
                              }
                              className="bg-navy hover:bg-navy-light text-white h-7 px-3 text-xs gap-1"
                            >
                              {savingChapter === lc.chapterId.toString() ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              {savingChapter === lc.chapterId.toString()
                                ? "Saving..."
                                : lc.dirty
                                  ? "Save"
                                  : "Saved"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            data-ocid="chapters.add.button"
            onClick={handleAddChapter}
            disabled={createChapter.isPending}
            variant="outline"
            className="gap-2 border-dashed"
          >
            {createChapter.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Chapter
          </Button>
        </div>
      </div>
    </div>
  );
}
