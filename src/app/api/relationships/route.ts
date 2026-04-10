import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/client';

// 获取所有关系
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (type && type !== 'all') {
      where.type = type;
    }

    const relationships = await prisma.relationship.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        bookA: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
        bookB: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return NextResponse.json(relationships);
  } catch (error) {
    console.error('获取关系列表失败:', error);
    return NextResponse.json({ error: '获取关系列表失败' }, { status: 500 });
  }
}
