const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const process = require('process');
const fs = require('fs');
const path = require('path');


class Aws {

	constructor() {
		this.command = '';
		this.rootDir = process.cwd();  
		this.runCommand()
	}

	runCommand() {
		this.bucket = process.argv[2];
		this.objectKey = '';
		console.log(`Start put files from '/build' directory to '${this.bucket}' bucket`)
		this.getCommand();
	}

	startCommand() {
		return new Promise((resolve, reject) => {
			console.log(this.command);
			exec(this.command, (err, res) => {
				if (err) {
					reject(err);
				}
				else {
					resolve(res)
				}
			})
		});
	}

	getCommand() {
		this.buildPath = `${this.rootDir}/build`;
		this.buildDir = fs.readdirSync(this.buildPath);
		this.buildDir.map((item, index, array) => {
			const itemPath = path.normalize(`${this.buildPath}/${item}`);
			if (item !== '.git'){
				let isDir = this.checkAsDir(itemPath);
				if (isDir){
					const childDir = itemPath;
					this.putFile(`${item}/`, false, () => {
						const childDirContent = fs.readdirSync(childDir);
						childDirContent.map((item1) => {
							const childDirElemPath = path.normalize(`${childDir}/${item1}`);
							isDir = this.checkAsDir(childDirElemPath);
							let subDirKey = `${item}/${item1}`;
							if (isDir){
								subDirKey = subDirKey + '/';
								this.putFile(subDirKey, false, () => {
									const subChildDir = fs.readdirSync(childDirElemPath);
									subChildDir.map((item2) => {
										const subSubDirKey = `${subDirKey}${item2}`
										const subChildElementPath = `${childDirElemPath}/${item2}`
										this.putFile(subSubDirKey, subChildElementPath);
									});
								});
							}
							else {
								this.putFile(subDirKey, childDirElemPath);
							}
						});
					});
					console.log('isdir ', item);
				}
				else {
					this.putFile(item, itemPath);
				}
			}
		});
	}

	checkAsDir(path){
		let isDir;
		try {
			isDir = fs.readdirSync(path);
		}
		catch(e){
			return null;
		}
		return isDir;
	}

	putFile(item, itemPath, callback = () =>{}){
		const body = (itemPath)? `--body ${itemPath}` : '';
		let contentType = '';
		const cTPrefix = '--content-type';
		if (item.match(/\.html$/)){
			contentType = `${cTPrefix} text/html`
		}
		if (item.match(/\.js$/)){
			contentType = `${cTPrefix} application/json`
		}
		if (item.match(/\.css$/)){
			contentType = `${cTPrefix} text/css`
		}
		if (item.match(/\.svg$/)){
			contentType = `${cTPrefix} image/svg+xml`
		}
		if (item.match(/\.ico$/)){
			contentType = `${cTPrefix} image/ico`
		}
		if (item.match(/\.json$/)){
			contentType = `${cTPrefix}  text/x-json`
		}
		this.command = `aws s3api put-object --acl public-read --bucket ${this.bucket}` +
				` --key ${item} ${body} ${contentType}`;
		const resPut = this.startCommand();
		resPut.then((res, err) => {
			if (res){console.log('Put result: ', res)}
			else {console.log('Put error: ', err)}
			callback();
		}).catch(e=>{console.log('Put catch: ', e)})
	}
}

const aws = new Aws();
