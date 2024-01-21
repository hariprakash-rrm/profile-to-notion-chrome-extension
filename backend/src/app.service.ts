import { Injectable, NotAcceptableException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosResponse } from 'axios';
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';
import { env } from 'process';
require("dotenv").config();
export class Todo {
  id: string;
  name: string;
  done: boolean;
}
@Injectable()
export class AppService {

  SUPABASE_URL = env.SUPABASE_URL
  SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY
  supabase: any
  notion: any

  constructor(private readonly httpService: HttpService) { }

  async createSupabaseClient(access_token) {
    this.supabase = await createClient(
      this.SUPABASE_URL,
      this.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${access_token}`
          },
        },
      }
    )
  }

  async addGoogleTokenToSupabase(_data: any): Promise<any> {
    let predata
    try {
      let { token, user_id } = _data;
      await this.createSupabaseClient(token);
      try {
        const { data, error } = await this.supabase
          .from('credentials')
          .select().eq('user_id', user_id)
        let saveData = {
          token: token,
          user_id: user_id
        };
        console.log(data.length)
        predata = data
        if (data.length == 0) {
          const { data, error } = await this.supabase
            .from('credentials')
            .insert(saveData).select();
          console.log(data, error);
          if (error) {
            throw new NotAcceptableException(`Supabase insert error: ${error.message}`);
          }
          return { data, error };
        }
        else {
          const { data, error } = await this.supabase
            .from('credentials')
            .update({ token: token })
            .eq('user_id', user_id).select()
          console.log(data, error);
          return { data, error };
        }

      } catch (error) {
        throw new NotAcceptableException(`Error adding Notion token to Supabase: ${error.message}`);
      }

    } catch (error) {
      throw new NotAcceptableException(`Error adding Notion token to Supabase: ${error.message}`);
    }
  }

  async addNotionTokenToSupabase(_data: any) {
    let predata
    try {
      let { code, token, user_id } = _data;
      await this.createSupabaseClient(token);
      try {
        const { data, error } = await this.supabase
          .from('notion')
          .select().eq('user_id', user_id)
        let saveData = {
          code: code,
          user_id: user_id
        };
        console.log(data.length)
        predata = data
        if (data.length == 0) {
          const { data, error } = await this.supabase
            .from('notion')
            .insert(saveData).select();
          console.log(data, error);
          if (error) {
            throw new NotAcceptableException(`Supabase insert error: ${error.message}`);
          }
          return { data, error };
        }
        else {
          const { data, error } = await this.supabase
            .from('notion')
            .update({ code: code })
            .eq('user_id', user_id).select()
          console.log(data, error);
          return { data, error };
        }

      } catch (error) {
        throw new NotAcceptableException(`Error adding Notion token to Supabase: ${error.message}`);
      }

    } catch (error) {
      throw new NotAcceptableException(`Error adding Notion token to Supabase: ${error.message}`);
    }
  }


  async getNotionTokenFromSupabase(_data: any) {
    let { token } = _data
    await this.createSupabaseClient(token)
    await this.supabase.from('auth.users').delete().match({ id: 'user-id' });
    const { data, error } = await this.supabase
      .from('credentials')
      .delete()

    console.log(data, error)

    return { data, error }
  }

  async getCodeDetails(_data) {
    let { code, token, user_id } = _data;
    await this.createSupabaseClient(token);
    const { data, error }:any = await this.supabase
      .from('notion')
      .select()

      this.fetchNotionToken(data[0].code)
      return {data,error}
  }










  async fetchNotionToken(code: string) {
    const clientId = '4c51dd4c-9b93-4b80-a0b2-4d107b8e0a0a';
    const clientSecret = 'secret_SUgFeT54seyZ7JoNtYseKbFi403AKTtpnMFN5T7dnu6';

    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log('gettttttttt',encoded, code)

    const url = 'https://api.notion.com/v1/oauth/token';
    const _data :any= {
      grant_type: 'authorization_code',
      code: '03e68394-f5ee-4c88-b5c9-d5b7a7ed2540',
      redirect_uri: 'http://localhost:3000'
    };

    const headers:any = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${encoded}`
      
    };

    try {
      const response = await axios.post(url, _data,  {headers} );
      console.log('notion test = ',response.data); // Use the response as needed

      const { data } = await axios({
        method: "POST",
        url: "https://api.notion.com/v1/search",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${response.data.access_token}`,
          "Notion-Version": "2022-02-22",
        },
        data: { filter: { property: "object", value: "database" } },
      });
      await this.createNotion(response?.data?.access_token)
      // await this.createDbInNotion(_datas)
      return (data?.results)


    } catch (error) {
      console.error('Error during POST request:', error);

    }
  }

  async createNotion(token: string) {
    this.notion = await new Client({
      auth: 'secret_fCbj2TNEx5ZWEm1OTGgnm7y2BXVwZURdC4nPKtycM8Y',
    });
  }

  async addTodo(todo: Todo) {
    const { data, error } = await this.supabase
      .from('todos')
      .insert(todo)
    return { data, error };
  }


  async createDbInNotion(response) {
    try {
      this.notion = await new Client({
        auth: 'secret_fCbj2TNEx5ZWEm1OTGgnm7y2BXVwZURdC4nPKtycM8Y',
      });

      const newDatabase = await this.notion.databases.create({
        parent: {
          type: "page_id",
          page_id: "7c6e7cd74da24ea19deaaee0e23d34c3",
        },
        title: [
          {
            type: "text",
            text: {
              content: "LinkedIn Profiles",
            },
          },
        ],
        properties: {
          "Your Profile": {
            type: "title",
            title: {},
          },
          "Name": {
            type: "url",
            url: {},
          },
          "Phone_Numbers": {
            type: "url",
            url: {},
          },
          "Email": {
            type: "email",
            email: {},
          },
          "Websites": {
            type: "url",
            url: {},
          },
          // Add more properties as needed based on the collected data
        },
      });

      // // // Print the new database response
      // console.log(newDatabase);

      // Add a few new pages to the database that was just created

      // await addNotionPageToDatabase("4bcd163d5aa34e788ab33d52173fc032", response);
    } catch (error) {
      console.error("Error creating database:", error);
    }
  }

  // Create a new page in the Notion database
  async addNotionPageToDatabase(key, collectedData) {
    try {
      const websiteKey = collectedData.Websites
        ? "Websites"
        : collectedData.Website
          ? "Website"
          : "Unknown";
      // Create a new page in the Notion database
      const newPage = await this.notion.pages.create({
        parent: {
          database_id: key, // Replace with your Notion database ID
        },

        properties: {
          "Profile": {
            type: "title",
            title: [
              {
                type: "text",
                text: {
                  content: collectedData["Your Profile"]
                    ? collectedData["Your Profile"][0]
                    : "Unknown",
                },
              },
            ],
          },
          Name: {
            type: "url",
            url: collectedData.Name ? collectedData.Name : "Unknown",
          },
          Phone_Numbers: {
            type: "url",
            url: collectedData.Phone ? collectedData.Phone[0] : "Unknown",
          },
          Email: {
            type: "email",
            email: collectedData.Email ? collectedData.Email[0] : "Unknown",
          },
          Websites: {
            type: "url",
            url: collectedData[websiteKey]
              ? Array.isArray(collectedData[websiteKey])
                ? collectedData[websiteKey].join(", ")
                : collectedData[websiteKey].toString()
              : "Unknown",
          },

          // Add more properties as needed based on the collected data
        },
      });

      console.log("New page added to Notion:", newPage);
    } catch (error) {
      console.error("Error adding data to Notion database:", error);
    }
  }




  async getAllProducts() {
    const { data, error } = await this.supabase
      .from('todos')
      .select()

    return data
  }

  async getProductById(id: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select()
      .eq('id', id);
    return data;
  }

  async createProduct(product: any) {
    try {
      const { error } = await this.supabase
        .from('todos')
        .insert(product);

      if (error) {
        console.error('Error during product creation:', error);
        throw new Error('Failed to create product.');
      }

      return 'created!!';
    } catch (error) {
      console.error('Unexpected error during product creation:', error);
      throw new Error('Unexpected error occurred.');
    }
  }


  async updateProduct(id: string, product: any) {
    const { error } = await this.supabase
      .from('products')
      .update(product)
      .eq('id', id);
    if (error) throw error;
    return 'updated!!';
  }

  async deleteProduct(id: string) {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return 'deleted!!';
  }
}
