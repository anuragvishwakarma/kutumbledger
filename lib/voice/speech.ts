export interface VoiceCommand {
  type: 'income' | 'expense' | 'transfer';
  amount: number; // in paise
  description: string;
  confidence: number; // 0-1
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

interface Window {
  SpeechRecognition: {
    new (): SpeechRecognition;
  };
  webkitSpeechRecognition: {
    new (): SpeechRecognition;
  };
}

type SpeechRecognitionLang =
  | 'hi-IN' // Hindi India
  | 'en-IN' // English India
  | 'en-US' // English US
  | 'en-GB'; // English UK

export class VoiceInput {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private language: SpeechRecognitionLang = 'hi-IN'; // Default to Hindi

  constructor() {
    // Check if Web Speech API is supported
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as unknown as { SpeechRecognition: new () => SpeechRecognition; webkitSpeechRecognition: new () => SpeechRecognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionConstructor();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.language;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        return this.parseVoiceCommand(transcript);
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        return null;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    } else {
      console.warn('Web Speech API not supported in this browser');
    }
  }

  // Set language for recognition
  setLanguage(lang: SpeechRecognitionLang) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  // Start listening for voice input
  startListening(): Promise<VoiceCommand | null> {
    return new Promise((resolve) => {
      if (!this.recognition) {
        resolve(null);
        return;
      }

      if (this.isListening) {
        resolve(null);
        return;
      }

      this.isListening = true;
      this.recognition!.start();

      // Set a timeout to stop listening after 5 seconds
      setTimeout(() => {
        if (this.isListening) {
          this.stopListening();
          resolve(null); // Timeout, no command recognized
        }
      }, 5000);

      // Store resolve function to call when we get a result
      const originalOnresult = this.recognition!.onresult;
      this.recognition!.onresult = (event: SpeechRecognitionEvent) => {
        this.isListening = false;
        this.recognition!.onresult = originalOnresult; // Restore original
        const transcript = event.results[0][0].transcript;
        const command = this.parseVoiceCommand(transcript);
        resolve(command);
      };
    });
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition!.stop();
      this.isListening = false;
    }
  }

  // Parse voice command transcript into a VoiceCommand
  private parseVoiceCommand(transcript: string): VoiceCommand | null {
    if (!transcript || transcript.trim() === '') return null;

    const lower = transcript.toLowerCase().trim();

    // Define Hindi and English keywords for transaction types
    const expenseKeywords = [
      'kharcha', 'paisa', 'rupaye', 'spent', 'paid', 'expense', 'payment',
      'kharcha', 'paisa', 'harcama', 'xarch', 'arch' // Hindi transliterations
    ];

    const incomeKeywords = [
      'kamaya', 'aaya', 'income', 'salary', 'received', 'deposit', 'added',
      'gelir', 'entrada' // Hindi/other transliterations
    ];

    const transferKeywords = [
      'bheja', 'bheji', 'sent', 'transfer', 'transfered', 'sent money',
      'gonderdigi', 'enviado' // Hindi/other transliterations
    ];

    // Extract amount (first number in the transcript)
    const amountMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:rupee|rupaye|paisa|rs|₹)/i);
    if (!amountMatch) return null;

    let amount = parseFloat(amountMatch[1]);
    // If amount seems to be in rupees (not paise), convert to paise
    if (amount < 1000) { // Assuming reasonable transaction amount in rupees
      amount = amount * 100; // Convert to paise
    }

    // Determine type based on keywords
    let type: 'income' | 'expense' | 'transfer' = 'expense'; // Default

    if (expenseKeywords.some(keyword => lower.includes(keyword))) {
      type = 'expense';
    } else if (incomeKeywords.some(keyword => lower.includes(keyword))) {
      type = 'income';
    } else if (transferKeywords.some(keyword => lower.includes(keyword))) {
      type = 'transfer';
    }

    // Extract description (remove amount and currency words, keep the rest)
    let description = lower
      .replace(amountMatch[0], '') // Remove the amount match
      .replace(/(rupee|rupaye|paisa|rs|₹)/gi, '') // Remove currency words
      .trim();

    // Clean up description
    description = description.replace(/^\s+(and|ya|aur)\s+/, ''); // Remove leading conjunctions
    description = description.charAt(0).toUpperCase() + description.slice(1); // Capitalize first letter

    // If description is empty, use a default
    if (!description || description.length < 2) {
      description = type === 'expense' ? 'Expense' : type === 'income' ? 'Income' : 'Transfer';
    }

    // Confidence based on how clear the command was
    const confidence =
      type !== 'expense' // Not default to expense
      && description.length > 3
      ? 0.8
      : 0.6;

    return {
      type,
      amount: Math.round(amount), // Ensure integer paise
      description,
      confidence
    };
  }

  // Check if voice input is available
  static isAvailable(): boolean {
    return !!(
      'SpeechRecognition' in window ||
      'webkitSpeechRecognition' in window
    );
  }
}