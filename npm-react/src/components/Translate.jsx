import React, { useState, useEffect, useRef } from "react";

/**
 * TranslationManager class to handle in-memory caching translations.
 * Provides temporary caching during the session.
 */
class TranslationManager {
  constructor() {
    this.memoryCache = new Map();
  }

  /**
   * Generate a unique cache key based on text and target language.
   * @param {string} text - The text to translate.
   * @param {string} targetLang - The target language.
   * @returns {string} - The unique cache key.
   */
  getCacheKey(text, targetLang) {
    return `${text}:${targetLang}`;
  }

  /**
   * Retrieve a cached translation.
   * @param {string} text - The text to translate.
   * @param {string} targetLang - The target language.
   * @returns {string|null} - The cached translation or null.
   */
  getTranslation(text, targetLang) {
    return this.memoryCache.get(this.getCacheKey(text, targetLang));
  }

  /**
   * Store a translation in the cache.
   * @param {string} text - The original text.
   * @param {string} targetLang - The target language.
   * @param {string} translation - The translated text.
   */
  setTranslation(text, targetLang, translation) {
    this.memoryCache.set(this.getCacheKey(text, targetLang), translation);
  }
}

const translationManager = new TranslationManager();

/**
 * Translate a given text to the specified language.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language code.
 * @returns {Promise<string>} - The translated text.
 */
const translateText = async (text, targetLang, apiUrl) => {
  const existingTranslation = translationManager.getTranslation(
    text,
    targetLang
  );
  if (existingTranslation) {
    return existingTranslation;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        targetLang: targetLang,
      }),
    });

    if (!response.ok) {
      return text; // Fallback to the original text
    }

    const data = await response.json();
    const translatedText = data?.translatedText;

    if (translatedText) {
      translationManager.setTranslation(text, targetLang, translatedText);
    }

    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

/**
 * Traverse and translate React children elements.
 * @param {React.ReactNode} children - React children to translate.
 * @param {string} lang - Target language code.
 * @returns {Promise<React.ReactNode>} - Translated React children.
 */
const traverseAndTranslate = async (children, lang, apiUrl) => {
  const translationQueue = [];

  const collectTranslations = (node, depth) => {
    if (typeof node === "string") {
      translationQueue.push({ text: node.trim(), depth });
    } else if (React.isValidElement(node)) {
      if (node.props && "ignore" in node.props) {
        return;
      }
      if (node.props.children) {
        React.Children.forEach(node.props.children, (child) => {
          collectTranslations(child, depth + 1);
        });
      }
    }
  };

  React.Children.forEach(children, (child) => {
    collectTranslations(child, 0);
  });

  translationQueue.sort((a, b) => a.depth - b.depth);

  const translationMap = new Map();
  for (const { text } of translationQueue) {
    if (!translationMap.has(text)) {
      const translation = await translateText(text, lang, apiUrl);
      translationMap.set(text, translation);
    }
  }

  const applyTranslations = async (node) => {
    if (typeof node === "string") {
      return translationMap.get(node.trim()) || node;
    } else if (React.isValidElement(node)) {
      if (node.props && "ignore" in node.props) {
        return node;
      }

      let translatedProps = {};

      if (node.props.children) {
        const childContent = node.props.children;
        if (typeof childContent === "string") {
          translatedProps.children =
            translationMap.get(childContent.trim()) || childContent;
        } else {
          translatedProps.children = await Promise.all(
            React.Children.map(childContent, applyTranslations)
          );
        }
      }

      return React.cloneElement(node, {
        ...node.props,
        ...translatedProps,
      });
    }
    return node;
  };

  return Promise.all(React.Children.map(children, applyTranslations));
};

/**
 * Translate component for React applications.
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - React children to translate.
 * @param {string} props.lang - Target language code.
 * @param {string} [props.apiUrl] - The URL of the translation API.
 * @returns {React.ReactElement} - Translated React elements.
 */
const Translate = ({
  children,
  lang,
  apiUrl = "http://192.168.0.249:5000/translate",
}) => {
  const [translatedContent, setTranslatedContent] = useState(children);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const prevChildrenRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    const hasChildrenChanged = prevChildrenRef.current !== children;
    prevChildrenRef.current = children;

    if (!hasChildrenChanged) return;

    const performTranslation = async () => {
      setLoading(true);
      setError(null);
      try {
        const parsedChildren = React.Children.toArray(children);
        const translated = await traverseAndTranslate(
          parsedChildren,
          lang,
          apiUrl
        );
        if (isMounted.current) {
          setTranslatedContent(translated);
        }
      } catch (err) {
        console.error("Translation Error:", err);
        if (isMounted.current) {
          setError("Translation failed.");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    performTranslation();

    return () => {
      isMounted.current = false;
    };
  }, [children, lang]);

  if (error) return <span>{error}</span>;

  return <>{translatedContent}</>;
};

export { Translate };
