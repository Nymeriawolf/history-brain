import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/client';
import { analyzeWithAI, parseLawsFromAI } from '@/lib/ai/provider';
import { v4 as uuidv4 } from 'uuid';

// 分析书籍
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取书籍
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return NextResponse.json({ error: '书籍不存在' }, { status: 404 });
    }

    if (!book.content) {
      return NextResponse.json({ error: '书籍内容为空' }, { status: 400 });
    }

    // 更新状态为分析中
    await prisma.book.update({
      where: { id },
      data: { status: 'analyzing' },
    });

    // 获取AI配置
    const aiConfig = await prisma.apiConfig.findFirst({
      where: { isActive: true },
    });

    if (!aiConfig) {
      await prisma.book.update({
        where: { id },
        data: { status: 'error' },
      });
      return NextResponse.json({ error: '请先配置AI API' }, { status: 400 });
    }

    // 分析内容
    let laws: Array<{
      category: string;
      title: string;
      description: string;
      evidence: string;
      timePeriod: string;
      region: string;
      confidence: number;
    }> = [];

    try {
      // 截取内容，避免超出token限制
      const contentToAnalyze = book.content.slice(0, 30000);
      const response = await analyzeWithAI(
        aiConfig.provider as 'openai' | 'claude' | 'deepseek' | 'custom',
        {
          apiKey: aiConfig.apiKey,
          baseUrl: aiConfig.baseUrl || undefined,
          modelName: aiConfig.modelName || undefined,
        },
        contentToAnalyze
      );
      laws = parseLawsFromAI(response);
    } catch (aiError) {
      console.error('AI分析失败:', aiError);
      await prisma.book.update({
        where: { id },
        data: { status: 'error' },
      });
      return NextResponse.json({ error: 'AI分析失败，请检查API配置' }, { status: 500 });
    }

    // 保存规律
    const createdLaws = await Promise.all(
      laws.map((law) =>
        prisma.law.create({
          data: {
            id: uuidv4(),
            bookId: id,
            category: law.category || '自定义',
            title: law.title,
            description: law.description,
            evidence: law.evidence,
            confidence: law.confidence || 0.5,
            timePeriod: law.timePeriod,
            region: law.region,
          },
        })
      )
    );

    // 更新书籍状态
    await prisma.book.update({
      where: { id },
      data: { status: 'completed' },
    });

    // 分析与其他书籍的关系
    await analyzeRelationships(id);

    return NextResponse.json({
      message: '分析完成',
      laws: createdLaws,
    });
  } catch (error) {
    console.error('分析书籍失败:', error);
    return NextResponse.json({ error: '分析书籍失败' }, { status: 500 });
  }
}

// 分析书籍关系
async function analyzeRelationships(bookId: string) {
  // 获取当前书籍的规律
  const currentLaws = await prisma.law.findMany({
    where: { bookId },
  });

  // 获取其他已分析的书籍
  const otherBooks = await prisma.book.findMany({
    where: {
      id: { not: bookId },
      status: 'completed',
    },
    include: { laws: true },
  });

  // 简单的关系分析：基于规律的相似性
  for (const otherBook of otherBooks) {
    // 检查是否已存在关系
    const existingRelation = await prisma.relationship.findFirst({
      where: {
        OR: [
          { bookAId: bookId, bookBId: otherBook.id },
          { bookAId: otherBook.id, bookBId: bookId },
        ],
      },
    });

    if (existingRelation) continue;

    // 分析规律相似性
    let corroborations = 0;
    let conflicts = 0;
    const evidenceA: string[] = [];
    const evidenceB: string[] = [];

    for (const currentLaw of currentLaws) {
      for (const otherLaw of otherBook.laws) {
        // 如果是同一类别且描述相似，则认为印证
        if (currentLaw.category === otherLaw.category) {
          // 简单的关键词匹配
          const keywords = extractKeywords(currentLaw.description);
          const otherKeywords = extractKeywords(otherLaw.description);
          const commonKeywords = keywords.filter((k) => otherKeywords.includes(k));

          if (commonKeywords.length > 2) {
            corroborations++;
            evidenceA.push(currentLaw.title);
            evidenceB.push(otherLaw.title);
          }
        }
      }
    }

    // 创建关系
    if (corroborations > 0 || conflicts > 0) {
      const type = corroborations > conflicts ? 'CORROBORATE' : 'CONFLICT';
      await prisma.relationship.create({
        data: {
          id: uuidv4(),
          bookAId: bookId,
          bookBId: otherBook.id,
          type,
          description: `发现${corroborations}处内容印证`,
          relatedContentA: evidenceA.slice(0, 3).join('; '),
          relatedContentB: evidenceB.slice(0, 3).join('; '),
        },
      });
    }
  }
}

// 提取关键词（简单实现）
function extractKeywords(text: string): string[] {
  const stopWords = ['的', '了', '是', '在', '和', '与', '有', '为', '以', '及', '等', '中', '对', '将', '被', '从', '到', '由', '于', '但', '而', '或', '且', '也', '都', '就', '着', '过', '要', '能', '会', '可', '这', '那', '它', '他', '她', '我', '你', '们'];
  return text
    .split(/[\s，。！？、；：""''（）【】《》\n]+/)
    .filter((word) => word.length > 1 && !stopWords.includes(word));
}
