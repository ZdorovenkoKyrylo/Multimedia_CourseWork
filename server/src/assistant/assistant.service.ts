import { Injectable, Logger } from '@nestjs/common';
import { AssistantAction } from './dto/assistant-action.dto';
import { SpeechToTextDto } from './dto/speech-to-text.dto';
import * as sw from 'stopword';
import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';

const ffmpeg = require('fluent-ffmpeg');
const gTTS = require('gtts'); // Import gTTS

// Vosk Setup (Keep existing logic)
let Model, Recognizer;
try {
  const vosk = require('vosk');
  Model = vosk.Model;
  Recognizer = vosk.Recognizer;
} catch (error) {
  console.warn('Vosk not installed. Run: npm install vosk');
}

@Injectable()
export class AssistantService {
  private model: any;
  private modelPath = path.join(__dirname, '../../vosk-model-small-en-us-0.15');

  constructor() {
    if (Model && fs.existsSync(this.modelPath)) {
      try {
        this.model = new Model(this.modelPath);
        console.log('Vosk model loaded successfully');
      } catch (error) {
        console.error('Failed to load Vosk model:', error);
      }
    } else {
      console.warn('Vosk model not found at:', this.modelPath);
    }
  }

  // --- EXISTING SPEECH-TO-TEXT LOGIC ---
  async speechToText(audioBuffer: Buffer): Promise<SpeechToTextDto> {
    if (!this.model || !Recognizer) {
      throw new Error('Vosk is not properly configured.');
    }

    const convertWebmToPCM = (inputBuffer: Buffer): Promise<Buffer> => {
      return new Promise((resolve, reject) => {
        const inputStream = new stream.PassThrough();
        inputStream.end(inputBuffer);
        const outputChunks: Buffer[] = [];

        ffmpeg(inputStream)
          .audioChannels(1)
          .audioFrequency(16000)
          .audioCodec('pcm_s16le')
          .format('s16le')
          .on('error', (err) => reject(new Error('ffmpeg error: ' + err.message)))
          .on('end', () => resolve(Buffer.concat(outputChunks)))
          .pipe()
          .on('data', (chunk) => outputChunks.push(chunk));
      });
    };

    try {
      const pcmBuffer = await convertWebmToPCM(audioBuffer);
      const recognizer = new Recognizer({ model: this.model, sampleRate: 16000 });
      
      recognizer.acceptWaveform(pcmBuffer);
      const result = recognizer.finalResult();
      recognizer.free();

      let parsedResult: any;
      if (typeof result === 'string') {
        parsedResult = JSON.parse(result);
      } else {
        parsedResult = result;
      }

      Logger.log('Speech recognition result: \n' + JSON.stringify(parsedResult));

      return {
        text: parsedResult.text || '',
        confidence: parsedResult.confidence,
      };
    } catch (error) {
      throw new Error(`Speech recognition failed: ${error.message}`);
    }
  }

  // --- QUERY PROCESSING LOGIC ---

  private additionalStopwords = [
      'please', 'could you', 'would you', 'can you', 'show me', 'i want', 'i need', 'find', 'the', 'a', 'an', 'to', 'for', 'me', 'my', 'with', 'of', 'on', 'in', 'at', 'by', 'from', 'and', 'or', 'that', 'this', 'these', 'those', 'just', 'only', 'now', 'all', 'any', 'some', 'like', 'about', 'give', 'get', 'tell', 'list', 'display', 'see', 'let me', 'let', 'how', 'much', 'many', 'which', 'what', 'is', 'are', 'was', 'were', 'be', 'as', 'it', 'do', 'does', 'did', 'will', 'should', 'could', 'would', 'may', 'might', 'must', 'shall', 'want', 'need', 'help', 'assist', 'assist me', 'help me', 'show'
  ];

  prepareQuery(query: string): string {
    let q = query.toLowerCase();
    const words = q.split(/\s+/);
    const filtered = sw.removeStopwords(words);
    q = filtered.join(' ').trim();

    this.additionalStopwords.forEach(word => {
      const re = new RegExp('\\b' + word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'gi');
      q = q.replace(re, ' ');
    });

    return q;
  }

  /**
   * Helper: Maps the Action Result to a human-readable sentence
   */
  private generateSpokenResponse(actionResult: AssistantAction): string {
    const { action, params } = actionResult;

    if (action === 'show_cart') {
      return 'Opening your shopping cart.';
    }
    
    if (action === 'sort_and_filter') {
      if (params?.sortBy === 'price') {
        return `Sorting products by price ${params.order === 'desc' ? 'high to low' : 'low to high'}.`;
      }
      if (params?.sortBy === 'name') {
        return `Sorting products by name ${params.order === 'desc' ? 'Z to A' : 'A to Z'}.`;
      }
      if (params?.filter?.price) {
         return `Showing items less than ${params.filter.price.lt} dollars.`;
      }
      if (params?.filter?.category) {
        return `Here are the ${params.filter.category} you asked for.`;
      }
      return 'Filtering products for you.';
    }

    if (action === 'greeting') {
      return 'Hello! How can I assist you today?';
    }

    return "I am not sure how to help with that request.";
  }

  /**
   * Helper: Converts text to Base64 MP3 using gTTS
   */
  private async generateAudio(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const gtts = new gTTS(text, 'en');
        const chunks: Buffer[] = [];
        const audioStream = gtts.stream();

        audioStream.on('data', (chunk) => chunks.push(chunk));
        
        audioStream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(`data:audio/mp3;base64,${buffer.toString('base64')}`);
        });

        audioStream.on('error', (err) => {
          console.error('gTTS Stream Error:', err);
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Main Handler: Returns Action + Audio
   */
  async handleQuery(query: string): Promise<AssistantAction & { audio: string, responseText: string }> {
    const q = this.prepareQuery(query);

    let actionResult: AssistantAction;

    if (q.includes('cart')) {
      actionResult = { action: 'show_cart' };
    } else if (q.includes('sort') && q.includes('price')) {
      actionResult = { action: 'sort_and_filter', params: { sortBy: 'price', order: q.includes('desc') ? 'desc' : 'asc' } };
    } else if (q.includes('sort') && q.includes('name')) {
      // Only trigger sort by name if the query explicitly asks for it
      actionResult = { action: 'sort_and_filter', params: { sortBy: 'name', order: q.includes('desc') ? 'desc' : 'asc' } };
    } else {
      const priceMatch = q.match(/less than (\d+)/);
      if (priceMatch) {
        actionResult = { action: 'sort_and_filter', params: { filter: { price: { lt: Number(priceMatch[1]) } } } };
      } else {
        const showMatch = q.match(/show (.+)/);
        if (showMatch && !q.includes('cart')) {
          actionResult = { action: 'sort_and_filter', params: { filter: { category: showMatch[1].trim() } } };
        } else {
          // Greeting detection (only if no other command matched)
          const greetingWords = [
            'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy', 'yo', 'sup', 'good day'
          ];
          const originalQuery = query.toLowerCase();
          const isGreeting = greetingWords.some(word => originalQuery.includes(word));
          if (isGreeting) {
            actionResult = { action: 'greeting', params: { query } };
          } else {
            actionResult = { action: 'unknown', params: { query } };
          }
        }
      }
    }

    const textToSpeak = this.generateSpokenResponse(actionResult);

    let audioData = '';
    try {
      audioData = await this.generateAudio(textToSpeak);
    } catch (err) {
      Logger.error('Failed to generate TTS audio', err);
      audioData = ''; 
    }

    return {
      ...actionResult,
      responseText: textToSpeak,
      audio: audioData
    };
  }
}