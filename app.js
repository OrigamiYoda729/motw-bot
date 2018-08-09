const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
const talkedRecently = new Set();

bot.commands = new Discord.Collection();

let memeData = require('./memedata.json');

bot.on("ready", async () => {
  console.log("Bot Online!");
  console.log(talkedRecently);
  bot.user.setActivity("with Memes (DM me)");
});

bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type !== "dm") return;

  if (talkedRecently.has(message.author.id)) {
      message.channel.send("You can only enter a command every 30 seconds.");
      return;
  } else {
      talkedRecently.add(message.author.id);
      setTimeout(() => {
        talkedRecently.delete(message.author.id);
      }, 30000);
  }

  let prefix = "/";
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

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
      "array": memeData["array"].concat(imageData),
      "length": (memeData["array"].length + 1)
    };

     fs.writeFile("./memedata.json", JSON.stringify(push_memeData), (err) => {
       if (err) console.log(err)
     });

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

      if (!Number(args[0]) || Number(args[0]) > Number(memeData["length"])) {
        return message.channel.send("Please enter a valid meme number. For example: `/vote 1`.")
      }

      let push_memeData = memeData;

      if (memeData["array"][Number(args[0] - 1)]["voters"].indexOf(message.author.id.toString()) === -1) {

        push_memeData["array"][Number(args[0] - 1)]["total_votes"] += 1;
        push_memeData["array"][Number(args[0] - 1)]["voters"].push(message.author.id.toString());

        fs.writeFile("./memedata.json", JSON.stringify(push_memeData), (err) => {
          if (err) console.log(err)
        });

        return message.channel.send("Voted for Meme #" + args[0].toString());

      } else {
        console.log(memeData["array"][Number(args[0] - 1)]["voters"].indexOf(message.author.id.toString()));
        return message.channel.send("You cannot vote for the same meme twice. To cancel a vote for a meme that you have already voted for, use `/cancelvote {#}`.")
      }

  } else
  if (cmd === `${prefix}cancelvote`) {

        if (args.length !== 1) {
          return message.channel.send("This command supports exactly 1 argument. Try: `/cancelvote {number}`.");
        }

        if (!Number(args[0]) || Number(args[0]) > Number(memeData["length"])) {
          return message.channel.send("Please enter a valid meme number. For example: `/cancelvote 1`.")
        }

    let push_memeData = memeData;

    if (memeData["array"][Number(args[0] - 1)]["voters"].indexOf(message.author.id.toString()) !== -1) {

      push_memeData["array"][Number(args[0] - 1)]["total_votes"] += -1;
      push_memeData["array"][Number(args[0] - 1)]["voters"].splice(memeData["array"][Number(args[0] - 1)]["voters"].indexOf(message.author.id.toString()), 1);

      fs.writeFile("./memedata.json", JSON.stringify(push_memeData), (err) => {
        if (err) console.log(err)
      });

      return message.channel.send("Canceled Vote for Meme #" + args[0].toString());

    } else {
      console.log(memeData["array"][Number(args[0] - 1)]["voters"].indexOf(message.author.id.toString()));
      return message.channel.send("You cannot cancel a vote for a meme you haven't voted for already, silly.")
    }

  } else
  if (cmd === `${prefix}report`) {

    if (args.length !== 1) {
      return message.channel.send("This command supports exactly 1 argument. Try: `/cancelvote {number}`.");
    }

    if (!Number(args[0]) || Number(args[0]) > Number(memeData["length"])) {
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

  } else
  if (cmd === `${prefix}reset`) {

    if (message.author.id.toString() === "241658711431577601") {

      let winnerId = 0;
      let d = new Date();

      for (i = 1; i < Number(memeData["length"]); i++) {
        if (Number(memeData["array"][i]["total_votes"]) < Number(memeData["array"][winnerId]["total_votes"])) {
          winnerId += 1;
        }
      }

      bot.channels.get("476815843968417813").send({
        "embed": {
          "author": {
            "name": `Week of ${d.getMonth()}/${d.getDate()}/${(d.getFullYear().toString())[2]}${(d.getFullYear().toString())[3]}`
          },
          "description": `Creator: ${bot.users.get(memeData["array"][winnerId]["creator"]).username}`,
          "image": {
            "url": `${memeData["array"][winnerId]["url"]}`
          }
        }
      });

      bot.channels.get("442372654905950218").send("@eveyone - The #meme-of-the-week competition has been reset for this week! Visit #the-winnners to see this week's winner!");

      let fetched = await bot.channels.get("442373939222544384").fetchMessages();
      bot.channels.get("442373939222544384").bulkDelete(fetched);

      let push_memeData = {
        "array": [],
        "length": 0
      }

      fs.writeFile("./memedata.json", JSON.stringify(push_memeData), (err) => {
        if (err) console.log(err)
      });

    }

    return message.channel.send("Resetted the Meme of the Week competition!")

  } else {
    message.channel.send("Try sending me a command. Go to the `#competition-rules` channel on the server for more info.")
  }

});

bot.login(process.env.BOT_TOKEN);
