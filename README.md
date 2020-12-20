# FURUI 👨‍💻
```  
  An isolated community on vscode
	Add your own codes
	See codes written by others
	Review other users' code
	Get Review on your codes
	Help others
```
## Functionalities 
	- Login with Github
	- Add new code posts
	- View codes posted by other users (feed)
	- Increment/decrement [like/dislike]
	- Add comments
	- Specify tags while adding a post
	- Filter feed using tags

## How to run 🚀
### _backend:_
	Open /backend/ in terminal
	> npm install
	> node index.js
### _frontend (extension):_
	Open /vs-code-extension/furui in vscode
	> npm install
	> Press f5
### _Commands:_
	Extension commands can be run using:
	> press ctrl + shift + p , then choose your command
	> use keybindings (shortcut keys)

## Usage
	We can run commands from Command Palette or by using shortcut keys
	Keybindings can be changed as per convinience
	For this extension commands are:
		Login with github, (ctrl+p l)
		Add new Code, (ctrl+p a)
		Feed, (ctrl+p f)
		Feed Next, (ctrl+p right)
		Feed Prev, (ctrl+p left)
		Set Tags, (ctrl+p t)
		See Profile (ctrl+p o)

	New code can be added by selecting the code in vscode editor
	and then by running commmand : Add New Code
	Then you have to give Title ans set tags for the post

	Command: Feed shows posts according to tags set using 
	command: Set Tags 
	Example:
		Users can add posts with tag 'help' and others can
		easily help them by getting posts having tag 'help'
		OR they can also specify language (js, cpp) in tags. etc.

	Feed Next and Feed Prev can be used to navigate feed

	See Profile is used to see profile of other users by entering
	username

	Increment/decrement and Comments are added by clicking respective
	areas on page :
 	++ and -- for increment and decrement
	() => for comments
            
## VSCode API Documentation :
https://code.visualstudio.com/api/get-started/your-first-extension


