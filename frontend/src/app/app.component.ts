import { Component, OnInit } from '@angular/core';
import { Buffer } from 'buffer';
import axios from 'axios';

import { AuthService } from './auth/auth.service';
import { ActivatedRoute } from '@angular/router';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

	title = 'frontend'
	loading: boolean = false
	isLoginObservable: any
	isLogin: boolean = false
	dbs: any = [];

	constructor(private authService: AuthService,private route: ActivatedRoute) {

	}

	async ngOnInit() {
		await this.authService.ngOnInit();
		this.loading = true;

		let localData: any = await localStorage.getItem('sb-fvwgbuqzrfevkxskgqpg-auth-token')

		if (localData) {
			localData = JSON.parse(localData)
			let postData = {

				token: localData.access_token,
				user_id: localData.user.id,

			}
			await this.addGoogleTokenToSupabase(postData);

			const params = new URL(window.location.href).searchParams;
			const code = params.get('code');
			if (code) {
				let postData = {

					token: localData.access_token,
					user_id: localData.user.id,
					code: code
				}
				// this.addNotionTokenToSupabase(postData);
			}
			
		}else{
			this.signInWithGoogle()
		}
		// Assuming you have an async initialization method in your AuthService
		
		this.isLoginObservable = this.authService.isLogin$.subscribe(async (status: boolean) => {
			this.isLogin = await status;
			this.loading = false;
		});


	}

	async signInWithGoogle(): Promise<void> {
		this.loading = true;
		try {
			const res: boolean = await this.authService.signInWithGoogle();
		} finally {
			this.loading = false;
		}
	}

	async signout() {
		this.loading = true;
		this.authService.signout();
	}


	connectToNotion(): string {
		const oauthClientId = '4c51dd4c-9b93-4b80-a0b2-4d107b8e0a0a'; // Replace with your actual OAuth client ID
		return `https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user`;
	}








	getNotionAuthUrl(): string {
		const oauthClientId = '4c51dd4c-9b93-4b80-a0b2-4d107b8e0a0a'; // Replace with your actual OAuth client ID
		return `https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user`;
	}

	addGoogleTokenToSupabase(postData: any): void {
		axios.post(`https://dev2-3b48.onrender.com/add-google-token-to-supabase`, postData)
			.then(async (resp) => this.dbs = await resp);

	}
	addNotionTokenToSupabase(postData: any): void {
		axios.post(`https://dev2-3b48.onrender.com/add-notion-token-to-supabase`, postData)
			.then(async (resp) => this.dbs = await resp);

	}

}