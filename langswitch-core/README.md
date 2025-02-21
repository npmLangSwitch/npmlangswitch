# <img src="https://avatars.githubusercontent.com/u/193133986?v=4" alt="LangSwitch Logo" width="35" height="35" style="vertical-align: middle;"> LangSwitch

> 🌍 Add translations to your React app in less than 5 minutes!

LangSwitch is a React translation package that lets you translate your app using [LibreTranslate](https://libretranslate.com). Just wrap your components, and you're ready to go!

## ️⛺ Quick Demo

```jsx
// Before: Your regular React component
<div>
  <h1>Welcome!</h1>
  <p>How are you today?</p>
</div>
```

```
// After: Same component with translations!
<Translate lang="es">
  <div>
    <h1>Welcome!</h1> {/* Becomes: ¡Bienvenido! */}
    <p>How are you today?</p> {/* Becomes: ¿Cómo estás hoy? */}
  </div>
</Translate>
```

## 📦 Installation

LangSwitch has two parts:

1. Frontend package (`langswitch-react`)
2. Backend package (`langswitch-core`)

```bash
# Install frontend package in your React app
npm install langswitch-react

# Install backend package in your server
npm install langswitch-core
```

## 🚀 Setup Guide

### Step 1: Set up the Backend

```javascript
// In your Express server file (e.g., server.js)
import express from "express";
import { createTranslationManager } from "langswitch-core";

const app = express();

// Create the translation manager
const manager = createTranslationManager({
  filePath: "./translations.json"  // Where to store translations
  apiUrl : "api_Url" //You can get the api url   from google form
  apiKey : "your_api_Key" //You can get the api key from google form
});

// Add the translation endpoint
app.post("/translate", async (req, res) => {
  const { text, targetLang } = req.body;
   if (!text || !targetLang) {
    return res
      .status(400)
      .json({ error: 'Both "text" and "targetLang" fields are required.' });
  }
  try {
    const translatedText = await manager.translateText(text, targetLang);
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: "Translation failed" });
  }
});

app.listen(5000, () => {
  console.log('Translation server running on port 5000');
});
```

### Step 2: Use in Your React App

```jsx
// In your React component
import { Translate } from "langswitch-react";
import { useState } from "react";

function App() {
  const [language, setLanguage] = useState("en");

  return (
    <div>
      {/* Language selector */}
      <select onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>

      {/* Your content with translations */}
      <Translate
        lang={language}
        apiUrl="http://localhost:5000/translate" // Your backend api route
      >
        <h1>Welcome to our app!</h1>
        <p>This text will be translated</p>
        <span ignore>This text will stay in English</span>
      </Translate>
    </div>
  );
}
```

That's it! Your app now supports multiple languages! 🎉

## 🔤 Supported Languages

LangSwitch supports all languages available in LibreTranslate:

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- And [many more](https://libretranslate.com/languages)

## 💡 Pro Tips

### 1. Skip Translation for Specific Content

Use the `ignore` prop to keep content in the original language:

```jsx
<Translate lang="es">
  <p>This will be in Spanish</p>
  <p ignore>This will stay in English</p>
</Translate>
```

### 2. Custom Translation Server

By default, we use our hosted LibreTranslate instance. To use your own:

```javascript
// In your backend
const manager = createTranslationManager({
  filePath: "./translations.json",
  apiUrl: "http://your-libretranslate-url", // Your LibreTranslate instance
});
```

### 3. Caching and Manual Translations

LangSwitch provides a powerful caching system with support for manual translations:

#### Automatic Caching

- All translations are automatically cached in `translations.json`
- Reduces API calls and speeds up your app
- Works offline for previously translated content

#### Manual Translations

You can override any automated translation by editing `translations.json`:

```json
{
  "es": {
    "Welcome to our app!": "¡Mi traducción personalizada!",
    "This text will be translated": "Este texto será traducido"
  }
}
```

Key features of manual translations:

- Edit `translations.json` directly to customize any translation
- Changes take effect immediately on page reload
- Perfect for fixing or customizing automated translations
- Translations persist across server restarts
- Manual translations always take priority over automated ones

Example `translations.json` structure:

```json
{
  "es": {
    "original english text": "translated text"
  },
  "fr": {
    "original english text": "translated text"
  }
}
```

## 🤔 Need Help?

- 📖 Check our [detailed docs]( Coming soon 👀)
- 🐛 Report issues on [GitHub](https://github.com/langswitch/langswitch/issues)
- 📧 Email us at npmlangswitch@gmail.com

## License

MIT © LangSwitch

---
