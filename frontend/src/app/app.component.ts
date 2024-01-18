import { Component, OnInit } from '@angular/core';
import { Buffer } from 'buffer';
import axios from 'axios';
import { AuthService } from './auth/auth.service';
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

	constructor(private authService: AuthService) {

	}

	async ngOnInit(): Promise<void> {
		this.loading = true;

		let localData: any = localStorage.getItem('sb-qgkhqqydyzaxeqyskhrq-auth-token')

		if (localData) {
			localData = JSON.parse(localData)
			// this.signInWithGoogle()
		}
		// Assuming you have an async initialization method in your AuthService
		await this.authService.ngOnInit();
		this.isLoginObservable = this.authService.isLogin$.subscribe(async (status: boolean) => {
			this.isLogin = await status;
			this.loading = false;
			console.log(status, this.loading, 'status');
		});

		const params = new URL(window.location.href).searchParams;
		const code = params.get('code');
		if (code) {
			let postData = {
				id:localData.user.identities[0].id,
				token :localData.access_token,
				user_id:localData.user.id
			}
			this.addNotionTokenToSupabase(postData);
		}
	}

	async signInWithGoogle(): Promise<void> {
		this.loading = true;
		try {
			const res: boolean = await this.authService.signInWithGoogle();
			console.log(this.loading, res, 'signinwithgoogle');
		} finally {
			this.loading = false;
		}
	}

	async signout() {
		this.loading = true;
		this.authService.signout();
	}


	async connectToNotion() {
		const oauthClientId = '4c51dd4c-9b93-4b80-a0b2-4d107b8e0a0a'; // Replace with your actual OAuth client ID
		return `https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user`;
	}








	getNotionAuthUrl(): string {
		const oauthClientId = '4c51dd4c-9b93-4b80-a0b2-4d107b8e0a0a'; // Replace with your actual OAuth client ID
		return `https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user`;
	}

	addNotionTokenToSupabase(postData: any): void {
		
		axios.post(`http://localhost:3000/add-notion-token-to-supabase`, postData)
			.then(async (resp) => this.dbs = await resp);

	}

}