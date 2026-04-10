import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from '@/lib/parser';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const content = await parseFile(buffer, file.name);

    if (!content) {
      return NextResponse.json({ error: '不支持的文件格式' }, { status: 400 });
    }

    // 创建书籍记录
    const book = await prisma.book.create({
      data: {
        id: uuidv4(),
        title: (formData.get('title') as string) || file.name.replace(/\.[^/.]+$/, ''),
        author: (formData.get('author') as string) || null,
        authorNationality: (formData.get('authorNationality') as string) || null,
        publisher: (formData.get('publisher') as string) || null,
        publishDate: (formData.get('publishDate') as string) || null,
        authorBio: (formData.get('authorBio') as string) || null,
        authorThoughts: (formData.get('authorThoughts') as string) || null,
        content,
        status: 'pending',
      },
    });

    return NextResponse.json({
      message: '文件上传成功',
      book,
      contentLength: content.length,
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json({ error: '文件上传失败' }, { status: 500 });
  }
}
