"use strict";
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const ConsoleCommand = require("../ConsoleCommand");

class CompileCommand extends ConsoleCommand {
    static signature = "compile";
    static description = "Compile the application based on babel-config";

    targetPath = "";
    directories = ["."];
    justCopy = ["node_modules/", "_deployment"];
    alwaysKeep = [".gitignore"];
    ignore = ["storage/compile"];

    async handle() {
        this.targetPath = process.cwd() + "/storage/compile";
        if (!fs.existsSync(this.targetPath)) {
            fs.mkdirSync(this.targetPath);
        }

        await this.clearDirectory(this.targetPath);
        this.writeln("Cleared the target-directory: " + this.targetPath);
        for (let i in this.directories) {
            if (this.directories[i] === ".") {
                this.handleDir(process.cwd(), "/");
            } else {
                this.handleDir(process.cwd() + "/" + this.directories[i], "/");
            }
        }

        if (this.args && this.args[0]) {
            if (this.args[0] && this.args[0].indexOf("--additional-compile=") > -1) {
                const directories = this.args[0].replace("--additional-compile=", "").split(",");
                if (directories && directories.length > 0) {
                    for (let i in directories) {
                        const orgPath = this.targetPath + "/" + directories[i];
                        const newPath = this.targetPath + "/" + directories[i] + "-compiled";
                        this.writeln("Compile additional: <fg=cyan>" + this.targetPath + "/" + directories[i] + "</>");

                        if (fs.existsSync(newPath)) {
                            fs.rmdirSync(newPath, { recursive: true });
                        }
                        execSync("./node_modules/.bin/babel " + orgPath + " --retain-lines -d " + newPath);

                        fs.rmdirSync(orgPath, { recursive: true });
                        fs.renameSync(newPath, orgPath);
                    }
                }
            }
        }
    }

    handleDir(directoryPath, subpath) {
        if (this.ignore.find((el) => directoryPath.replace(process.cwd() + "/", "") === el)) {
            this.writeln("Skip directory: <fg=yellow>" + directoryPath.replace(process.cwd(), "") + "</>");
            return;
        }
        this.writeln("Handle directory: <fg=cyan>" + directoryPath + "</>");

        const files = fs.readdirSync(directoryPath);
        for (let i in files) {
            const stats = fs.lstatSync(directoryPath + "/" + files[i]);

            const check = files[i].replace(process.cwd(), "");

            if (stats.isDirectory()) {
                if (this.justCopy.find((el) => el.indexOf(check) === 0)) {
                    this.writeln("Copy directory: <fg=cyan>" + files[i] + "</>");
                    execSync("cp " + files[i] + " " + this.targetPath + " -r");
                } else {
                    // Todo -> recursion
                    fs.mkdirSync(this.targetPath + (subpath !== "/" ? subpath : "") + "/" + files[i]);
                    this.handleDir(directoryPath + "/" + files[i], subpath + "/" + files[i]);
                }
            } else if (stats.isFile()) {
                this.handleFile(directoryPath + "/" + files[i], subpath);
            }
        }
    }

    handleFile(filePath, subpath) {
        const extension = path.extname(filePath);
        const filename = path.basename(filePath);
        if (extension === ".js") {
            // Datei Kompilieren
            this.writeln("   Handle file (compile): <fg=cyan>" + filePath + "</>");
            execSync(
                "./node_modules/.bin/babel " +
                    filePath +
                    " -d " +
                    this.targetPath +
                    (subpath !== "/" ? subpath : "") +
                    "/"
            );
        } else {
            this.writeln("   Handle file (copy):    <fg=cyan>" + filePath + "</>");
            fs.copyFileSync(filePath, this.targetPath + (subpath !== "/" ? subpath : "") + "/" + filename);
        }
    }

    async clearDirectory(directoryPath) {
        return new Promise((resolve) => {
            const files = fs.readdirSync(directoryPath);
            for (let i in files) {
                const tempPath = directoryPath + "/" + files[i];
                const stats = fs.lstatSync(tempPath);

                if (stats.isDirectory()) {
                    fs.rmdirSync(tempPath, { recursive: true });
                } else if (stats.isFile() && !this.alwaysKeep.includes(files[i])) {
                    fs.rmSync(tempPath);
                }
            }
            resolve();
        });
    }
}

module.exports = CompileCommand;
