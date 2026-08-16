// Polyglot Chat Translation Utility

export function translateChatMessage(text: string, targetLang: string = "en"): string {
  // Demo Translation dictionary for common multi-lingual dev phrases
  const translations: Record<string, string> = {
    "hola": "hello (Spanish)",
    "buenos dias": "good morning (Spanish)",
    "gracias": "thank you (Spanish)",
    "lgtm": "Looks Good To Me",
    "listo": "ready/done (Spanish)",
    "salut": "hi (French)",
    "merci": "thank you (French)",
    "hallo": "hello (German)",
    "danke": "thank you (German)",
    "konnichiwa": "hello (Japanese)",
    "arigato": "thank you (Japanese)"
  };

  const lower = text.trim().toLowerCase();
  if (translations[lower]) {
    return `${text} 🌐 [${translations[lower]}]`;
  }

  return text;
}
