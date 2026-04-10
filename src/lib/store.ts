import { create } from 'zustand';
import { Book, Law, Relationship, AIConfig, LawCategory } from '@/types';

interface AppState {
  // 书籍
  books: Book[];
  currentBook: Book | null;
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  setCurrentBook: (book: Book | null) => void;

  // 规律
  laws: Law[];
  setLaws: (laws: Law[]) => void;
  addLaw: (law: Law) => void;
  addLaws: (laws: Law[]) => void;

  // 关系
  relationships: Relationship[];
  setRelationships: (relationships: Relationship[]) => void;
  addRelationship: (relationship: Relationship) => void;

  // AI配置
  aiConfig: AIConfig | null;
  setAIConfig: (config: AIConfig | null) => void;

  // 筛选
  selectedCategory: LawCategory | 'all';
  setSelectedCategory: (category: LawCategory | 'all') => void;

  // UI状态
  isAnalyzing: boolean;
  setIsAnalyzing: (status: boolean) => void;
  analyzingBookId: string | null;
  setAnalyzingBookId: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // 书籍
  books: [],
  currentBook: null,
  setBooks: (books) => set({ books }),
  addBook: (book) => set((state) => ({ books: [...state.books, book] })),
  updateBook: (id, updates) =>
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),
  setCurrentBook: (book) => set({ currentBook: book }),

  // 规律
  laws: [],
  setLaws: (laws) => set({ laws }),
  addLaw: (law) => set((state) => ({ laws: [...state.laws, law] })),
  addLaws: (laws) => set((state) => ({ laws: [...state.laws, ...laws] })),

  // 关系
  relationships: [],
  setRelationships: (relationships) => set({ relationships }),
  addRelationship: (relationship) =>
    set((state) => ({ relationships: [...state.relationships, relationship] })),

  // AI配置
  aiConfig: null,
  setAIConfig: (config) => set({ aiConfig: config }),

  // 筛选
  selectedCategory: 'all',
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // UI状态
  isAnalyzing: false,
  setIsAnalyzing: (status) => set({ isAnalyzing: status }),
  analyzingBookId: null,
  setAnalyzingBookId: (id) => set({ analyzingBookId: id }),
}));
