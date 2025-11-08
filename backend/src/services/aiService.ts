import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIProvider {
  name: string;
  generateCode: (prompt: string) => Promise<string>;
}

class AIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;

  constructor() {
    // Initialize OpenAI (ChatGPT/Copilot)
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Anthropic (Claude)
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    // Initialize Google Gemini
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  async generateWithOpenAI(prompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code generator. Generate clean, well-documented code based on user requirements. Always include file names and proper code structure.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async generateWithClaude(prompt: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Anthropic API key not configured');
    }

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are an expert code generator. Generate clean, well-documented code based on user requirements. Always include file names and proper code structure.\n\n${prompt}`,
        },
      ],
    });

    const content = message.content[0];
    return content.type === 'text' ? content.text : '';
  }

  async generateWithGemini(prompt: string): Promise<string> {
    if (!this.gemini) {
      throw new Error('Gemini API key not configured');
    }

    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(
      `You are an expert code generator. Generate clean, well-documented code based on user requirements. Always include file names and proper code structure.\n\n${prompt}`
    );

    const response = await result.response;
    return response.text();
  }

  async generateCode(prompt: string, provider: string = 'auto'): Promise<{
    success: boolean;
    code: string;
    files?: Array<{ name: string; content: string; language: string }>;
    provider: string;
    error?: string;
  }> {
    try {
      let generatedCode = '';
      let usedProvider = provider;

      // Auto-select first available provider
      if (provider === 'auto') {
        if (this.openai) {
          usedProvider = 'openai';
        } else if (this.anthropic) {
          usedProvider = 'claude';
        } else if (this.gemini) {
          usedProvider = 'gemini';
        } else {
          throw new Error('No AI provider configured. Please add API keys to .env file.');
        }
      }

      // Generate code with selected provider
      switch (usedProvider) {
        case 'openai':
        case 'chatgpt':
        case 'copilot':
          generatedCode = await this.generateWithOpenAI(prompt);
          break;
        case 'claude':
        case 'anthropic':
          generatedCode = await this.generateWithClaude(prompt);
          break;
        case 'gemini':
        case 'google':
          generatedCode = await this.generateWithGemini(prompt);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      // Parse the generated code to extract files
      const files = this.parseGeneratedCode(generatedCode);

      return {
        success: true,
        code: generatedCode,
        files,
        provider: usedProvider,
      };
    } catch (error) {
      console.error('AI generation error:', error);
      return {
        success: false,
        code: '',
        provider: provider,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private parseGeneratedCode(generatedCode: string): Array<{ name: string; content: string; language: string }> {
    const files: Array<{ name: string; content: string; language: string }> = [];
    
    // Try to extract code blocks with file names
    const filePattern = /(?:File:|Filename:|###\s+)([^\n]+)\n```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = filePattern.exec(generatedCode)) !== null) {
      const fileName = match[1].trim();
      const language = match[2] || this.detectLanguage(fileName);
      const content = match[3].trim();
      
      files.push({ name: fileName, content, language });
    }

    // If no files found, try simple code block extraction
    if (files.length === 0) {
      const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
      let blockIndex = 0;
      
      while ((match = codeBlockPattern.exec(generatedCode)) !== null) {
        const language = match[1] || 'plaintext';
        const content = match[2].trim();
        const extension = this.getExtensionFromLanguage(language);
        
        files.push({
          name: `generated_file_${blockIndex + 1}.${extension}`,
          content,
          language,
        });
        blockIndex++;
      }
    }

    return files;
  }

  private detectLanguage(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'xml': 'xml',
      'sql': 'sql',
      'sh': 'bash',
    };
    return languageMap[extension || ''] || 'plaintext';
  }

  private getExtensionFromLanguage(language: string): string {
    const extensionMap: { [key: string]: string } = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'cs',
      'go': 'go',
      'rust': 'rs',
      'php': 'php',
      'ruby': 'rb',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'xml': 'xml',
      'sql': 'sql',
      'bash': 'sh',
    };
    return extensionMap[language.toLowerCase()] || 'txt';
  }

  getAvailableProviders(): string[] {
    const providers = [];
    if (this.openai) providers.push('openai', 'chatgpt', 'copilot');
    if (this.anthropic) providers.push('claude', 'anthropic');
    if (this.gemini) providers.push('gemini', 'google');
    return providers;
  }
}

export default new AIService();
