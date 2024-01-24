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
        // // console.log(data.length)
        predata = data
        if (data.length == 0) {
          const { data, error } = await this.supabase
            .from('credentials')
            .insert(saveData).select();
          // // console.log(data, error);
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
          // // console.log(data, error);
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
        // // console.log(data.length)
        predata = data
        if (data.length == 0) {
          const { data, error } = await this.supabase
            .from('notion')
            .insert(saveData).select();
          // // console.log(data, error);
          if (error) {
            throw new NotAcceptableException(`Supabase insert error: ${error.message}`);
          }
          this.fetchNotionToken(code, _data)
          return { data, error };
        }
        else {
          const { data, error } = await this.supabase
            .from('notion')
            .update({ code: code })
            .eq('user_id', user_id).select()
          // // console.log(data, error);
          this.fetchNotionToken(code, _data)
          return { data, error };
        }

      } catch (error) {
        throw new NotAcceptableException(`Error adding Notion token to Supabase: ${error.message}`);
      }

    } catch (error) {
      throw new NotAcceptableException(`Error adding Notion token to Supabase: ${error.message}`);
    }
  }

  async addSecretToSupabase(_data: any, secret: any) {
    let predata
    try {
      let { code, token, user_id } = _data;
      await this.createSupabaseClient(token);
      try {
        const { data, error } = await this.supabase
          .from('secret')
          .select().eq('user_id', user_id)
        let saveData = {
          secret: secret,
          user_id: user_id
        };
        // console.log(data.length)
        predata = data
        if (data.length == 0) {
          const { data, error } = await this.supabase
            .from('secret')
            .insert(saveData).select();
          // console.log(data, error);

          if (error) {
            throw new NotAcceptableException(`Supabase insert error: ${error.message}`);
          }

          return { data, error };
        }
        else {
          const { data, error } = await this.supabase
            .from('secret')
            .update({ secret: secret })
            .eq('user_id', user_id).select()
          // console.log(data, error);

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

    // console.log(data, error)

    return { data, error }
  }

  async getCodeDetails(_data) {
    let { code, token, user_id } = _data;
    await this.createSupabaseClient(token);
    const { data, error }: any = await this.supabase
      .from('secret')
      .select()


    return { isData: true, error }
  }










  async fetchNotionToken(code: string, _data: any) {
    const clientId = '4c51dd4c-9b93-4b80-a0b2-4d107b8e0a0a';
    const clientSecret = 'secret_SUgFeT54seyZ7JoNtYseKbFi403AKTtpnMFN5T7dnu6';

    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const url = 'https://api.notion.com/v1/oauth/token';
    const __data = {
      grant_type: 'authorization_code',
      code: code

    };

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${encoded}`

    };

    try {
      const response = await axios.post(url, __data, { headers });
      // console.log('notion test = ', response.data); // Use the response as needed

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
      console.log('test = = =', response)
      this.addSecretToSupabase(_data, response?.data?.access_token)
      // await this.createNotion(response?.data?.access_token, _data)
      // await this.createDbInNotion(_datas)
      return (data?.results)


    } catch (error) {
      console.error('Error during POST request:', error);

    }
  }

  async createNotion(token: string, _data: any) {
    try{
    this.notion = await new Client({
      auth: token,
    });
    console.log(this.notion)
    // this.notion.pages.create({

    // Create a new database
    const databases = await this.notion.search({
      filter: {
        property: "object",
        value: "page",
      },
    })

    if (databases.results.length === 0) {
      throw new Error("This bot doesn't have access to any databases!")
    }

    const database = databases.results[0]
    if (!database) {
      throw new Error("This bot doesn't have access to any databases!")
    }
    delete _data.token;
    delete _data.user_id

    // Process the "Websites" key if it exists and is an array
    if (_data.Websites && Array.isArray(_data.Websites)) {
      _data.Websites = _data.Websites.map((website) => {
        // Remove '\n' and '(Other)' from each element
        return website.replace(/\n\s*\n\s*\(Company\)/g, '').trim();
      });
    }

    const formattedData = Object.entries(_data).map(([key, value]) => {
      // Align keys and values by adding spaces or tabs
      return `${key}: ${Array.isArray(value) ? value.join(", ") : value}`;
    });
    const timestamp = Date.now();
    const date = new Date(timestamp);

    const options: any = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    };

    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);


    const blockId =  databases.results[0].id // Blocks can be appended to other blocks *or* pages. Therefore, a page ID can be used for the block_id parameter
  


    const linkedTextResponse = await this.notion.blocks.children.append({
      block_id: databases.results[0].id,
      children: [
        {
          heading_3: {
            rich_text: [
              {
                text: {
                  content: `${_data.Name}'s Profile`,
                },
              },
            ],
          },
        },
        {
          paragraph: {
            rich_text: [
              {
                text: {
                  content: `${formattedDate} \n`,
                },
              },
              // Format _data for display
              ...formattedData.map((formattedItem) => ({
                text: {
                  content: `${formattedItem}\n`,
                },
              })),
            ],
          },
        },
      ],
    });







   }catch(err){
    console.log(err)
   } // })
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
      // // console.log(newDatabase);

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

      // console.log("New page added to Notion:", newPage);
    } catch (error) {
      console.error("Error adding data to Notion database:", error);
    }
  }




 
  async getUserData(_data: any) {
    let { token, user_id } = _data.data

    let secret = ''
    await this.createSupabaseClient(token)
    try {
      const { data, error } = await this.supabase
        .from('secret')
        .select().eq('user_id', user_id)
      if (data) {
        secret = data[0].secret
        console.log(secret)
        this.createNotion(secret, _data.data)
      } else {
        console.log(error)
      }

    } catch (error) {
      console.log(error)
    }
  }




}

