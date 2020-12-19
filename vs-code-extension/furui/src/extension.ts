import * as vscode from "vscode";
import axios from "axios";
const express = require("express");

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "furui" is now active!');

    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    context.subscriptions.push(
        vscode.commands.registerCommand("furui.login", () => {
            const app = express();

            app.get("/getToken", async (req: any, res: any) => {
                try {
                    let token = req.query.access_token;

                    const resultbackend = await axios({
                        method: "get",
                        url: `http://localhost:3000/user`,
                        headers: {
                            accept: "application/json",
                            Authorization: `token ${token}`,
                        },
                    });

                    if (resultbackend.data.success) {
                        context.globalState.update("token", token);
                        vscode.window.showInformationMessage(
                            "Successfully Logged In: " +
                                resultbackend.data.login
                        );
                        console.log(resultbackend.data);
                        res.send("Logged In");
                    } else {
                        vscode.window.showInformationMessage("Login Failed");
                        res.send("Login Failed");
                    }
                } catch (error) {
                    res.send(error);
                    console.log(error);
                }

                console.log("Server closed");
                server.close();
            });

            var server = app.listen(5000, () => {
                console.log("Server listening on port : 5000");
            });

            vscode.commands.executeCommand(
                "vscode.open",
                vscode.Uri.parse(`http://localhost:3000/auth/github`)
            );
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("furui.addCode", async () => {
            let text: string;
            const window = vscode.window;
            const editor = window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;
                if (selection) {
                    const originalText = editor.document.getText(selection);
                    if (originalText.length > 0) {
                        console.log(originalText);
                        text = originalText;
                    }
                }
            }

            vscode.window
                .showInputBox({
                    placeHolder: "Title for code",
                    prompt: "Type a title for code",
                    value: "",
                })
                .then(async (value) => {
                    vscode.window
                        .showInputBox({
                            placeHolder: "Enter tags",
                            prompt: "Enter tags",
                            value: "",
                        })
                        .then(async (valueTag) => {
                            console.log(value);
                            let arrTag;
                            if (valueTag) {
                                arrTag = valueTag.split(" ");
                            } else {
                                arrTag = new Array();
                            }
                            let data = {
                                title: value,
                                code: text,
                                tags: arrTag,
                            };
                            try {
                                let token = context.globalState.get("token");
                                let result = await axios.post(
                                    `http://localhost:3000/code`,
                                    data,
                                    {
                                        headers: {
                                            "content-type": "application/json",
                                            Authorization: `token ${token}`,
                                        },
                                    }
                                );

                                if (result.data.success) {
                                    vscode.window.showInformationMessage(
                                        "Successfully added code to database"
                                    );
                                } else {
                                    vscode.window.showInformationMessage(
                                        "Error : Code could not added"
                                    );
                                }
                            } catch (error) {
                                console.log(error);
                            }
                        });
                });
        })
    );

    let show = async (currentPanel: vscode.WebviewPanel) => {
        let result;
        let page: any = context.globalState.get("page");
        let token = context.globalState.get("token");
        let tags = context.globalState.get("tags");
        let params = {
            tags: tags,
        };
        const resultbackend = await axios({
            method: "get",
            url: `http://localhost:3000/code/${page}`,
            params,
            headers: {
                accept: "application/json",
                Authorization: `token ${token}`,
            },
        });

        vscode.window.showInformationMessage(
            "Successfully retrieved codes from database"
        );
        console.log(resultbackend.data);

        currentPanel.webview.html = getWebviewContent(resultbackend);
    };

    context.subscriptions.push(
        vscode.commands.registerCommand("furui.getCode", async () => {
            if (currentPanel != undefined) {
                currentPanel.reveal();
                show(currentPanel);
                return;
            } else {
                currentPanel = vscode.window.createWebviewPanel(
                    "Furui",
                    "Furui",
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
                    }
                );
            }

            show(currentPanel);

            currentPanel.onDidDispose(
                () => {
                    vscode.window.showInformationMessage("Web View Disposed");
                    currentPanel = undefined;
                },
                null,
                context.subscriptions
            );
        })
    );

    context.subscriptions.push(vscode.commands.registerCommand('furui.next', async () => {
		let page:any = context.globalState.get("page")
		context.globalState.update("page", page+1);
		vscode.commands.executeCommand('furui.getCode');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('furui.prev', async () => {
		let page:any = context.globalState.get("page")
		if (page>0){
			context.globalState.update("page", page-1);
		}
		vscode.commands.executeCommand('furui.getCode');
	}));

}

export function deactivate() {}

function getWebviewContent(resultbackend: any) {
    return `<html>${resultbackend.data.code}</html>`;
}
