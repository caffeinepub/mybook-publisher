import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Book, BookId, Chapter, ChapterId } from "../backend.d";
import { useActor } from "./useActor";

export type { Book, BookId, Chapter, ChapterId };

export function useGetAllBooks() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[BookId, Book]>>({
    queryKey: ["books"],
    queryFn: async () => {
      if (!actor) return [];
      const books = await actor.getAllBooks();
      return books.map((b, i) => [BigInt(i), b] as [BookId, Book]);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBook(bookId: BookId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Book>({
    queryKey: ["book", bookId?.toString()],
    queryFn: async () => {
      if (!actor || bookId === null) throw new Error("No actor or bookId");
      return actor.getBook(bookId);
    },
    enabled: !!actor && !isFetching && bookId !== null,
  });
}

export function useGetChaptersByBook(bookId: BookId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[ChapterId, Chapter]>>({
    queryKey: ["chapters", bookId?.toString()],
    queryFn: async () => {
      if (!actor || bookId === null) return [];
      const chapters = await actor.getChaptersByBook(bookId);
      return chapters.map((c, i) => [BigInt(i), c] as [ChapterId, Chapter]);
    },
    enabled: !!actor && !isFetching && bookId !== null,
  });
}

export function useCreateBook() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      author: string;
      genre: string;
      description: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createBook(
        data.title,
        data.author,
        data.genre,
        data.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useUpdateBook() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      bookId: BookId;
      title: string;
      author: string;
      genre: string;
      description: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateBook(
        data.bookId,
        data.title,
        data.author,
        data.genre,
        data.description,
      );
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["book", vars.bookId.toString()] });
    },
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: BookId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteBook(bookId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function usePublishBook() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: BookId) => {
      if (!actor) throw new Error("No actor");
      return actor.publishBook(bookId);
    },
    onSuccess: (_d, bookId) => {
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["book", bookId.toString()] });
    },
  });
}

export function useCreateChapter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      bookId: BookId;
      title: string;
      content: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createChapter(data.bookId, data.title, data.content);
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["chapters", vars.bookId.toString()] }),
  });
}

export function useUpdateChapter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      chapterId: ChapterId;
      title: string;
      content: string;
      bookId: BookId;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateChapter(data.chapterId, data.title, data.content);
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["chapters", vars.bookId.toString()] }),
  });
}

export function useDeleteChapter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { chapterId: ChapterId; bookId: BookId }) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteChapter(data.chapterId);
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["chapters", vars.bookId.toString()] }),
  });
}

export function useReorderChapters() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { bookId: BookId; newOrder: ChapterId[] }) => {
      if (!actor) throw new Error("No actor");
      return actor.reorderChapters(data.bookId, data.newOrder);
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["chapters", vars.bookId.toString()] }),
  });
}
