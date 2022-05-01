const fs = require("fs");
module.exports = {
    createAllUsersShort: (user) => {
        let allFiles = fs.readdirSync("./jsonData/").filter(f => f != "general.json");
        let allConversations = new Object();
        allFiles.forEach(file => {
            let fileAsJSON = JSON.parse(fs.readFileSync(`./jsonData/${file}`).toString());
            allConversations[file.split(".")[0]] = {
                conversationType: fileAsJSON.thread_type,
                title: fileAsJSON.title,
                file: file,
                originalFilePath: fileAsJSON.thread_path,
                participants: fileAsJSON.participants,
                pMessages: fileAsJSON.messages.filter(m => (m.content && !m.photos && user.fullName.includes(m.sender_name))).length,
                oMessages: fileAsJSON.messages.filter(m => (m.content && !m.photos && !user.fullName.includes(m.sender_name))).length,
                pPhotos: fileAsJSON.messages.filter(m => !m.content && m.photos &&user.fullName.includes(m.sender_name)).length,
                oPhotos: fileAsJSON.messages.filter(m => !m.content && m.photos && !user.fullName.includes(m.sender_name)).length,
                cpMessages: fileAsJSON.messages.filter(m=> m.content && m.photos && user.fullName.includes(m.sender_name)).length,
                coMessages: fileAsJSON.messages.filter(m=> m.content && m.photos && !user.fullName.includes(m.sender_name)).length,
                rpMessages: fileAsJSON.messages.filter(m => (m.is_unsent === true && user.fullName.includes(m.sender_name))).length,
                roMessages: fileAsJSON.messages.filter(m => (m.is_unsent === true && !user.fullName.includes(m.sender_name))).length
            };
            delete fileAsJSON;
            return;
        });
        fs.writeFileSync("./analysedData/allUsers.json", JSON.stringify(allConversations, null, "\t"));
        return;
    },
    createOverview: function (user) {
        let allUserShort = JSON.parse(fs.readFileSync("./analysedData/allUsers.json").toString());
        let onePersonConversations = new Array(), standardConversations = new Array(), groupConversations = new Array();
        for (let key in allUserShort) {
            if (allUserShort[key].participants.length === 0 || (allUserShort[key].participants.length===1 && user.fullName.includes(allUserShort[key].participants[0]))) {
                onePersonConversations.push(key);
            } else {
                if (allUserShort[key].conversationType === "Regular") standardConversations.push(key);
                else groupConversations.push(key);
            }
        }
        let noMessages = new Array();            //Someone accepted fRequest  You accepted fRequest \/
        Object.entries(allUserShort).filter(c => c[1].pMessages === 0 || (c[1].pMessages === 1 && c[1].oMessages === 0)).forEach((u) => { return noMessages.push(u[1].title || u[0]); });
        let parsedData = Object.entries(JSON.parse(fs.readFileSync("./analysedData/allUsers.json")));
        let summary = new Object({
            allConversations: allUserShort.length,
            onePersonConversations: onePersonConversations,
            standardConversations: standardConversations,
            groupConversations: groupConversations,
            allMessagesSent: parsedData.map(u=>u[1].pMessages).reduce((a,b)=>a+b),
            allPhotosSent: parsedData.map(u=>u[1].pPhotos).reduce((a,b)=>a+b),
            allMessagesReceived: parsedData.map(u=>u[1].oMessages).reduce((a,b)=>a+b),
            allPhotosReceived: parsedData.map(u=>u[1].oPhotos).reduce((a,b)=>a+b),
            allCombinedMessagesSent: parsedData.map(u=>u[1].cpMessages).reduce((a,b)=>a+b),
            allCombinedMessagesReceived: parsedData.map(u=>u[1].coMessages).reduce((a,b)=>a+b),
            mostMessagesPerson: Object.entries(allUserShort).filter(c => c[1].conversationType === "Regular" && c[1].participants.length === 2).sort((a, b) => { return b[1].pMessages - a[1].pMessages; })[0],
            mostMessagesGroup: Object.entries(allUserShort).filter(c => c[1].conversationType !== "Regular" && c[1].participants.length >= 2).sort((a, b) => { return b[1].pMessages - a[1].pMessages; })[0],
            noMessagesIn: noMessages,
            removedMessages: parsedData.map(u=>u[1].rpMessages).reduce((a,b)=>a+b),
        });
        fs.writeFileSync("./analysedData/overview.json", JSON.stringify(summary, null, "\t"));
        return summary;
    },
    analyseTime: async function (user) {
        let year = new Object(), hour = new Object();
        fs.readdirSync("./jsonData/").filter(f => f != "general.json").forEach((file) => {
            let tempFile = JSON.parse(fs.readFileSync(`./jsonData/${file}`).toString());
            tempFile.messages.filter(f => user.fullName.includes(f.sender_name)).forEach((message) => {
                let tempDate = new Date(message.timestamp_ms);
                if (!year[tempDate.getUTCFullYear()]) year[tempDate.getUTCFullYear()] = 1;
                else year[tempDate.getUTCFullYear()] += 1;
                if (!hour[tempDate.getUTCHours()]) hour[tempDate.getUTCHours()] = 1;
                else hour[tempDate.getUTCHours()] += 1;
                return;
            });
            delete tempFile;
        });
        //quick fix if there is gap
        year = this.fixGap(year);
        hour = this.fixGap(hour);
        fs.writeFileSync("./analysedData/yearActivityAnalyse.json", JSON.stringify(year, null, "\t"));
        fs.writeFileSync("./analysedData/hourActivityAnalyse.json", JSON.stringify(hour, null, "\t"));
    },
    fixGap: function (thingToBeFixed) {
        let thing = new Array();
        Object.keys(thingToBeFixed).forEach(y => {
            thing.push(Number(y));
        });
        thing.sort(function (a, b) { return a - b });
        let l = thing.length;
        for (let i = 0; i < l - 1; i++) {
            if (thing[i] + 1 !== thing[i + 1]) thing.push(thing[i] + 1);
        }
        thing.sort(function (a, b) { return a - b }).forEach(y => {
            if (!thingToBeFixed[y]) thingToBeFixed[y] = 0;
        });
        return thingToBeFixed;
    },
    wordUsage: function (user) {
        let words = new Object();
        fs.readdirSync("./jsonData/").filter(f => f != "general.json").forEach((file) => {
            let bigMessage = "", anotherBigMessage="";
            bigMessage = JSON.parse(fs.readFileSync(`./jsonData/${file}`)).messages
                .filter(m => m.content && user.fullName.includes(m.sender_name))
                .map(message => message.content)
                .join(" ");
            JSON.parse(fs.readFileSync(`./jsonData/${file}`)).messages.filter(m => m.content && user.fullName.includes(m.sender_name)).forEach(message => {
                anotherBigMessage += " " + message.content;
                return;
            });
            anotherBigMessage.toLowerCase().replaceAll(/\n/g, " ").split(" ").forEach(word => {
                if (!words[word]) words[word] = 1;
                else words[word] += 1;
                return
            });
            delete bigMessage, anotherBigMessage;
            return;
        });
        delete words[""]; //Probably new lines but its not a word!
        fs.writeFileSync("./analysedData/words.json", JSON.stringify(words, null, "\t"));
        return;
    },
    reactionAnalyser: function () {
        return;
    }
}