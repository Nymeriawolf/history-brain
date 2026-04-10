// AI服务商适配器

export interface AIProvider {
  name: string;
  analyze(content: string, prompt: string): Promise<string>;
}

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  modelName?: string;
}

// OpenAI 兼容的 API 调用
export async function callOpenAICompatible(
  config: AIProviderConfig & { provider: string },
  prompt: string,
  content: string
): Promise<string> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  const model = config.modelName || 'gpt-4-turbo-preview';

  const systemPrompt = `你是一位资深历史学家，专注于从历史书籍中提炼历史规律。

你的任务是深入分析历史书籍内容，提炼出具有普遍性的历史规律。

## 输出要求
请从以下维度分析并提炼规律：
1. 技术发展规律 - 技术如何影响社会变迁
2. 人口发展规律 - 人口变化与社会发展的关系
3. 地区发展规律 - 地理环境对文明发展的影响
4. 文化演进规律 - 文化传播与演变的模式
5. 经济发展规律 - 经济周期与模式变迁
6. 社会发展规律 - 社会结构的演变规律
7. 其他规律 - 你发现的其他重要模式

每个规律请包含：
- 规律名称
- 详细描述（粗略正确而非精确错误）
- 支持证据（引用原文关键句）
- 涉及的历史时期
- 涉及的地理区域
- 置信度评估（0-1之间的小数）

请以JSON数组格式输出，每个规律格式如下：
[
  {
    "category": "技术发展",
    "title": "规律名称",
    "description": "详细描述",
    "evidence": "支持证据",
    "timePeriod": "历史时期",
    "region": "地理区域",
    "confidence": 0.8
  }
]

注意：
1. 规律应该具有普遍性，而非具体事件的描述
2. 宁可粗略正确，不要精确错误
3. 要考虑历史背景的复杂性`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请分析以下历史书籍内容：\n\n${content}` },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API调用失败: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Claude API 调用
export async function callClaude(
  config: AIProviderConfig,
  prompt: string,
  content: string
): Promise<string> {
  const baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
  const model = config.modelName || 'claude-3-opus-20240229';

  const systemPrompt = `你是一位资深历史学家，专注于从历史书籍中提炼历史规律。

你的任务是深入分析历史书籍内容，提炼出具有普遍性的历史规律。

## 输出要求
请从以下维度分析并提炼规律：
1. 技术发展规律 - 技术如何影响社会变迁
2. 人口发展规律 - 人口变化与社会发展的关系
3. 地区发展规律 - 地理环境对文明发展的影响
4. 文化演进规律 - 文化传播与演变的模式
5. 经济发展规律 - 经济周期与模式变迁
6. 社会发展规律 - 社会结构的演变规律
7. 其他规律 - 你发现的其他重要模式

每个规律请包含：
- 规律名称
- 详细描述（粗略正确而非精确错误）
- 支持证据（引用原文关键句）
- 涉及的历史时期
- 涉及的地理区域
- 置信度评估（0-1之间的小数）

请以JSON数组格式输出，每个规律格式如下：
[
  {
    "category": "技术发展",
    "title": "规律名称",
    "description": "详细描述",
    "evidence": "支持证据",
    "timePeriod": "历史时期",
    "region": "地理区域",
    "confidence": 0.8
  }
]

注意：
1. 规律应该具有普遍性，而非具体事件的描述
2. 宁可粗略正确，不要精确错误
3. 要考虑历史背景的复杂性`;

  const response = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `请分析以下历史书籍内容：\n\n${content}` }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API调用失败: ${error}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

// 统一的AI调用入口
export async function analyzeWithAI(
  provider: 'openai' | 'claude' | 'deepseek' | 'custom',
  config: AIProviderConfig,
  content: string
): Promise<string> {
  switch (provider) {
    case 'claude':
      return callClaude(config, '', content);
    case 'openai':
    case 'deepseek':
    case 'custom':
    default:
      return callOpenAICompatible(
        {
          ...config,
          provider,
          baseUrl:
            config.baseUrl ||
            (provider === 'deepseek' ? 'https://api.deepseek.com/v1' : undefined),
        },
        '',
        content
      );
  }
}

// 解析AI返回的JSON
export function parseLawsFromAI(response: string): Array<{
  category: string;
  title: string;
  description: string;
  evidence: string;
  timePeriod: string;
  region: string;
  confidence: number;
}> {
  try {
    // 尝试提取JSON数组
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    console.error('解析AI响应失败:', response);
    return [];
  }
}
