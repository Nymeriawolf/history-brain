// 历史书籍智能研究系统 - 类型定义

export interface Book {
  id: string;
  title: string;
  author: string;
  authorNationality: string;
  publisher: string;
  publishDate: string;
  authorBio: string;
  authorThoughts: string;
  content: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface Law {
  id: string;
  bookId: string;
  category: LawCategory;
  title: string;
  description: string;
  evidence: string;
  confidence: number;
  timePeriod: string;
  region: string;
  createdAt: Date;
}

export type LawCategory =
  | '技术发展'
  | '人口发展'
  | '地区发展'
  | '文化演进'
  | '经济发展'
  | '社会发展'
  | '自定义';

export interface Relationship {
  id: string;
  bookAId: string;
  bookBId: string;
  type: RelationshipType;
  description: string;
  relatedContentA: string;
  relatedContentB: string;
  createdAt: Date;
}

export type RelationshipType = 'CORROBORATE' | 'CONFLICT' | 'SUPPLEMENT' | 'CONTRADICT';

export interface Memory {
  id: string;
  content: string;
  category: LawCategory;
  sourceBookIds: string[];
  importance: number;
  createdAt: Date;
  lastAccessed: Date;
}

export interface AIConfig {
  id: string;
  provider: 'openai' | 'claude' | 'deepseek' | 'custom';
  apiKey: string;
  baseUrl?: string;
  modelName: string;
  isActive: boolean;
}

// API 响应类型
export interface AnalyzeResponse {
  laws: Law[];
  relationships: Relationship[];
}

export interface AIProviderConfig {
  name: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
}

export const AI_PROVIDERS: Record<string, AIProviderConfig> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4-turbo-preview',
    models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
  },
  claude: {
    name: 'Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-opus-20240229',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-coder'],
  },
};
