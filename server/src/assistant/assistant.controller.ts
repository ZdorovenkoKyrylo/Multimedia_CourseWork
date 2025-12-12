import { Controller, Post, Body, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantAction } from './dto/assistant-action.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { SpeechToTextDto } from './dto/speech-to-text.dto';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}


  /**
   * POST /assistant/query
   * { query: string }
   * Returns: { action: string, params?: object }
   */
  @Post('query')
  async handleQuery(@Body() body: { query: string }): Promise<AssistantAction & { audio: string; responseText: string }> {
    return await this.assistantService.handleQuery(body.query);
  }

  
  /**
   * POST /assistant/speech-to-text
   * Accepts audio file (audio/webm)
   * Returns: { text: string, confidence?: number }
   */
  @Post('speech-to-text')
  @UseInterceptors(FileInterceptor('audio'))
  async speechToText(@UploadedFile() file: Express.Multer.File): Promise<SpeechToTextDto> {
    if (!file) {
      throw new BadRequestException('No audio file provided');
    }

    // Validate content type
    if (!file.mimetype.includes('audio')) {
      throw new BadRequestException('File must be an audio file');
    }

    return await this.assistantService.speechToText(file.buffer);
  }
  
}
