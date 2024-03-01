import { Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import { get } from 'http';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('/add-google-token-to-supabase')
  async saveGoogleToken(@Body() data: any) {
    try {
      const response = await this.appService.addGoogleTokenToSupabase(data);

      if (response.error) {
        throw new UnauthorizedException(`Failed to add Google token to Supabase: ${response.error.message}`);
      }

      return { success: true, data: response.data, error: response.error };
    } catch (error) {
      console.error('Error in saveGoogleToken:', error);
      throw new UnauthorizedException(`Internal server error: ${error.message}`);
    }
  }

  @Post('/add-notion-token-to-supabase')
  async saveNotionToken(@Body() data: any) {
    try {
      const response = await this.appService.addNotionTokenToSupabase(data);

      if (response.error) {
        throw new UnauthorizedException(`Failed to add Notion token to Supabase: ${response.error.message}`);
      }

      return { success: true, data: response.data, error: response.error };
    } catch (error) {
      console.error('Error in saveNotionToken:', error);
      throw new UnauthorizedException(`Internal server error: ${error.message}`);
    }
  }

  @Post('/code')
  async getCodeDetails(@Body() data: any) {
    try {
      return this.appService.getCodeDetails(data);
    } catch (error) {
      console.error('Error in getCodeDetails:', error);
      throw new UnauthorizedException(`Internal server error: ${error.message}`);
    }
  }

  @Post('/add-data')
  addDataToNotion(@Body() data: any) {
    try {
      return this.appService.getUserData(data);
    } catch (error) {
      console.error('Error in addDataToNotion:', error);
      throw new UnauthorizedException(`Internal server error: ${error.message}`);
    }
  }

  @Get('/extenion')
  getExtensionId(): Promise<any> {

    try {
      return this.appService.getExtensionId()
    } catch (error) {
      console.error('Error in getCodeDetails:', error);
      throw new UnauthorizedException(`Internal server error: ${error.message}`);
    }
  }

  @Get('/storage')
  getStorageId(): Promise<any> {

    try {
      return this.appService.getStorageId()
    } catch (error) {
      console.error('Error in getCodeDetails:', error);
      throw new UnauthorizedException(`Internal server error: ${error.message}`);
    }
  }

  @Cron('0 */10 * * * *') // Cron expression for every 10 minutes
  async pingKeepAliveEndpoint() {
    try {
      await axios.get('https://notion-backend-cvzk.onrender.com/extension');
    } catch (error) {
      console.error('Error pinging keep-alive endpoint:', error);
    }
  }
}
