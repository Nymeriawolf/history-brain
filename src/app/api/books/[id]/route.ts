import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/client';

// 删除书籍
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 删除书籍（级联删除会自动删除相关规律和关系）
    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除书籍失败:', error);
    return NextResponse.json({ error: '删除书籍失败' }, { status: 500 });
  }
}

// 获取单个书籍
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        laws: {
          orderBy: { createdAt: 'desc' },
        },
        relationshipsA: {
          include: {
            bookB: {
              select: { id: true, title: true, author: true },
            },
          },
        },
        relationshipsB: {
          include: {
            bookA: {
              select: { id: true, title: true, author: true },
            },
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: '书籍不存在' }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('获取书籍失败:', error);
    return NextResponse.json({ error: '获取书籍失败' }, { status: 500 });
  }
}
