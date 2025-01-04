  declare module "translation-manager" {
    interface TranslationManagerConfig {
      /**
       * File path to store translations
       * @default "../translations.json"
       */
      filePath?: string;

      /**
       * API URL for translation requests
       * @default "http://192.168.0.249:5000/translate"
       */
      apiUrl?: string;
    }

    class TranslationManager {
      /**
       * Creates a new instance of TranslationManager
       * @param config - Configuration options for the manager
       */
      constructor(config?: TranslationManagerConfig);

      /**
       * File path where translations are stored
       */
      readonly filePath: string;

      /**
       * API URL used for translation requests
       */
      readonly apiUrl: string;

      /**
       * Initializes the translation manager by loading translations from the file
       */
      private initialize(): Promise<void>;

      /**
       * Checks and updates in-memory translations from the file if it has been modified
       */
      private checkFileUpdates(): Promise<void>;

      /**
       * Retrieves a translation from the cache
       * @param text - The text to be translated
       * @param lang - The target language
       * @returns The cached translation, if available
       */
      getTranslation(text: string, lang: string): Promise<string | undefined>;

      /**
       * Saves the current in-memory translations to the file
       * @throws Will throw an error if saving fails
       */
      private saveTranslations(): Promise<void>;

      /**
       * Updates or adds a translation to the cache and saves it to the file
       * @param text - The text to be translated
       * @param lang - The target language
       * @param translation - The translated text
       * @param isUserModified - Whether the translation was manually modified
       */
      updateTranslation(
        text: string,
        lang: string,
        translation: string,
        isUserModified?: boolean
      ): Promise<void>;

      /**
       * Translates a given text using the translation API or cache
       * @param text - The text to translate
       * @param lang - The target language
       * @returns The translated text
       * @throws Will throw an error if the API call fails
       */
      translateText(text: string, lang: string): Promise<string>;
    }

    /**
     * Creates a new instance of TranslationManager
     * @param config - Configuration options for the manager
     * @returns An instance of the TranslationManager class
     */
    export function createTranslationManager(
      config?: TranslationManagerConfig
    ): TranslationManager;

    export { TranslationManager, TranslationManagerConfig };
  }
