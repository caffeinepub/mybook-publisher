import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import {
  type BookId,
  useGetBook,
  useGetChaptersByBook,
} from "../hooks/useQueries";

interface ReaderProps {
  bookId: BookId;
  onBack: () => void;
}

export default function Reader({ bookId, onBack }: ReaderProps) {
  const { data: book, isLoading: bookLoading } = useGetBook(bookId);
  const { data: chapters, isLoading: chapsLoading } =
    useGetChaptersByBook(bookId);

  const isLoading = bookLoading || chapsLoading;

  const sortedChapters = chapters
    ? [...chapters].sort(([, a], [, b]) => Number(a.order) - Number(b.order))
    : [];

  if (isLoading) {
    return (
      <div
        data-ocid="reader.loading_state"
        className="flex items-center justify-center py-32"
      >
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Reader header */}
      <div
        className="py-10 px-6 text-center relative"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.25 0.04 230) 0%, oklch(0.48 0.06 75) 100%)",
        }}
      >
        <button
          type="button"
          data-ocid="reader.back.button"
          onClick={onBack}
          className="absolute left-6 top-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-gold" />
          </div>
          {book?.published && (
            <Badge className="bg-gold text-navy font-semibold mb-3">
              Published
            </Badge>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            {book?.title}
          </h1>
          <p className="text-white/70 text-base">by {book?.author}</p>
          {book?.genre && (
            <p className="text-white/50 text-sm mt-1">{book.genre}</p>
          )}
          {book?.description && (
            <p className="text-white/70 text-sm mt-4 leading-relaxed max-w-lg mx-auto italic">
              {book.description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {sortedChapters.length === 0 ? (
          <div data-ocid="reader.empty_state" className="text-center py-16">
            <p className="text-muted-foreground">
              No chapters yet. Start writing in the editor!
            </p>
            <Button onClick={onBack} variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedChapters.map(([chapterId, chapter], idx) => (
              <motion.article
                key={chapterId.toString()}
                data-ocid={`reader.chapter.${idx + 1}.panel`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-bold tracking-widest text-gold uppercase">
                    Chapter {idx + 1}
                  </span>
                  <Separator className="flex-1" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  {chapter.title}
                </h2>
                <div className="prose prose-neutral max-w-none">
                  {chapter.content.split("\n\n").map((para, pIdx) => (
                    <p
                      key={`${chapterId.toString()}-p${pIdx}`}
                      className="text-foreground/80 leading-[1.85] text-[1.0625rem] mb-5 first:mt-0"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </motion.article>
            ))}

            <div className="pt-8 pb-4 text-center">
              <Separator className="mb-8" />
              <p className="text-muted-foreground text-sm italic font-display">
                — End of {book?.title} —
              </p>
              <Button
                data-ocid="reader.back.secondary_button"
                onClick={onBack}
                variant="outline"
                className="mt-6 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
