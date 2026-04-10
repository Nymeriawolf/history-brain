import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/client';

// 获取所有规律
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const bookId = searchParams.get('bookId');

    const where: Record<string, unknown> = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (bookId) {
      where.bookId = bookId;
    }

    const laws = await prisma.law.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return NextResponse.json(laws);
  } catch (error) {
    console.error('获取规律列表失败:', error);
    return NextResponse.json({ error: '获取规律列表失败' }, { status: 500 });
  }
}
