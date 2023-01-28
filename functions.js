const fs = require("fs");
const user = require("./userClass");
module.exports = {
    getRecipients: function (dirRecipient, user) {
        let selfMessages = new Array(); // Self conversation, conversations with all users deleted, groups that were left by everyone.
        let conversations = new Array(); // Normal conversations, 2 people groups, conversations with pages.
        let groupConversations = new Array(); // Groups
        for (let i = 0; i < dirRecipient.length; i++) {
            let jsonFile;
            if (fs.existsSync(`./messages/inbox/${dirRecipient[i]}/message_1.json`)) jsonFile = JSON.parse(fs.readFileSync(`./messages/inbox/${dirRecipient[i]}/message_1.json`).toString());
            else jsonFile = JSON.parse(fs.readFileSync(`./messages/archived_threads/${dirRecipient[i]}/message_1.json`).toString());
            let tempParticipants = new Array();
            if (jsonFile.participants.length === 0 || (jsonFile.participants.length === 1 && user.includes(jsonFile.participants[0].name))) {
                selfMessages.push({ participants: new Array(this.decode(jsonFile.participants[0]?.name)), filePath: jsonFile.thread_path, title: this.decode(jsonFile.title), threadType: jsonFile.thread_type });
            } else {
                for (let j = 0; j < jsonFile.participants.length; j++) {
                    tempParticipants.push(this.decode(jsonFile.participants[j].name));
                }
                if (jsonFile.participants.length === 2) conversations.push({ participants: tempParticipants, filePath: jsonFile.thread_path, title: this.decode(jsonFile.title), threadType: jsonFile.thread_type });
                else groupConversations.push({ participants: tempParticipants, filePath: jsonFile.thread_path, title: this.decode(jsonFile.title), threadType: jsonFile.thread_type });
            }
            delete tempParticipants;
        }
        return new Object({ selfMessages: selfMessages, conversations: conversations, groupConversations: groupConversations });
    },
    decode: (content) => {
        try {
            return decodeURIComponent(decodeURI(escape(content)));
        } catch (err) {
            return decodeURIComponent(decodeURIComponent(escape(escape(content))));
        }
    },
    joinFiles: function (participants) {
        Object.keys(participants).forEach(typeOfGroup => {
            participants[typeOfGroup].forEach((groupElement) => {
                let entireConversation = new Object();
                entireConversation.participants = new Array();
                entireConversation.messages = new Array();
                fs.readdirSync(`./messages/${groupElement.filePath}/`).filter(obj => obj.endsWith(".json")).forEach((file) => {
                    let fileContent = JSON.parse(fs.readFileSync(`./messages/${groupElement.filePath}/${file}`).toString() || JSON.parse(fs.readFileSync(`./messages/${groupElement.filePath}/${file}`).toString()));
                    fileContent.participants.forEach((participant) => {
                        if (!entireConversation.participants.includes(participant.name)) entireConversation.participants.push(participant.name);
                    });
                    entireConversation.title = fileContent.title;
                    entireConversation.thread_type = (fileContent.participants.length ===2 ? "Regular" : "Group" );
                    entireConversation.messages = entireConversation.messages.concat(fileContent.messages);
                    entireConversation.thread_path = fileContent.thread_path;
                    return;
                });
                this.fixContent(entireConversation);
                entireConversation.title = this.decode(entireConversation.title);
                fs.writeFileSync(`./jsonData/${groupElement.filePath.split("/")[1]}.json`, JSON.stringify(entireConversation, null, "\t"));
                return;
            });
            return;
        });
        return;
    },
    fixContent: async function (entireConversation) {
        //Making all the encoding familiar to human eye
        for (let i = 0; i < entireConversation.participants.length; i++) {
            entireConversation.participants[i] = this.decode(entireConversation.participants[i]);
        }
        entireConversation.messages.forEach((message) => {
            message.sender_name = this.decode(message.sender_name);
            if (message.content) message.content = this.decode(message.content);
            if (message.reactions) message.reactions.forEach(reaction => {
                reaction.actor = this.decode(reaction.actor);
                reaction.reaction = this.decode(reaction.reaction);
            });
        });
    },
    getTypeDescription: function () {
        let conversationTypes = new Object();
        conversationTypes.selfMessages = "One person conversations:";
        conversationTypes.conversations = "Two people conversations(you and other person):";
        conversationTypes.groupConversations = "Groups:";
        return conversationTypes;
    }
}