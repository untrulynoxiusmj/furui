"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
const express = require("express");
function activate(context) {
    console.log('Congratulations, your extension "furui" is now active!');
    context.globalState.update("page", 1);
    let currentPanel = undefined;
    context.subscriptions.push(vscode.commands.registerCommand("furui.login", () => {
        const app = express();
        app.get("/getToken", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let token = req.query.access_token;
                const resultbackend = yield axios_1.default({
                    method: "get",
                    url: `http://localhost:3000/user`,
                    headers: {
                        accept: "application/json",
                        Authorization: `token ${token}`,
                    },
                });
                if (resultbackend.data.success) {
                    context.globalState.update("token", token);
                    vscode.window.showInformationMessage("Successfully Logged In: " +
                        resultbackend.data.login);
                    showProfile(resultbackend.data.login);
                    console.log(resultbackend.data);
                    res.send("Logged In");
                }
                else {
                    vscode.window.showInformationMessage("Login Failed");
                    res.send("Login Failed");
                }
            }
            catch (error) {
                res.send(error);
                console.log(error);
            }
            console.log("Server closed");
            server.close();
        }));
        var server = app.listen(5000, () => {
            console.log("Server listening on port : 5000");
        });
        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`http://localhost:3000/auth/github`));
    }));
    context.subscriptions.push(vscode.commands.registerCommand("furui.addCode", () => __awaiter(this, void 0, void 0, function* () {
        let text;
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
            .then((value) => __awaiter(this, void 0, void 0, function* () {
            vscode.window
                .showInputBox({
                placeHolder: "Enter tags",
                prompt: "Enter tags",
                value: "",
            })
                .then((valueTag) => __awaiter(this, void 0, void 0, function* () {
                console.log(value);
                let arrTag;
                if (valueTag) {
                    arrTag = valueTag.split(" ");
                }
                else {
                    arrTag = new Array();
                }
                let data = {
                    title: value,
                    code: text,
                    tags: arrTag,
                };
                try {
                    let token = context.globalState.get("token");
                    let result = yield axios_1.default.post(`http://localhost:3000/code`, data, {
                        headers: {
                            "content-type": "application/json",
                            Authorization: `token ${token}`,
                        },
                    });
                    if (result.data.success) {
                        vscode.window.showInformationMessage("Successfully added code to database");
                    }
                    else {
                        vscode.window.showInformationMessage("Error : Code could not added");
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }));
        }));
    })));
    let show = (currentPanel) => __awaiter(this, void 0, void 0, function* () {
        console.log("show");
        let result;
        let page = context.globalState.get("page");
        let token = context.globalState.get("token");
        let tags = context.globalState.get("tags");
        let params = {
            tags: tags,
        };
        const resultbackend = yield axios_1.default({
            method: "get",
            url: `http://localhost:3000/code/${page}`,
            params,
            headers: {
                accept: "application/json",
                Authorization: `token ${token}`,
            },
        });
        console.log(resultbackend);
        vscode.window.showInformationMessage("Successfully retrieved codes from database");
        console.log(resultbackend.data);
        currentPanel.webview.html = getWebviewContent(resultbackend);
    });
    let showProfile = (username) => __awaiter(this, void 0, void 0, function* () {
        let token = context.globalState.get("token");
        let resultbackendPro = yield axios_1.default({
            method: "get",
            url: `http://localhost:3000/profile/${username}`,
            headers: {
                accept: "application/json",
                Authorization: `token ${token}`,
            },
        });
        console.log(resultbackendPro.data);
        if (resultbackendPro.data.success) {
            let profilePanel = vscode.window.createWebviewPanel("Furui", "Furui", vscode.ViewColumn.One, {
                enableScripts: true,
            });
            console.log("here");
            profilePanel.webview.html = getWebviewContentProfile(resultbackendPro);
            vscode.window.showInformationMessage("Successfully retrieved user from database");
        }
        else {
            vscode.window.showInformationMessage("Could not find user");
        }
    });
    context.subscriptions.push(vscode.commands.registerCommand("furui.getProfile", () => __awaiter(this, void 0, void 0, function* () {
        let resultbackendPro;
        vscode.window
            .showInputBox({
            placeHolder: "Username",
            prompt: "Type username",
            value: "",
        })
            .then((value) => __awaiter(this, void 0, void 0, function* () {
            showProfile(value);
        }));
    })));
    context.subscriptions.push(vscode.commands.registerCommand("furui.getCode", () => __awaiter(this, void 0, void 0, function* () {
        if (currentPanel != undefined) {
            currentPanel.reveal();
            show(currentPanel);
            return;
        }
        else {
            currentPanel = vscode.window.createWebviewPanel("Furui", "Furui", vscode.ViewColumn.One, {
                enableScripts: true,
            });
        }
        show(currentPanel);
        currentPanel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            switch (message.command) {
                case 'like': {
                    let token = context.globalState.get("token");
                    const resultN = yield axios_1.default({
                        method: "post",
                        url: "http://localhost:3000/like/?id=" + message.text,
                        headers: {
                            accept: "application/json",
                            Authorization: `token ${token}`,
                        },
                    });
                    if (currentPanel != undefined) {
                        show(currentPanel);
                    }
                    else {
                        vscode.commands.executeCommand('scully.getCode');
                    }
                    vscode.window.showInformationMessage("Successfully liked the post");
                    break;
                }
                case 'comment': {
                    let token = context.globalState.get("token");
                    let data = {
                        id: message.id,
                        text: message.text
                    };
                    const resultNc = yield axios_1.default.post(`http://localhost:3000/comment`, data, {
                        headers: {
                            'content-type': 'application/json',
                            Authorization: `token ${token}`
                        }
                    });
                    if (currentPanel != undefined)
                        show(currentPanel);
                    else {
                        vscode.commands.executeCommand('scully.getCode');
                    }
                    vscode.window.showInformationMessage("Succesfully posted the comment");
                    break;
                }
            }
        }), undefined, context.subscriptions);
        currentPanel.onDidDispose(() => {
            context.globalState.update("page", 1);
            vscode.window.showInformationMessage("Web View Disposed");
            currentPanel = undefined;
        }, null, context.subscriptions);
    })));
    context.subscriptions.push(vscode.commands.registerCommand('furui.setTags', () => {
        vscode.window.showInputBox({
            placeHolder: 'Enter tags',
            prompt: 'Enter tags',
            value: ''
        }).then(tgs => {
            context.globalState.update("tags", tgs);
            context.globalState.update("page", 1);
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand("furui.next", () => __awaiter(this, void 0, void 0, function* () {
        let page = context.globalState.get("page");
        context.globalState.update("page", page + 1);
        vscode.commands.executeCommand("furui.getCode");
    })));
    context.subscriptions.push(vscode.commands.registerCommand("furui.prev", () => __awaiter(this, void 0, void 0, function* () {
        let page = context.globalState.get("page");
        if (page > 0) {
            context.globalState.update("page", page - 1);
        }
        vscode.commands.executeCommand("furui.getCode");
    })));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function getWebviewContent(resultbackend) {
    let element = resultbackend.data;
    let cA;
    if (element.comments != undefined) {
        cA = JSON.stringify(element.comments.reverse(), undefined, 4);
    }
    else {
        cA = "No Comments";
    }
    let allCodes = `
    
    <!DOCTYPE html>

	<html>
	
	
		<head>

            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.4.1/styles/nord.min.css" integrity="sha512-igI4zzTHEU3IASS/ojMD7tO6hScqpnEnz41u+xVRNZvZEaF3XaCdre0qZ08frR1hri9+aSNeAXlQz1DS3luvxA==" crossorigin="anonymous" />
        
            <style>
                pre > code {
                    font-family: 'Fira Code', monospace;
                    
                    margin-left: auto;
                    margin-right: auto;
                    height: 60vh;
                    width: 80vh;
                    overflow-x:auto;
                    overflow-y:auto;
                }

                body {
                    vscode-light {
                        color: black;
                    }
                      
                    vscode-dark {
                        color: white;
                    }
                      
                    vscode-high-contrast {
                        color: red;
                    }

                    font-size: medium;
                    padding : 2em;
                    font-family: 'Fira Code', monospace;
                }

                .all{
                    display:flex;
                    flex-wrap:wrap;
                    justify-content: space-evenly;
                }

                .inc, .comm{
                    font-size:5vh;
                }
                .commentbox {
                    
                    margin-left: auto;
                    margin-right: auto;
                    height: 60vh;
                    overflow-y:auto;
                }

                textarea{
                    color: var(--vscode-editor-foreground);
                    width: 60vh;
                    background-color: var(--vscode-editor-background);
                    box-sizing: border-box;
                    font-size:large
                }

                img{
                    
                    display: inline-block;
                    border-radius: 50%;
                    width : 4vh;
                }

                .pro {
                        display: flex;
                        align-items:center;
                        font-size:4vh;
                }

                .four {
                    font-size:4vh;	
                }
                
            </style>
        
		</head>
	
		<body>
    
            <div class=all>
                <div class=one>
                    <div class=pro>
                        <img src = ${element.image} onerror="this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgRlaLA5Gg9NCwxcz30Go5FST9L9_OYeNkyQ&usqp=CAU';">&nbsp;
                        <span>${element.username}</span>
                        <span>:</span>
                        <span>${element.title}</span>
                    </div>
                    <pre>
                        <code>${element.code}</code>
                    </pre>
                
                    <div class=inc>
                        <span>${element.likes}</span>
                        <span class=like onclick="like('${element._id.toString()}')">++</span>
                    </div>
                </div>
            
                <div class="commentBox">
                    <span class=four>Comments</span>
                    <pre>
                        <code>${cA}</code>
                    </pre>
                    <div class="textarea-container">
                        <textarea name="Write your Comment" id="ta" placeholder="Write your Comment"></textarea>
                        <span class=comm onclick="comment('${element._id.toString()}')">() => </span>
                    </div>
                </div>
            </div>
        
            <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.4.1/highlight.min.js"></script>
	        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
	        <script>

                hljs.initHighlightingOnLoad();
                const vscode = acquireVsCodeApi();
                console.log("hello");
                
                function like(id){
                    vscode.postMessage({
                        command: 'like',
                        text: id
                    })
                }
                function comment(id){
                    let tx = document.getElementById("ta").value;
                    vscode.postMessage({
                        command: 'comment',
                        text: tx,
                        id : id
                    })
                }

            </script>
            
        </body>

	    <script>
            if (${element.liked}){
                document.querySelector(".like").textContent = "--";
            }
	    </script>

    </html>`;
    console.log(allCodes);
    return allCodes;
}
function getWebviewContentProfile(resultbackend) {
    let element = resultbackend.data;
    let htmlCon = `
    
    <html>
        <head>
            <style>
                img {
                    border-radius: 50%;
                    width : 25vh;
                }
                h1 {
                    font-size : 6vh;
                }
                h2 {
                    font-size : 4vh;
                }
            </style>
        </head>
        <body>
            <center>
                <h1>${element.username}</h1>
                <img src=${element.avatar_url}>
                <h2>${element.name}</h2>
                <h2>Github : </h2>
                <h2>Followers : ${element.followers}</h2>
                <h2>Following : ${element.following}</h2>
                <h2>Public repos : ${element.public_repos}</h2>
            </center>
        </body>
    </html>
    `;
    return htmlCon;
}
//# sourceMappingURL=extension.js.map