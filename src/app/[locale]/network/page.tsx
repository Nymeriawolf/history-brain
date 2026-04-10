'use client';

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Network, BookOpen, Check, X, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Book {
  id: string;
  title: string;
  author: string | null;
  authorNationality: string | null;
  publisher: string | null;
  publishDate: string | null;
  authorBio: string | null;
  authorThoughts: string | null;
}

interface Relationship {
  id: string;
  bookAId: string;
  bookBId: string;
  type: string;
  description: string | null;
  relatedContentA: string | null;
  relatedContentB: string | null;
  bookA: { id: string; title: string; author: string | null };
  bookB: { id: string; title: string; author: string | null };
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  author: string | null;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  type: string;
  description: string | null;
}

export default function NetworkPage() {
  const t = useTranslations('network');
  const tr = useTranslations('relationships');
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [booksRes, relRes] = await Promise.all([
          fetch('/api/books'),
          fetch(`/api/relationships?type=${filterType}`),
        ]);
        const booksData = await booksRes.json();
        const relData = await relRes.json();
        setBooks(booksData);
        setRelationships(relData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, [filterType]);

  // 绘制网络图
  useEffect(() => {
    if (!svgRef.current || books.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 600;

    svg.selectAll('*').remove();

    // 准备节点数据
    const nodes: GraphNode[] = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
    }));

    // 准备边数据
    const links: GraphLink[] = relationships.map((rel) => ({
      id: rel.id,
      source: rel.bookAId,
      target: rel.bookBId,
      type: rel.type,
      description: rel.description,
    }));

    // 创建力导向图
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // 绘制边
    const linkGroup = svg.append('g').attr('class', 'links');

    const link = linkGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        switch (d.type) {
          case 'CORROBORATE':
            return '#22c55e';
          case 'CONFLICT':
            return '#ef4444';
          case 'SUPPLEMENT':
            return '#3b82f6';
          default:
            return '#9ca3af';
        }
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d) =>
        d.type === 'CONFLICT' ? '5,5' : 'none'
      )
      .attr('marker-end', 'url(#arrow)');

    // 添加箭头标记
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 40)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#9ca3af');

    // 绘制节点
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const node = nodeGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // 节点圆形背景
    node
      .append('circle')
      .attr('r', 40)
      .attr('fill', '#fef3c7')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2);

    // 节点文字
    node
      .append('text')
      .text((d) => (d.title.length > 8 ? d.title.slice(0, 8) + '...' : d.title))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', '12px')
      .attr('fill', '#1f2937');

    // 点击节点显示详情
    node.on('click', async (event, d) => {
      const book = books.find((b) => b.id === d.id);
      if (book) {
        const res = await fetch(`/api/books/${book.id}`);
        const fullBook = await res.json();
        setSelectedBook(fullBook);
      }
    });

    // 更新力导向图
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x || 0)
        .attr('y1', (d) => (d.source as GraphNode).y || 0)
        .attr('x2', (d) => (d.target as GraphNode).x || 0)
        .attr('y2', (d) => (d.target as GraphNode).y || 0);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [books, relationships]);

  // 获取书籍关系
  const getBookRelationships = (bookId: string) => {
    return relationships.filter(
      (r) => r.bookAId === bookId || r.bookBId === bookId
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
        <Network className="h-8 w-8 text-amber-600" />
        {t('title')}
      </h1>

      {/* 筛选器 */}
      <div className="flex gap-4 mb-6">
        <span className="text-gray-600 dark:text-gray-300 self-center">
          {t('filterType')}
        </span>
        <div className="flex gap-2">
          {[
            { value: 'all', label: t('all') },
            { value: 'CORROBORATE', label: t('corroborate') },
            { value: 'CONFLICT', label: t('conflict') },
            { value: 'SUPPLEMENT', label: t('supplement') },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterType(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterType === filter.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-amber-200 dark:border-gray-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 网络图 */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-amber-100 dark:border-gray-700">
          {books.length === 0 ? (
            <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available
            </div>
          ) : (
            <svg
              ref={svgRef}
              className="w-full"
              style={{ height: '600px' }}
            />
          )}

          {/* 图例 */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-300">{t('corroborate')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-red-500 border-dashed border-t-2 border-red-500"></div>
              <span className="text-gray-600 dark:text-gray-300">{t('conflict')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-300">{t('supplement')}</span>
            </div>
          </div>
        </div>

        {/* 书籍详情面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-amber-100 dark:border-gray-700">
          {selectedBook ? (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600" />
                {selectedBook.title}
              </h3>

              <div className="space-y-3 text-sm">
                {selectedBook.author && (
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('author')}:</span> {selectedBook.author}
                  </p>
                )}
                {selectedBook.authorNationality && (
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('nationality')}:</span> {selectedBook.authorNationality}
                  </p>
                )}
                {selectedBook.publisher && (
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('publisher')}:</span> {selectedBook.publisher}
                  </p>
                )}
                {selectedBook.publishDate && (
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('publishTime')}:</span> {selectedBook.publishDate}
                  </p>
                )}
                {selectedBook.authorBio && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">{t('authorLife')}:</p>
                    <p className="text-gray-600 dark:text-gray-300">{selectedBook.authorBio}</p>
                  </div>
                )}
                {selectedBook.authorThoughts && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">{t('mainThoughts')}:</p>
                    <p className="text-gray-600 dark:text-gray-300">{selectedBook.authorThoughts}</p>
                  </div>
                )}
              </div>

              {/* 与其他书籍的关系 */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">
                  {t('relationships')}
                </h4>
                {getBookRelationships(selectedBook.id).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('noRelationships')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getBookRelationships(selectedBook.id).map((rel) => {
                      const otherBook =
                        rel.bookAId === selectedBook.id ? rel.bookB : rel.bookA;
                      const isCorroborate = rel.type === 'CORROBORATE';
                      const isConflict = rel.type === 'CONFLICT';

                      return (
                        <div
                          key={rel.id}
                          className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                        >
                          {isCorroborate ? (
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          ) : isConflict ? (
                            <X className="h-4 w-4 text-red-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-200">
                              《{otherBook.title}》 {tr(rel.type)}
                            </p>
                            {rel.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {rel.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              {t('clickNode')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
