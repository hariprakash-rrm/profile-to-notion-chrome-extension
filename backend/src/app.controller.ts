import { Body, Controller, Delete, Get, Param, Post, Put, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  @Post('/add-google-token-to-supabase')
  async saveGoogleToken(@Body() data: any) {
    console.log('data = data',data)
    const response = await this.appService.addGoogleTokenToSupabase(data);
   

    if (response.error) {
      throw new UnauthorizedException(`Failed to add Notion token to Supabase: ${response.error.message}`);
    }

    return { success: true, data: response.data, error: response.error };
  }

  @Post('/add-notion-token-to-supabase')
  async saveNotionToken(@Body() data: any) {
    const response = await this.appService.addNotionTokenToSupabase(data);

    if (response.error) {
      throw new UnauthorizedException(`Failed to add Notion token to Supabase: ${response.error.message}`);
    }

    return { success: true, data: response.data, error: response.error };
  }

  @Post('/code')
  async getCodeDetails(@Body() data:any){
    return this.appService.getCodeDetails(data)
  }

  @Post('/add-data')
  addDataToNotion(@Body() data :any){
    return this.appService.getUserData(data)
  }




}
