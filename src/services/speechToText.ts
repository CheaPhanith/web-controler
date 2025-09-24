import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface SpeechToTextResult {
  text: string;
  success: boolean;
  error?: string;
}

export class SpeechToTextService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  async startRecording(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<SpeechToTextResult> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve({ text: '', success: false, error: 'No active recording' });
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const transcription = await this.transcribeAudio(audioBlob);
          this.isRecording = false;
          resolve(transcription);
        } catch (error) {
          console.error('Error processing audio:', error);
          resolve({ 
            text: '', 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      };

      this.mediaRecorder.stop();
      
      // Stop all tracks to release microphone
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    });
  }

  private async transcribeAudio(audioBlob: Blob): Promise<SpeechToTextResult> {
    try {
      // Convert blob to File for OpenAI API
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en', // You can change this to other languages
        response_format: 'text'
      });

      return {
        text: transcription as string,
        success: true
      };
    } catch (error) {
      console.error('OpenAI transcription error:', error);
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Transcription failed'
      };
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Utility method to check if browser supports speech recognition
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

export const speechToTextService = new SpeechToTextService();
