import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
}
