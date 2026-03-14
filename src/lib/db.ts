import localforage from 'localforage';
import { db, auth } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface BookmarkPin {
  id: string;
  page: number;
  x: number;
  y: number;
  color: string;
}

export interface Highlight {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface StickyNote {
  id: string;
  page: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface Book {
  id: string;
  title: string;
  coverUrl?: string;
  fileData?: ArrayBuffer; // Optional because it might not be loaded yet or might be missing on a new device
  videoData?: ArrayBuffer; // Optional video animation of the cover
  hasVideo?: boolean; // Flag to indicate if video data exists in local storage
  lastOpened: number;
  currentPage: number;
  totalPages: number;
  type: 'pdf' | 'epub' | 'txt';
  pins?: BookmarkPin[];
  highlights?: Highlight[];
  stickyNotes?: StickyNote[];
  status?: 'reading' | 'read';
}

const localDb = localforage.createInstance({
  name: 'flipverse',
  storeName: 'books_files'
});

export const saveBook = async (book: Book) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  // Save file data locally
  if (book.fileData) {
    await localDb.setItem(book.id, book.fileData);
  }
  if (book.videoData) {
    await localDb.setItem(`${book.id}_video`, book.videoData);
    book.hasVideo = true;
  }

  // Save metadata to Firestore
  const { fileData, videoData, ...metadata } = book;
  const path = `users/${userId}/books/${book.id}`;
  const bookRef = doc(db, path);
  try {
    await setDoc(bookRef, metadata);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateBookProgress = async (id: string, currentPage: number, lastOpened: number) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const path = `users/${userId}/books/${id}`;
  const bookRef = doc(db, path);
  try {
    await updateDoc(bookRef, {
      currentPage,
      lastOpened
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getBook = async (id: string): Promise<Book | null> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const path = `users/${userId}/books/${id}`;
  const bookRef = doc(db, path);
  try {
    const docSnap = await getDoc(bookRef);

    if (docSnap.exists()) {
      const metadata = docSnap.data() as Omit<Book, 'fileData' | 'videoData'>;
      const fileData = await localDb.getItem<ArrayBuffer>(id);
      const videoData = await localDb.getItem<ArrayBuffer>(`${id}_video`);
      return { ...metadata, fileData: fileData || undefined, videoData: videoData || undefined };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return null;
};

export const getAllBooks = async (): Promise<Book[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const path = `users/${userId}/books`;
  const booksRef = collection(db, path);
  try {
    const snapshot = await getDocs(booksRef);
    
    const books: Book[] = [];
    snapshot.forEach(doc => {
      books.push({ id: doc.id, ...doc.data() } as Book);
    });
    
    return books.sort((a, b) => b.lastOpened - a.lastOpened);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
  return [];
};

export const deleteBook = async (id: string) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  await localDb.removeItem(id);
  await localDb.removeItem(`${id}_video`);
  const path = `users/${userId}/books/${id}`;
  const bookRef = doc(db, path);
  try {
    await deleteDoc(bookRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const subscribeToBooks = (callback: (books: Book[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    callback([]);
    return () => {};
  }

  const path = `users/${userId}/books`;
  const booksRef = collection(db, path);
  return onSnapshot(booksRef, (snapshot) => {
    const books: Book[] = [];
    snapshot.forEach(doc => {
      books.push({ id: doc.id, ...doc.data() } as Book);
    });
    callback(books.sort((a, b) => b.lastOpened - a.lastOpened));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};
