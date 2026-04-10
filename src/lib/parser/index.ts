// 文件解析器 - 服务端使用

export async function parseFile(buffer: Buffer, filename: string): Promise<string> {
  if (filename.endsWith('.pdf')) {
    return parsePDF(buffer);
  } else if (filename.endsWith('.txt') || filename.endsWith('.md')) {
    return buffer.toString('utf-8');
  }
  return '';
}

async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // 使用require避免ESM兼容性问题
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF解析错误:', error);
    return `[PDF解析失败: ${error instanceof Error ? error.message : '未知错误'}]`;
  }
}
