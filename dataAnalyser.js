const fs = require("fs");
module.exports = {
    createAllUsersShort: (userData) => {
        let allFiles = fs.readdirSync("./jsonData/").filter(f => f != "general.json");
        let allConversations = new Object();
        allFiles.forEach(file => {
            let fileAsJSON = JSON.parse(fs.readFileSync(`./jsonData/${file}`).toString());
            let pMessages = 0, oMessages = 0;
            fileAsJSON.messages.forEach(message => {
                if (userData.autofill_information_v2.FULL_NAME.includes(message.sender_name)) pMessages += 1;
                else oMessages += 1;
                return;
            });
            allConversations[file.split(".")[0]] = {
                conversationType: fileAsJSON.thread_type,
                title: fileAsJSON.title,
                file: file,
                originalFilePath: fileAsJSON.thread_path,
                participants: fileAsJSON.participants,
                pMessages: pMessages,
                oMessages: oMessages,
                pPhotos: fileAsJSON.messages.filter(m => !m.content && userData.autofill_information_v2.FULL_NAME.includes(m.sender_name)).length,
                oPhotos: fileAsJSON.messages.filter(m => !m.content && !userData.autofill_information_v2.FULL_NAME.includes(m.sender_name)).length,
                rMessages: fileAsJSON.messages.filter(m => (m.is_unsent === true && userData.autofill_information_v2.FULL_NAME.includes(m.sender_name))).length
            };
            delete fileAsJSON;
            return;
        });
        fs.writeFileSync("./analysedData/allUsers.json", JSON.stringify(allConversations, null, "\t"));
        return;
    },
    createOverview: function () {
        let allUserShort = JSON.parse(fs.readFileSync("./analysedData/allUsers.json").toString());
        let allMessagesSent = 0, allPhotosSent = 0, allMessagesReceived = 0, allPhotosReceived = 0, removedMessages = 0, onePersonConversations = new Array(), standardConversations = new Array(), groupConversations = new Array();
        for (let key in allUserShort) {
            allMessagesSent += allUserShort[key].pMessages;
            allMessagesReceived += allUserShort[key].oMessages;
            allPhotosSent += allUserShort[key].pPhotos;
            allPhotosReceived += allUserShort[key].oPhotos;
            removedMessages += allUserShort[key].rMessages;
            if (allUserShort[key].participants.length === 1) {
                onePersonConversations.push(key);
            } else {
                if (allUserShort[key].conversationType === "Regular") standardConversations.push(key);
                else groupConversations.push(key);
            }
        }
        let mostMessagesPerson = Object.entries(allUserShort).filter(c => c[1].conversationType === "Regular" && c[1].participants.length === 2).sort((a, b) => { return b[1].pMessages - a[1].pMessages; })[0];
        let mostMessagesGroup = Object.entries(allUserShort).filter(c => c[1].conversationType !== "Regular" && c[1].participants.length >= 2).sort((a, b) => { return b[1].pMessages - a[1].pMessages; })[0];
        let noMessages = new Array();            //Someone accepted fRequest  You accepted fRequest \/
        Object.entries(allUserShort).filter(c => c[1].pMessages === 0 || (c[1].pMessages === 1 && c[1].oMessages === 0)).forEach((u) => { return noMessages.push(u[1].title || u[0]); });
        let summary = new Object({
            allConversations: allUserShort.length,
            onePersonConversations: onePersonConversations,
            standardConversations: standardConversations,
            groupConversations: groupConversations,
            allMessagesSent: allMessagesSent,
            allPhotosSent: allPhotosSent,
            allMessagesReceived: allMessagesReceived,
            allPhotosReceived: allPhotosReceived,
            mostMessagesPerson: mostMessagesPerson,
            mostMessagesGroup: mostMessagesGroup,
            noMessagesIn: noMessages,
            removedMessages: removedMessages
        });
        fs.writeFileSync("./analysedData/overview.json", JSON.stringify(summary, null, "\t"));
        return summary;
    },
    analyseTime: async function (userData) {
        let year = new Object(), hour = new Object();
        fs.readdirSync("./jsonData/").filter(f => f != "general.json").forEach((file) => {
            let tempFile = JSON.parse(fs.readFileSync(`./jsonData/${file}`).toString());
            tempFile.messages.filter(f => userData.autofill_information_v2.FULL_NAME.includes(f.sender_name)).forEach((message) => {
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
    wordUsage: function (userData) {
        let words = new Object();
        fs.readdirSync("./jsonData/").filter(f => f != "general.json").forEach((file) => {
            let bigMessage = "";
            //number of messages is correct 3847 - 392 = 3455
            bigMessage = JSON.parse(fs.readFileSync(`./jsonData/${file}`)).messages
                .filter(m => m.content && userData.autofill_information_v2.FULL_NAME.includes(m.sender_name))
                .map(message => message.content)
                .join(" ");
            JSON.parse(fs.readFileSync(`./jsonData/${file}`)).messages.filter(m => m.content && userData.autofill_information_v2.FULL_NAME.includes(m.sender_name)).forEach(message => {
                bigMessage += " " + message.content;
                return;
            });
            bigMessage.toLowerCase().replaceAll(/\n/g, " ").split(" ").forEach(word => {
                if (!words[word]) words[word] = 1;
                else words[word] += 1;
                return
            });
            return bigMessage = "";
        });
        delete words[""]; //Probably new lines but not its not a word!
        fs.writeFileSync("./analysedData/words.json", JSON.stringify(words, null, "\t"));
        return;
    },
    reactionAnalyser: function () {
        return;
    }
}