import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Nat "mo:core/Nat";

actor {
  type BookId = Nat;
  type ChapterId = Nat;

  var nextBookId : BookId = 0;
  var nextChapterId : ChapterId = 0;

  type Book = {
    title : Text;
    author : Text;
    genre : Text;
    description : Text;
    published : Bool;
    chapterOrder : [ChapterId];
  };

  type Chapter = {
    bookId : BookId;
    title : Text;
    content : Text;
    order : Nat;
  };

  module Book {
    public func compare(book1 : Book, book2 : Book) : Order.Order {
      Text.compare(book1.title, book2.title);
    };
  };

  module Chapter {
    public func compare(chapter1 : Chapter, chapter2 : Chapter) : Order.Order {
      Nat.compare(chapter1.order, chapter2.order);
    };
  };

  let books = Map.empty<BookId, Book>();
  let chapters = Map.empty<ChapterId, Chapter>();

  func getBookInternal(bookId : BookId) : Book {
    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };
  };

  func getChapterInternal(chapterId : ChapterId) : Chapter {
    switch (chapters.get(chapterId)) {
      case (null) { Runtime.trap("Chapter not found") };
      case (?chapter) { chapter };
    };
  };

  public shared ({ caller }) func createBook(title : Text, author : Text, genre : Text, description : Text) : async BookId {
    let bookId = nextBookId;
    nextBookId += 1;

    let newBook : Book = {
      title;
      author;
      genre;
      description;
      published = false;
      chapterOrder = [];
    };

    books.add(bookId, newBook);
    bookId;
  };

  public shared ({ caller }) func updateBook(bookId : BookId, title : Text, author : Text, genre : Text, description : Text) : async () {
    let book = getBookInternal(bookId);
    let updatedBook : Book = {
      book with
      title;
      author;
      genre;
      description;
    };
    books.add(bookId, updatedBook);
  };

  public shared ({ caller }) func deleteBook(bookId : BookId) : async () {
    ignore getBookInternal(bookId);
    books.remove(bookId);

    // Remove all chapters belonging to this book
    for ((chapterId, chapter) in chapters.entries()) {
      if (chapter.bookId == bookId) {
        chapters.remove(chapterId);
      };
    };
  };

  public shared ({ caller }) func publishBook(bookId : BookId) : async () {
    let book = getBookInternal(bookId);
    let publishedBook : Book = {
      book with
      published = true;
    };
    books.add(bookId, publishedBook);
  };

  public shared ({ caller }) func createChapter(bookId : BookId, title : Text, content : Text) : async ChapterId {
    ignore getBookInternal(bookId);

    let chapterId = nextChapterId;
    nextChapterId += 1;

    let newChapter : Chapter = {
      bookId;
      title;
      content;
      order = chapterId;
    };

    chapters.add(chapterId, newChapter);

    // Update book's chapter order
    let book = getBookInternal(bookId);
    let updatedBook : Book = {
      book with
      chapterOrder = book.chapterOrder.concat([chapterId]);
    };
    books.add(bookId, updatedBook);

    chapterId;
  };

  public shared ({ caller }) func updateChapter(chapterId : ChapterId, title : Text, content : Text) : async () {
    let chapter = getChapterInternal(chapterId);
    let updatedChapter : Chapter = {
      chapter with
      title;
      content;
    };
    chapters.add(chapterId, updatedChapter);
  };

  public shared ({ caller }) func deleteChapter(chapterId : ChapterId) : async () {
    let chapter = getChapterInternal(chapterId);
    chapters.remove(chapterId);

    // Remove chapter from book's chapter order
    let book = getBookInternal(chapter.bookId);
    let updatedBook : Book = {
      book with
      chapterOrder = book.chapterOrder.filter(func(id) { id != chapterId });
    };
    books.add(chapter.bookId, updatedBook);
  };

  public shared ({ caller }) func reorderChapters(bookId : BookId, newOrder : [ChapterId]) : async () {
    let book = getBookInternal(bookId);

    // Validate that all chapters belong to this book
    for (chapterId in newOrder.values()) {
      let chapter = getChapterInternal(chapterId);
      if (chapter.bookId != bookId) {
        Runtime.trap("Chapter does not belong to this book");
      };
    };

    let updatedBook : Book = {
      book with
      chapterOrder = newOrder;
    };
    books.add(bookId, updatedBook);

    // Update order field in chapters
    var index = 0;
    for (chapterId in newOrder.values()) {
      let chapter = getChapterInternal(chapterId);
      let updatedChapter : Chapter = {
        chapter with
        order = index;
      };
      chapters.add(chapterId, updatedChapter);
      index += 1;
    };
  };

  public query ({ caller }) func getBook(bookId : BookId) : async Book {
    getBookInternal(bookId);
  };

  public query ({ caller }) func getAllBooks() : async [Book] {
    books.values().toArray().sort();
  };

  public query ({ caller }) func getChapter(chapterId : ChapterId) : async Chapter {
    getChapterInternal(chapterId);
  };

  public query ({ caller }) func getChaptersByBook(bookId : BookId) : async [Chapter] {
    chapters.values().toArray().filter(func(chapter) { chapter.bookId == bookId }).sort();
  };
};
