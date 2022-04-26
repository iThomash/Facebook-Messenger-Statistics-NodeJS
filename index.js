const fs = require("fs");
const functions = require("./functions");
const data = require("./dataAnalyser");

async function main() {
    if (!fs.existsSync("./messages/") || !fs.existsSync("./messages/inbox/")) {
        console.log("\x1b[31m%s\x1b[0m", "You have put data in a wrong way. Folder should be named \"messages\"") 
        return process.exit();
    }
    if (!fs.existsSync("./messages/autofill_information.json")) {
        console.log("\x1b[31m%s\x1b[0m", "File autofill_information.json has not been found. Please put it back, to make my work easier. Thanks") 
        return process.exit();
    }
    const userData = JSON.parse(fs.readFileSync("./messages/autofill_information.json").toString());
    if (!fs.existsSync("./jsonData/")) fs.mkdirSync("./jsonData/");
    let dirMessages = fs.readdirSync("./messages/inbox/").concat(fs.readdirSync("./messages/archived_threads/"));

    let participants = functions.getRecipients(dirMessages, userData);
    fs.writeFileSync("./jsonData//general.json", JSON.stringify(participants, null, "\t"));
    console.log("Successfully created and wrote general JSON file.");
    functions.joinFiles(participants, "./jsonData/");
    console.log("Successfully generated JSON files.");
    console.log("Successfully fixed JSON files.");
    //Overview statistics generation to dont make them render 5 times
    if (!fs.existsSync("./analysedData/")) fs.mkdirSync("./analysedData/");
    console.log("Creating overview statistics.");
    data.createAllUsersShort(userData);
    data.createOverview();
    console.log("Analysing your activity time.");
    data.analyseTime(userData);
    console.log("Analysing every word you wrote.");
    data.wordUsage(userData);
    console.log("Generating info about reactions.");
    data.reactionAnalyser()
}

function server() {
    const express = require('express');
    const app = express();
    app.set('view engine', 'ejs');
    app.use("/styles", express.static(__dirname + "/styles"));
    app.use("/javascript", express.static(__dirname + "/javascript"));
    const port = 80;
    let dirConversations = fs.readdirSync("./messages/inbox/").concat(fs.readdirSync("./messages/archived_threads/"))
    const generatedData = JSON.parse(fs.readFileSync("./jsonData/general.json").toString());
    const userData = JSON.parse(fs.readFileSync("./messages/autofill_information.json").toString());

    app.get('/', (req, res) => {
        res.status(200).render(__dirname + '/views/index.ejs', userData);
    });

    app.use('/user/:user', (req, res) => {
        if (!dirConversations.includes(req.params.user)) return res.status(404).render("404", { params: req.params });
        else return res.status(200).send(req.params);
    });

    app.get('/user/', (req, res) => {
        let analysedData = new Object({
            userData: userData,
            generatedData: generatedData,
            descriptions: functions.getTypeDescription(),
        });
        fs.readdirSync("./analysedData/").forEach(file => {
            analysedData[file.split(".")[0]] = JSON.parse(fs.readFileSync(`./analysedData/${file}`));
        });
        res.status(200).render("user", analysedData);
    });

    app.get('/word/', (req, res) => {
        res.status(200).render("word", {
            words: JSON.parse(fs.readFileSync("./analysedData/words.json").toString())
        });
    });

    app.listen(port, () => {
        console.log(`Turning server on port ${port}. You can open \x1b[32mhttp://localhost/\x1b[0m to make a research of your data.`);
        console.log("\x1b[31m%s\x1b[0m", "Don't close terminal/command line!");
    });
}

main().then(() => {
    server();
});