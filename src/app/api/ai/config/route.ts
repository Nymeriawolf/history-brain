import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/client';
import { v4 as uuidv4 } from 'uuid';

// 获取AI配置
export async function GET() {
  try {
    const configs = await prisma.apiConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // 隐藏API Key
    const safeConfigs = configs.map((c) => ({
      ...c,
      apiKey: c.apiKey ? '******' + c.apiKey.slice(-4) : '',
    }));
    return NextResponse.json(safeConfigs);
  } catch (error) {
    console.error('获取AI配置失败:', error);
    return NextResponse.json({ error: '获取AI配置失败' }, { status: 500 });
  }
}

// 创建或更新AI配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, apiKey, baseUrl, modelName } = body;

    if (!provider || !apiKey) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 将其他配置设为非活跃
    await prisma.apiConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // 创建新配置
    const config = await prisma.apiConfig.create({
      data: {
        id: uuidv4(),
        provider,
        apiKey,
        baseUrl: baseUrl || null,
        modelName: modelName || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      ...config,
      apiKey: '******' + apiKey.slice(-4),
    });
  } catch (error) {
    console.error('保存AI配置失败:', error);
    return NextResponse.json({ error: '保存AI配置失败' }, { status: 500 });
  }
}

// 删除AI配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }

    await prisma.apiConfig.delete({
      where: { id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除AI配置失败:', error);
    return NextResponse.json({ error: '删除AI配置失败' }, { status: 500 });
  }
}
