import mongoose from "mongoose";
import User from "../models/usersModel.js";
import Conversation from "../models/conversationsModel.js";
import Message from "../models/messagesModel.js";

const dataController = {};

dataController.fetchUserFriends = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.locals.result = { friends: [] };
      for (const friendId of user.contacts) {
        const friend = await User.findById(friendId);
        if (friend) {
          const friendInfo = {
            id: friend._id,
            email: friend.email,
            username: friend.username,
            profilePic: friend.profilePic,
          };
          res.locals.result.friends.push(friendInfo);
        }
      }
      return next();
    } else {
      res.locals.result = { success: false, errorMessage: "user not found" };
      res.locals.skipfetchUserChats = true;
      return next();
    }
  } catch (err) {
    return next({
      log: `dataController.fetchUserFriends error: ${err}`,
      status: 500,
      message: { error: "Error occurred in dataController.fetchUserFriends." },
    });
  }
};

dataController.fetchUserChats = async (req, res, next) => {
  if (res.locals.skipfetchUserChats) return next();
  const { userId } = req.body;
  const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
  try {
    const conversations = await Conversation.find({
      participantIDs: userObjectId,
    });
    res.locals.result.conversations = {};
    const tempUsers = {};
    for (const conversation of conversations) {
      res.locals.result.conversations[conversation._id] = {
        type: conversation.type,
        roomName: conversation.roomName,
        participantIDs: conversation.participantIDs,
        messages: [],
        conversationId: conversation._id,
      };
      const messages = await Message.find({ conversationId: conversation._id });
      for (const message of messages) {
        let senderName = "";
        if (message.senderId in tempUsers) {
          senderName = tempUsers[message.senderId];
        } else {
          const user = await User.findById(message.senderId);
          senderName = user.username;
          tempUsers[message.senderId] = user.username;
        }
        res.locals.result.conversations[message.conversationId].messages.push({
          senderId: message.senderId,
          senderName,
          content: message.content,
          timestamp: message.timestamp,
          readBy: message.readBy,
          status: message.status,
          conversationId: message.conversationId,
        });
      }
      res.locals.result.conversations[conversation._id].messages.sort(
        (a, b) => a.timestamp - b.timestamp
      );
    }
    return next();
  } catch (err) {
    return next({
      log: `dataController.fetchUserChats error: ${err}`,
      status: 500,
      message: { error: "Error occurred in dataController.fetchUserChats." },
    });
  }
};

dataController.fetchProfilePircture = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) return next();
  try {
    const { userId } = res.locals.result.user;
    const profilePicObj = await User.findById(userId).select("profilePic");
    res.locals.result.user.profilePic = profilePicObj.profilePic || null;
    return next();
  } catch (err) {
    return next({
      log: `dataController.fetchProfilePircture error: ${err}`,
      status: 500,
      message: {
        error: "Error occurred in dataController.fetchProfilePircture.",
      },
    });
  }
};

export default dataController;
