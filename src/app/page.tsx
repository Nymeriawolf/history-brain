'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Book,
  Upload,
  FileText,
  Brain,
  Loader2,
  Trash2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { LawCategory } from '@/types';

// 书籍卡片组件
function BookCard({
  book,
  onAnalyze,
  onDelete,
  isAnalyzing,
}: {
  book: {
    id: string;
    title: string;
    author: string | null;
    status: string;
    createdAt: string;
    _count?: { laws: number };
  };
  onAnalyze: (id: string) => void;
  onDelete: (id: string) => void;
  isAnalyzing: boolean;
}) {
  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600',
    analyzing: 'bg-blue-100 text-blue-600',
    completed: 'bg-green-100 text-green-600',
    error: 'bg-red-100 text-red-600',
  };

  const statusText: Record<string, string> = {
    pending: '待分析',
    analyzing: '分析中',
    completed: '已完成',
    error: '分析失败',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-amber-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
          {book.title}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${statusColors[book.status]}`}
        >
          {statusText[book.status]}
        </span>
      </div>
      {book.author && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          作者: {book.author}
        </p>
      )}
      {book._count && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
          已提炼 {book._count.laws} 条规律
        </p>
      )}
      <div className="flex gap-2">
        {book.status === 'pending' && (
          <button
            onClick={() => onAnalyze(book.id)}
            disabled={isAnalyzing}
            className="flex-1 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            开始研究
          </button>
        )}
        <button
          onClick={() => onDelete(book.id)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// 规律卡片组件
function LawCard({ law }: { law: {
  id: string;
  category: string;
  title: string;
  description: string;
  evidence: string | null;
  confidence: number;
  timePeriod: string | null;
  region: string | null;
  book?: { title: string; author: string | null };
} }) {
  const categoryIcons: Record<string, string> = {
    技术发展: '🔧',
    人口发展: '📊',
    地区发展: '🌍',
    文化演进: '🎭',
    经济发展: '💰',
    社会发展: '🏛️',
    自定义: '📌',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-amber-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{categoryIcons[law.category] || '📌'}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {law.title}
          </h3>
          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">
            {law.category}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
        {law.description}
      </p>
      {law.evidence && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2">
            &ldquo;{law.evidence}&rdquo;
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
        {law.timePeriod && (
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            📅 {law.timePeriod}
          </span>
        )}
        {law.region && (
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            📍 {law.region}
          </span>
        )}
        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
          置信度: {Math.round(law.confidence * 100)}%
        </span>
      </div>
      {law.book && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            来源: 《{law.book.title}》{law.book.author && ` - ${law.book.author}`}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [books, setBooks] = useState<Array<{
    id: string;
    title: string;
    author: string | null;
    status: string;
    createdAt: string;
    _count?: { laws: number };
  }>>([]);
  const [laws, setLaws] = useState<Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    evidence: string | null;
    confidence: number;
    timePeriod: string | null;
    region: string | null;
    book?: { title: string; author: string | null };
  }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<LawCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [analyzingBookId, setAnalyzingBookId] = useState<string | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    authorNationality: '',
    publisher: '',
    publishDate: '',
    authorBio: '',
    authorThoughts: '',
    content: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const categories: (LawCategory | 'all')[] = [
    'all',
    '技术发展',
    '人口发展',
    '地区发展',
    '文化演进',
    '经济发展',
    '社会发展',
    '自定义',
  ];

  // 加载数据
  const loadBooks = useCallback(async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error('加载书籍失败:', error);
    }
  }, []);

  const loadLaws = useCallback(async () => {
    try {
      const url =
        selectedCategory === 'all'
          ? '/api/laws'
          : `/api/laws?category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      setLaws(data);
    } catch (error) {
      console.error('加载规律失败:', error);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadBooks();
    loadLaws();
  }, [loadBooks, loadLaws]);

  // 提交书籍
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'upload' && uploadedFile) {
      const fd = new FormData();
      fd.append('file', uploadedFile);
      fd.append('title', formData.title);
      fd.append('author', formData.author);
      fd.append('authorNationality', formData.authorNationality);
      fd.append('publisher', formData.publisher);
      fd.append('publishDate', formData.publishDate);
      fd.append('authorBio', formData.authorBio);
      fd.append('authorThoughts', formData.authorThoughts);

      try {
        await fetch('/api/upload', { method: 'POST', body: fd });
        setFormData({
          title: '',
          author: '',
          authorNationality: '',
          publisher: '',
          publishDate: '',
          authorBio: '',
          authorThoughts: '',
          content: '',
        });
        setUploadedFile(null);
        loadBooks();
      } catch (error) {
        console.error('上传失败:', error);
      }
    } else if (activeTab === 'text' && formData.content) {
      try {
        await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setFormData({
          title: '',
          author: '',
          authorNationality: '',
          publisher: '',
          publishDate: '',
          authorBio: '',
          authorThoughts: '',
          content: '',
        });
        loadBooks();
      } catch (error) {
        console.error('创建书籍失败:', error);
      }
    }
  };

  // 分析书籍
  const handleAnalyze = async (id: string) => {
    setAnalyzingBookId(id);
    try {
      const res = await fetch(`/api/books/${id}/analyze`, { method: 'POST' });
      if (res.ok) {
        loadBooks();
        loadLaws();
      }
    } catch (error) {
      console.error('分析失败:', error);
    } finally {
      setAnalyzingBookId(null);
    }
  };

  // 删除书籍
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这本书吗？')) return;

    try {
      // 使用 Prisma 的级联删除会自动删除相关规律
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadBooks();
        loadLaws();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 添加书籍区域 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Book className="h-6 w-6 text-amber-600" />
          添加新书籍
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-amber-100 dark:border-gray-700">
          {/* 标签切换 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Upload className="h-4 w-4" />
              上传文件
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'text'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FileText className="h-4 w-4" />
              粘贴文本
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 左侧：文件/文本输入 */}
              <div>
                {activeTab === 'upload' ? (
                  <div className="border-2 border-dashed border-amber-200 dark:border-gray-600 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".pdf,.txt,.md"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          if (!formData.title) {
                            setFormData((prev) => ({
                              ...prev,
                              title: file.name.replace(/\.[^/.]+$/, ''),
                            }));
                          }
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-12 w-12 text-amber-400 mb-4" />
                      <span className="text-gray-600 dark:text-gray-300">
                        拖拽文件到此处或点击上传
                      </span>
                      <span className="text-sm text-gray-400 mt-2">
                        支持 PDF、TXT、MD 格式
                      </span>
                    </label>
                    {uploadedFile && (
                      <div className="mt-4 p-2 bg-amber-50 dark:bg-amber-900/30 rounded">
                        <span className="text-amber-600 dark:text-amber-400">
                          ✓ {uploadedFile.name}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="在此粘贴书籍文本内容..."
                    className="w-full h-64 p-4 border border-gray-200 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                )}
              </div>

              {/* 右侧：书籍信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    书名 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      作者
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      作者国籍
                    </label>
                    <input
                      type="text"
                      value={formData.authorNationality}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          authorNationality: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      出版社
                    </label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) =>
                        setFormData({ ...formData, publisher: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      出版日期
                    </label>
                    <input
                      type="text"
                      value={formData.publishDate}
                      onChange={(e) =>
                        setFormData({ ...formData, publishDate: e.target.value })
                      }
                      placeholder="如: 2006年"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    作者生平简介
                  </label>
                  <textarea
                    value={formData.authorBio}
                    onChange={(e) =>
                      setFormData({ ...formData, authorBio: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    作者主要思想
                  </label>
                  <textarea
                    value={formData.authorThoughts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authorThoughts: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={
                  (activeTab === 'upload' && !uploadedFile) ||
                  (activeTab === 'text' && !formData.content) ||
                  !formData.title
                }
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
                添加书籍
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 已学习书籍 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-amber-600" />
          已学习书籍
        </h2>
        {books.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            暂无书籍，请先添加
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onAnalyze={handleAnalyze}
                onDelete={handleDelete}
                isAnalyzing={analyzingBookId === book.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* 提炼的规律 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Brain className="h-6 w-6 text-amber-600" />
          提炼的规律
        </h2>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700 border border-amber-200 dark:border-gray-600'
              }`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>

        {laws.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            暂无规律，请先分析书籍
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {laws.map((law) => (
              <LawCard key={law.id} law={law} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
