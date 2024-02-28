import { Injectable, NotAcceptableException, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosResponse } from 'axios';
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';
const fs = require('fs');
const path = require('path');

const sharp = require('sharp');

import { env } from 'process';
import { join } from 'path';
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
    try {
      let { token, user_id } = _data;
      await this.createSupabaseClient(token);

      const { data, error } = await this.supabase
        .from('credentials')
        .select()
        .eq('user_id', user_id);

      let saveData = {
        token: token,
        user_id: user_id
      };

      if (data.length === 0) {
        await this.supabase.from('credentials').insert(saveData).select();
      } else {
        await this.supabase
          .from('credentials')
          .update({ token: token })
          .eq('user_id', user_id)
          .select();
      }

      return { data, error };
    } catch (error) {
      throw new NotAcceptableException(`Error adding Google token to Supabase: ${error.message}`);
    }
  }

  async addNotionTokenToSupabase(_data: any) {
    try {
      let { code, token, user_id } = _data;
      await this.createSupabaseClient(token);

      const { data, error } = await this.supabase
        .from('notion')
        .select()
        .eq('user_id', user_id);

      let saveData = {
        code: code,
        user_id: user_id
      };

      if (data.length === 0) {
        await this.supabase.from('notion').insert(saveData).select();
        this.fetchNotionToken(code, _data);
      } else {
        await this.supabase
          .from('notion')
          .update({ code: code })
          .eq('user_id', user_id)
          .select();
        this.fetchNotionToken(code, _data);
      }

      return { data, error };
    } catch (error) {
      throw new NotAcceptableException(`Error adding Notion token to Supabase: ${error.message}`);
    }
  }

  async addSecretToSupabase(_data: any, secret: any) {
    try {
      let { code, token, user_id } = _data;
      await this.createSupabaseClient(token);

      const { data, error } = await this.supabase
        .from('secret')
        .select()
        .eq('user_id', user_id);

      let saveData = {
        secret: secret,
        user_id: user_id
      };

      if (data.length === 0) {
        await this.supabase.from('secret').insert(saveData).select();
      } else {
        await this.supabase
          .from('secret')
          .update({ secret: secret })
          .eq('user_id', user_id)
          .select();
      }

      return { data, error };
    } catch (error) {
      throw new NotAcceptableException(`Error adding secret to Supabase: ${error.message}`);
    }
  }

  async getNotionTokenFromSupabase(_data: any) {
    let { token } = _data
    await this.createSupabaseClient(token)
    await this.supabase.from('auth.users').delete().match({ id: 'user-id' });
    const { data, error } = await this.supabase
      .from('credentials')
      .delete()

    return { data, error }
  }

  async getCodeDetails(_data) {
    try {
      let { token, user_id } = _data;

      if (!token || !user_id) {
        throw new Error('Invalid input data. Please provide code, token, and user_id.');
      }

      await this.createSupabaseClient(token);

      const { data, error }: any = await this.supabase
        .from('secret')
        .select();

      if (error) {
        throw new Error('Error fetching data from Supabase.');
      }

      return { isData: true, data };
    } catch (error) {
      console.error('Error in getCodeDetails:', error);
      throw new Error('Failed to get code details.');
    }
  }

  async fetchNotionToken(code: string, _data: any) {
    try {
      const clientId = env.clientId;
      const clientSecret = env.secretKey;

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

        try {
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

          if (!data?.results) {
            throw new NotFoundException('No databases found in Notion search.');
          }

          this.addSecretToSupabase(_data, response?.data?.access_token);
          return data?.results;
        } catch (searchError) {
          console.error('Error during Notion search:', searchError);
        }
      } catch (tokenError) {
        console.error('Error during token retrieval:', tokenError);
      }
    } catch (error) {
      console.error('Error in fetchNotionToken:', error);
      throw new NotFoundException('Notion token retrieval failed.');
    }
  }


  async createNotion(token: string, _data: any): Promise<any> {
    try {
      this.notion = await new Client({
        auth: token,
      });

      const databases = await this.notion.search({
        filter: {
          property: "object",
          value: "database",
        },
      });

      if (databases.results.length === 0) {
        throw new NotAcceptableException("This bot doesn't have access to any databases!");
      }

      const database = databases.results[0];
      if (!database) {
        throw new NotAcceptableException("This bot doesn't have access to any databases!");
      }

      // Check if either Websites or Website is present in _data
      try {
        if (_data.Websites || _data.Website) {
          // Use the appropriate property based on availability
          const websitesArray = _data.Websites || _data.Website;

          // Concatenate the websites array into a single string
          _data.Websites = websitesArray.join(', ');

          // Remove the redundant property if it exists
          delete _data.Website;
        }
      } catch (websitesError) {
        console.error('Error processing websites:', websitesError);
      }

      // Map data entries for formatted output
      // const formattedData = Object.entries(_data).map(([key, value]) =>
      //   `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
      // );

      const timestamp = Date.now();
      // const date = new Date(timestamp);

      // const options: any = {
      //   year: 'numeric',
      //   month: 'long',
      //   day: 'numeric',
      //   hour: 'numeric',
      //   minute: 'numeric',
      //   second: 'numeric',
      //   timeZoneName: 'short',
      // };

      // const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

      // const blockId = databases.results[0].id;

      const imageUrl = _data.img;
      let profileImage;

      try {
        const response = await axios({
          method: 'get',
          url: imageUrl,
          responseType: 'arraybuffer',
        });

        // Convert the image buffer to PNG format
        const pngBuffer = await sharp(response.data).png().toBuffer();

        try {
          const { data, error } = await this.supabase.storage
            .from('avatars')
            .upload(`public/${timestamp}.png`, pngBuffer, { contentType: 'image/png' });

          try {
            const { data: imageData } = await this.supabase
              .storage
              .from('avatars')
              .getPublicUrl(`public/${timestamp}.png`);

            // Now you have the Base64-encoded PNG image uploaded to Supabase storage
            profileImage = imageData.publicUrl;

            try {
              const linkedTextResponse = await this.notion.pages.create({
                parent: {
                  database_id: databases.results[0].id,
                },
                properties: {
                  Photo: {
                    type: 'files',
                    files: [
                      {
                        name: 'example.png',
                        type: 'external',
                        external: {
                          url: profileImage,
                        },
                      },
                    ],
                  },
                  Name: {
                    title: [
                      {
                        text: {
                          content: `${_data.Name}`, // Replace with your actual name
                        },
                      },
                    ],
                  },
                  Website: {
                    url: _data.Websites ? _data.Websites.replace(/\(.*\)/g, '').replace(/\n/g, '').trim() : 'No details',
                  },
                  Profile: {
                    url: _data["Your Profile"] && _data["Your Profile"][0] ? _data["Your Profile"][0].replace(/\(.*\)/g, '').replace(/\n/g, '').trim() : 'No details',
                  },
                  Email: {
                    url: _data?.Email && _data?.Email[0] ? _data.Email[0].replace(/\(.*\)/g, '').replace(/\n/g, '').trim() : 'No details',
                  },
                  About: {
                    rich_text: [
                      {
                        text: {
                          content: _data?.about,
                        },
                      },
                    ],
                  },
                  Phone: {
                    rich_text: [
                      {
                        text: {
                          content: _data && _data.Phone && _data.Phone[0] ? _data.Phone[0].replace(/\(.*\)/g, '').replace(/\n/g, '').trim() : 'No details',
                        },
                      },
                    ],
                  },
                  Status: {
                    select: {
                      name: 'Not started', // Replace with your actual status
                    },
                  },
                },
              });

              return linkedTextResponse
            } catch (linkedTextError) {
              console.error('Error creating Notion page with linked text:', linkedTextError);
            }
          } catch (imageDataError) {
            console.error('Error getting image data from Supabase storage:', imageDataError);
          }
        } catch (uploadError) {
          console.error('Error uploading image to Supabase storage:', uploadError);
        }
      } catch (imageError) {
        console.error('Error fetching or processing image:', imageError);
      }
    } catch (err) {
      throw new NotAcceptableException('Error in create data')

    }
  }

  async getUserData(_data: any): Promise<any> {
    let { token, user_id } = _data.data

    let secret = ''
    await this.createSupabaseClient(token)
    try {
      const { data, error } = await this.supabase
        .from('secret')
        .select().eq('user_id', user_id)
      if (data) {
        secret = data[0].secret
        return await this.createNotion(secret, _data.data)
      } else {
        throw new NotAcceptableException(Error)
      }

    } catch (error) {
      throw new NotAcceptableException(Error)
    }
  }

  async getExtensionId(): Promise<any> {
    return env.extensonId
  }

  async getStorageId():Promise<any>{
    return {data:env.storageId}
   }
}

