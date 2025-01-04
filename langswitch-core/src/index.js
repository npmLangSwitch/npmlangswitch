import fs from "fs/promises";
import path from "path";

/**
 * A class to manage translations with caching and persistence capabilities.
 */
class TranslationManager {
  /**
   * @param {Object} config - Configuration options for the manager.
   * @param {string} [config.filePath="../translations.json"] - File path to store translations.
   * @param {string} [config.apiUrl="api_url_that_you_will_recieve_with_api_key"] - API URL for translation requests.
   * @param {string} [config.apiKey="api_key"] - API URL for translation requests.
   */
  constructor(config = {}) {
    this.filePath = config.filePath || "../translations.json";
    this.apiUrl = config.apiUrl;
    this.translations = new Map();
    this.initPromise = this.initialize();
    this.apiKey = config.apiKey;
  }

  /**
   * Initializes the translation manager by loading translations from the file.
   */
  async initialize() {
    try {
      const data = await fs.readFile(this.filePath, "utf8").catch(() => "{}");
      const translations = JSON.parse(data);

      // Convert loaded data to Map for better performance
      Object.entries(translations).forEach(([lang, texts]) => {
        this.translations.set(lang, new Map(Object.entries(texts)));
      });
    } catch (error) {
      console.error("Error initializing translations:", error);
      this.translations = new Map();
    }
  }

  /**
   * Checks and updates in-memory translations from the file if it has been modified.
   */
  async checkFileUpdates() {
    try {
      const data = await fs.readFile(this.filePath, "utf8");
      const fileTranslations = JSON.parse(data);

      // Synchronize in-memory translations with file contents
      Object.entries(fileTranslations).forEach(([lang, texts]) => {
        if (!this.translations.has(lang)) {
          this.translations.set(lang, new Map());
        }
        const langMap = this.translations.get(lang);

        Object.entries(texts).forEach(([text, translation]) => {
          if (langMap.get(text) !== translation) {
            langMap.set(text, translation);
          }
        });
      });
    } catch (error) {
      console.error("Error checking file updates:", error);
    }
  }

  /**
   * Retrieves a translation from the cache.
   * @param {string} text - The text to be translated.
   * @param {string} lang - The target language.
   * @returns {Promise<string|undefined>} The cached translation, if available.
   */
  async getTranslation(text, lang) {
    await this.initPromise;
    await this.checkFileUpdates();
    return this.translations.get(lang)?.get(text);
  }

  /**
   * Saves the current in-memory translations to the file.
   */
  async saveTranslations() {
    try {
      const currentData = await fs
        .readFile(this.filePath, "utf8")
        .catch(() => "{}");
      const currentTranslations = JSON.parse(currentData);

      const memoryData = Object.fromEntries(
        Array.from(this.translations.entries()).map(([lang, texts]) => [
          lang,
          Object.fromEntries(texts),
        ])
      );

      const mergedData = { ...memoryData };
      Object.entries(currentTranslations).forEach(([lang, texts]) => {
        mergedData[lang] = {
          ...(memoryData[lang] || {}),
          ...texts,
        };
      });

      await fs.writeFile(this.filePath, JSON.stringify(mergedData, null, 2));
      await this.initialize();
    } catch (error) {
      console.error("Error saving translations:", error);
      throw new Error("Failed to save translations");
    }
  }

  /**
   * Updates or adds a translation to the cache and saves it to the file.
   * @param {string} text - The text to be translated.
   * @param {string} lang - The target language.
   * @param {string} translation - The translated text.
   * @param {boolean} [isUserModified=false] - Whether the translation was manually modified.
   */
  async updateTranslation(text, lang, translation, isUserModified = false) {
    await this.initPromise;
    await this.checkFileUpdates();

    if (!this.translations.has(lang)) {
      this.translations.set(lang, new Map());
    }

    const langMap = this.translations.get(lang);
    const currentTranslation = langMap.get(text);

    if (!currentTranslation || isUserModified) {
      langMap.set(text, translation);
      await this.saveTranslations();
    }
  }

  /**
   * Translates a given text using the translation API or cache.
   * @param {string} text - The text to translate.
   * @param {string} lang - The target language.
   * @returns {Promise<string>} The translated text.
   * @throws Will throw an error if the API call fails.
   */
  async translateText(text, lang) {
    await this.initPromise;
    await this.checkFileUpdates();

    const cached = await this.getTranslation(text, lang);
    if (cached) return cached;

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          q: text,
          source: "en",
          target: lang,
        }),
      }).catch((error) => console.error("Translation API error:", error));

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.statusText}`);
      }

      const { translatedText } = await response.json();
      if (!translatedText) {
        throw new Error("Invalid API response structure");
      }

      await this.updateTranslation(text, lang, translatedText);
      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      throw error;
    }
  }
}

/**
 * Factory function to create a new instance of TranslationManager.
 * @param {Object} config - Configuration options for the manager.
 * @returns {TranslationManager} An instance of the TranslationManager class.
 */
export const createTranslationManager = (config) =>
  new TranslationManager(config);
