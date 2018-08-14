const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
const talkedRecently = new Set();
const memeData = new Set([{array: [], length: 0}]);

bot.commands = new Discord.Collection();

bot.on("ready", async () => {
  console.log("Bot Online!");
  console.log(talkedRecently);
  bot.user.setActivity("with Memes (DM me)");
});

bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type !== "dm") return;
  console.log(talkedRecently);

  if (talkedRecently.has(message.author.id)) {
      message.channel.send("You can only enter a command every 20 seconds.");
      return;
  } else {
      talkedRecently.add(message.author.id);
      setTimeout(() => {
        talkedRecently.delete(message.author.id);
      }, 20000);
  }

  let prefix = "/";
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  console.log(memeData);

  if (cmd === `${prefix}submit`){

    if (args.length !== 1) {
      return message.channel.send('This command supports exactly 1 argument. Try: `/submit {imageURL}`.');
    }

    let imageData = [{
      "url": args[0],
      "creator": message.author.id,
      "voters": [],
      "total_votes": 0
    }];

    let push_memeData = {
      "array": memeData[Symbol.iterator]().next().value["array"].concat(imageData),
      "length": (memeData[Symbol.iterator]().next().value["array"].length + 1)
    };

    console.log(push_memeData);
    memeData.clear();
    memeData.add(push_memeData);

     bot.channels.get("442373939222544384").send({
     "embed": {
       "description": "Use `/vote " + push_memeData["length"].toString() + "` in DMs to vote for this meme.",
       "image": {
         "url": `${args}`
       }
     }

   });

   return message.channel.send("Submitted your meme!");

 } else
  if (cmd === `${prefix}vote`) {

      if (args.length !== 1) {
        return message.channel.send("This command supports exactly 1 argument. Try: `/vote {number}`.");
      }

      if (!Number(args[0]) || Number(args[0]) > Number(memeData[Symbol.iterator]().next().value["length"])) {
        return message.channel.send("Please enter a valid meme number. For example: `/vote 1`.")
      }

      let push_memeData = memeData[Symbol.iterator]().next().value;

      if (memeData[Symbol.iterator]().next().value["array"][Number(args[0] - 1)]["voters"].indexOf(message.author.id.toString()) === -1) {

        push_memeData["array"][Number(args[0] - 1)]["total_votes"] += 1;
        push_memeData["array"][Number(args[0] - 1)]["voters"].push(message.author.id.toString());

        console.log(push_memeData);
        memeData.clear();
        memeData.add(push_memeData);

        return message.channel.send("Voted for Meme #" + args[0].toString());

      } else {
        console.log(memeData[Symbol.iterator]().next().value["array"][Number(args[0] - 1)]["voters"].indexOf(message.author.id.toString()));
        return message.channel.send("You cannot vote for the same meme twice. To cancel a vote for a meme that you have already voted for, use `/cancelvote {#}`.")
      }

  } else
  if (cmd === `${prefix}cancelvote`) {

        if (args.length !== 1) {
          return message.channel.send("This command supports exactly 1 argument. Try: `/cancelvote {number}`.");
        }

        if (!Number(args[0]) || Number(args[0]) > Number(memeData[Symbol.iterator]().next().value["length"])) {
          return message.channel.send("Please enter a valid meme number. For example: `/cancelvote 1`.")
        }

    let push_memeData = memeData[Symbol.iterator]().next().value;

    if (memeData[Symbol.iterator]().next().value["array"][Number(args[0] - 1)]["voters"].indexOf(message.author.id.toString()) !== -1) {

      push_memeData["array"][Number(args[0] - 1)]["total_votes"] += -1;
      push_memeData["array"][Number(args[0] - 1)]["voters"].splice(memeData[Symbol.iterator]().next().value["array"][Number(args[0] - 1)]["voters"].indexOf(message.author.id.toString()), 1);

      console.log(push_memeData);
      memeData.clear();
      memeData.add(push_memeData);

      return message.channel.send("Canceled Vote for Meme #" + args[0].toString());

    } else {
      console.log(memeData[Symbol.iterator]().next().value["array"][Number(args[0] - 1)]["voters"].indexOf(message.author.id.toString()));
      return message.channel.send("You cannot cancel a vote for a meme you haven't voted for already, silly.")
    }

  } else
  if (cmd === `${prefix}report`) {

    if (args.length !== 1) {
      return message.channel.send("This command supports exactly 1 argument. Try: `/cancelvote {number}`.");
    }

    if (!Number(args[0]) || Number(args[0]) > Number(memeData[Symbol.iterator]().next().value["length"])) {
      return message.channel.send("Please enter a valid meme number. For example: `/cancelvote 1`.")
    }

    bot.users.get("241658711431577601").send(`<@!${message.author.id}> reported meme #${args[0]}.`);
    bot.users.get("336676576320290836").send(`<@!${message.author.id}> reported meme #${args[0]}.`);

    return message.channel.send("Reported meme to server admins.");

  } else
  if (cmd === `${prefix}help`) {
    message.channel.send("Go to the `#competition-rules` channel on the server for information on commands and usage.")
  } else
  if (cmd ===  `${prefix}bug`) {

    bot.users.get("241658711431577601").send(`<@!${message.author.id}> reported a bug: \`\`\`${message.content.split("/bug ")[1]}\`\`\``);

    return message.channel.send("Reported bug to server admins.");

  } else {
    message.channel.send("Try sending me a command. Go to the `#competition-rules` channel on the server for more info.")
  }

});

setInterval(function() {

  let d2 = new Date();

  if (Number(d2.getDay()) === 3 && Number(d2.getHours()) === 16 && Number(d2.getMinutes()) === 20) {

    let winnerId = 0;
    let d = new Date();

    for (i = 1; i < Number(memeData[Symbol.iterator]().next().value["length"]); i++) {
      if (Number(memeData[Symbol.iterator]().next().value["array"][i]["total_votes"]) < Number(memeData[Symbol.iterator]().next().value["array"][winnerId]["total_votes"])) {
        winnerId += 1;
      }
    }

    bot.channels.get("476815843968417813").send({
      "embed": {
        "author": {
          "name": `Week of ${d.getMonth()}/${d.getDate()}/${(d.getFullYear().toString())[2]}${(d.getFullYear().toString())[3]}`
        },
        "description": `Creator: ${bot.users.get(memeData[Symbol.iterator]().next().value["array"][winnerId]["creator"]).username}`,
        "image": {
          "url": `${memeData[Symbol.iterator]().next().value["array"][winnerId]["url"]}`
        }
      }
    });

    bot.channels.get("442372654905950218").send("@everyone - The #meme-of-the-week competition has been reset for this week! Visit #the-winnners to see this week's winner!");

    let fetched = await bot.channels.get("442373939222544384").fetchMessages();
    bot.channels.get("442373939222544384").bulkDelete(fetched);

    let push_memeData = {
      "array": [],
      "length": 0
    }

    console.log(push_memeData);
    memeData.clear();
    memeData.add(push_memeData);

  }

}, 60000)

bot.login('NDc2NDU0OTgzMTkwMDUyODY0.Dkt4Ng.Ho0uaTnTY9qNXqc8d_Y_JR2SH2Q');
