'use client';

import { useState, useEffect } from 'react';
import { Settings, Key, Save, Trash2, Check, AlertCircle } from 'lucide-react';
import { AI_PROVIDERS } from '@/types';

interface AIConfig {
  id: string;
  provider: string;
  apiKey: string;
  baseUrl: string | null;
  modelName: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [provider, setProvider] = useState<string>('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [modelName, setModelName] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 加载配置
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const res = await fetch('/api/ai/config');
        const data = await res.json();
        setConfigs(data);
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    };
    loadConfigs();
  }, []);

  // 当选择提供商时，自动填充默认值
  useEffect(() => {
    const providerConfig = AI_PROVIDERS[provider];
    if (providerConfig) {
      setBaseUrl(providerConfig.baseUrl);
      setModelName(providerConfig.defaultModel);
    }
  }, [provider]);

  // 保存配置
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);

    if (!apiKey.trim()) {
      setSaveMessage({ type: 'error', text: '请输入API Key' });
      return;
    }

    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          baseUrl: baseUrl || undefined,
          modelName: modelName || undefined,
        }),
      });

      if (res.ok) {
        const newConfig = await res.json();
        setConfigs((prev) => [newConfig, ...prev.filter((c) => c.id !== newConfig.id)]);
        setApiKey('');
        setSaveMessage({ type: 'success', text: '保存成功！' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const error = await res.json();
        setSaveMessage({ type: 'error', text: error.error || '保存失败' });
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      setSaveMessage({ type: 'error', text: '保存失败，请重试' });
    }
  };

  // 删除配置
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此配置吗？')) return;

    try {
      const res = await fetch(`/api/ai/config?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfigs((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('删除配置失败:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
        <Settings className="h-8 w-8 text-amber-600" />
        系统设置
      </h1>

      {/* AI配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-amber-100 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Key className="h-5 w-5 text-amber-600" />
          AI服务配置
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          {/* 提供商选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI服务提供商
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {Object.entries(AI_PROVIDERS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
              <option value="custom">自定义</option>
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key *
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              可自定义API端点，用于代理或兼容服务
            </p>
          </div>

          {/* 模型名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              模型名称
            </label>
            {provider !== 'custom' && AI_PROVIDERS[provider] ? (
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {AI_PROVIDERS[provider].models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="gpt-4-turbo-preview"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            )}
          </div>

          {/* 保存消息 */}
          {saveMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                saveMessage.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}
            >
              {saveMessage.type === 'success' ? (
                <Check className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              {saveMessage.text}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Save className="h-5 w-5" />
            保存配置
          </button>
        </form>
      </div>

      {/* 已保存的配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-amber-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          已保存的配置
        </h2>

        {configs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">暂无保存的配置</p>
        ) : (
          <div className="space-y-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {AI_PROVIDERS[config.provider]?.name || config.provider}
                    </span>
                    {config.isActive && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                        当前使用
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Key: {config.apiKey} | Model: {config.modelName || '默认'}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(config.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-3">
          使用说明
        </h3>
        <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
          <li>1. 选择AI服务提供商并输入对应的API Key</li>
          <li>2. 支持OpenAI、Claude、DeepSeek等主流AI服务</li>
          <li>3. 可自定义API端点以支持代理服务</li>
          <li>4. 保存配置后即可开始分析书籍</li>
          <li>5. API Key会被安全存储，请妥善保管</li>
        </ul>
      </div>
    </div>
  );
}
