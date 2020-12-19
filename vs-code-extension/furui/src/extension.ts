import * as vscode from 'vscode';
import axios from 'axios';
const express = require('express');

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "furui" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('furui.login', () => {

		const app = express();

		app.get('/getToken', async (req:any, res:any) => {

			try {
				let token = req.query.access_token;

				const resultbackend = await axios({
					method: 'get',
					url: `http://localhost:3000/user`,
					headers: {
					  accept: 'application/json',
					  Authorization: `token ${token}`
					}
				  });

				  
				context.globalState.update("token", token);
				vscode.window.showInformationMessage('Successfully Logged In: ' + resultbackend.data.login);
				console.log(resultbackend.data);
				res.send("Logged In")
				console.log("Server closed")
				server.close();

			} catch (error) {
				console.log(error);
			}
		})

		var server = app.listen(5000,()=>{
			console.log("Server listening on port : 5000")
		})


		vscode.commands.executeCommand(
			"vscode.open",
			vscode.Uri.parse(`http://localhost:3000/auth/github`)
		);
	}))

}

export function deactivate() {}
