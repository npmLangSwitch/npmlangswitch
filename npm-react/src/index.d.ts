// index.d.ts

import { ReactNode, ReactElement } from "react";

export interface TranslationError extends Error {
  code: string;
  details?: unknown;
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

export interface TranslationManagerOptions {
  /**
   * Maximum number of cached translations
   * @default 1000
   */
  maxCacheSize?: number;
}

export class TranslationManager {
  constructor(options?: TranslationManagerOptions);

  /**
   * Retrieve a cached translation
   */
  getTranslation(text: string, targetLang: string): string | null;

  /**
   * Store a translation in the cache
   */
  setTranslation(text: string, targetLang: string, translation: string): void;

  /**
   * Clear the translation cache
   */
  clearCache(): void;
}

export interface TranslateProps {
  /**
   * The content to be translated
   */
  children: ReactNode;

  /**
   * Target language code (e.g., 'es', 'fr', 'de')
   */
  lang: string;

  /**
   * Translation API endpoint
   * @default 'http://192.168.0.249:5000/translate'
   */
  apiUrl?: string;

  /**
   * Callback fired when translation starts
   */
  onTranslationStart?: () => void;

  /**
   * Callback fired when translation completes
   */
  onTranslationComplete?: () => void;

  /**
   * Callback fired when translation fails
   */
  onTranslationError?: (error: TranslationError) => void;

  /**
   * Whether to show loading state
   * @default false
   */
  showLoading?: boolean;

  /**
   * Custom loading component
   */
  LoadingComponent?: ReactElement;

  /**
   * Custom error component
   */
  ErrorComponent?: ReactElement;
}

/**
 * React component that translates its children to the specified language
 */
export function Translate(props: TranslateProps): ReactElement;

/**
 * Translate text to the specified language
 */
export function translateText(
  text: string,
  targetLang: string,
  apiUrl?: string
): Promise<string>;

/**
 * Configuration options for the translation system
 */
export interface TranslationConfig {
  apiUrl?: string;
  maxCacheSize?: number;
  defaultLanguage?: string;
  fallbackLanguage?: string;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * Configure the translation system
 */
export function configure(config: TranslationConfig): void;
