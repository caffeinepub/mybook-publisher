import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Book {
    title: string;
    published: boolean;
    description: string;
    author: string;
    genre: string;
    chapterOrder: Array<ChapterId>;
}
export type BookId = bigint;
export interface Chapter {
    title: string;
    content: string;
    order: bigint;
    bookId: BookId;
}
export type ChapterId = bigint;
export interface backendInterface {
    createBook(title: string, author: string, genre: string, description: string): Promise<BookId>;
    createChapter(bookId: BookId, title: string, content: string): Promise<ChapterId>;
    deleteBook(bookId: BookId): Promise<void>;
    deleteChapter(chapterId: ChapterId): Promise<void>;
    getAllBooks(): Promise<Array<Book>>;
    getBook(bookId: BookId): Promise<Book>;
    getChapter(chapterId: ChapterId): Promise<Chapter>;
    getChaptersByBook(bookId: BookId): Promise<Array<Chapter>>;
    publishBook(bookId: BookId): Promise<void>;
    reorderChapters(bookId: BookId, newOrder: Array<ChapterId>): Promise<void>;
    updateBook(bookId: BookId, title: string, author: string, genre: string, description: string): Promise<void>;
    updateChapter(chapterId: ChapterId, title: string, content: string): Promise<void>;
}
