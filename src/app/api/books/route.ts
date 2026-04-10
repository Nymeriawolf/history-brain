import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/client';
import { v4 as uuidv4 } from 'uuid';

// 获取所有书籍
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { laws: true },
        },
      },
    });
    return NextResponse.json(books);
  } catch (error) {
    console.error('获取书籍列表失败:', error);
    return NextResponse.json({ error: '获取书籍列表失败' }, { status: 500 });
  }
}

// 创建新书籍
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, authorNationality, publisher, publishDate, authorBio, authorThoughts, content } = body;

    if (!title) {
      return NextResponse.json({ error: '书名不能为空' }, { status: 400 });
    }

    const book = await prisma.book.create({
      data: {
        id: uuidv4(),
        title,
        author: author || null,
        authorNationality: authorNationality || null,
        publisher: publisher || null,
        publishDate: publishDate || null,
        authorBio: authorBio || null,
        authorThoughts: authorThoughts || null,
        content: content || null,
        status: 'pending',
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('创建书籍失败:', error);
    return NextResponse.json({ error: '创建书籍失败' }, { status: 500 });
  }
}
