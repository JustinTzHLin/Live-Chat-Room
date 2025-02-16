import mongoose from "mongoose";
import User from "../models/usersModel.js";
import FriendRequest from "../models/friendRequestsModel.js";

const friendRequestController = {};

/* send friend request */
friendRequestController.sendFriendRequest = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) return next();
  const { senderId, receiverId } = req.body;
  try {
    let friendRequest;
    const searchFriendRequest = await FriendRequest.findOne({
      senderId,
      receiverId,
    });
    if (searchFriendRequest) {
      if (searchFriendRequest.status === "pending") {
        res.locals.result = {
          friendRequestSent: false,
          errorMessage: "request already sent",
        };
        return next();
      } else if (
        searchFriendRequest.status === "rejected" ||
        searchFriendRequest.status === "canceled"
      ) {
        friendRequest = await FriendRequest.findOneAndUpdate(
          { senderId, receiverId },
          { status: "pending", updatedAt: Date.now() },
          { new: true }
        );
      }
    } else {
      friendRequest = await FriendRequest.insertOne({
        senderId,
        receiverId,
      });
    }
    if (friendRequest)
      res.locals.result = {
        friendRequestSent: true,
        newFriendRequest: friendRequest,
      };
    return next();
  } catch (err) {
    return next({
      log: `userController.sendFriendRequest error: ${err}`,
      status: 500,
      message: {
        error: "Error occurred in userController.sendFriendRequest.",
      },
    });
  }
};

/* fetch friend requests */
friendRequestController.fetchFriendRequests = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) return next();
  const { userId } = res.locals.result.user;
  try {
    const sent = [];
    const received = [];
    const sentFriendRequests = await FriendRequest.find({
      senderId: mongoose.Types.ObjectId.createFromHexString(userId),
      status: "pending",
    });
    const receivedFriendRequests = await FriendRequest.find({
      receiverId: mongoose.Types.ObjectId.createFromHexString(userId),
      status: "pending",
    });
    for (const request of sentFriendRequests) {
      const receiver = await User.findById(request.receiverId);
      sent.push({
        id: request._id,
        receiver: {
          receiverId: receiver._id,
          username: receiver.username,
          email: receiver.email,
        },
        createdAt: request.createdAt,
      });
    }
    for (const request of receivedFriendRequests) {
      const sender = await User.findById(request.senderId);
      received.push({
        id: request._id,
        sender: {
          senderId: sender._id,
          username: sender.username,
          email: sender.email,
        },
        createdAt: request.createdAt,
      });
    }
    res.locals.result = {
      friendRequestsFetched: true,
      friendRequests: {
        sent,
        received,
      },
    };
    return next();
  } catch (err) {
    return next({
      log: `userController.fetchFriendRequests error: ${err}`,
      status: 500,
      message: {
        error: "Error occurred in userController.fetchFriendRequests.",
      },
    });
  }
};

/* handle friend request actions */
friendRequestController.friendRequestAction = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) return next();
  const { requestId, action } = req.body;
  try {
    let friendRequest;
    let senderContactsUpdate;
    let receiverContactsUpdate;
    if (action === "accept") {
      const acceptedFriendRequest = await FriendRequest.findByIdAndUpdate(
        requestId,
        { status: "accepted", updatedAt: Date.now() },
        { new: true }
      );
      if (acceptedFriendRequest) {
        senderContactsUpdate = await User.findByIdAndUpdate(
          acceptedFriendRequest.senderId,
          { $push: { contacts: acceptedFriendRequest.receiverId } },
          { new: true }
        );
        receiverContactsUpdate = await User.findByIdAndUpdate(
          acceptedFriendRequest.receiverId,
          { $push: { contacts: acceptedFriendRequest.senderId } },
          { new: true }
        );
        friendRequest = {
          _id: acceptedFriendRequest._id,
          senderId: acceptedFriendRequest.senderId,
          receiverId: acceptedFriendRequest.receiverId,
          sender: {
            id: senderContactsUpdate._id,
            username: senderContactsUpdate.username,
            email: senderContactsUpdate.email,
          },
          receiver: {
            id: receiverContactsUpdate._id,
            username: receiverContactsUpdate.username,
            email: receiverContactsUpdate.email,
          },
        };
      }
    } else if (action === "reject") {
      friendRequest = await FriendRequest.findByIdAndUpdate(
        requestId,
        { status: "rejected", updatedAt: Date.now() },
        { new: true }
      );
    } else if (action === "cancel") {
      friendRequest = await FriendRequest.findByIdAndUpdate(
        requestId,
        { status: "canceled", updatedAt: Date.now() },
        { new: true }
      );
    }
    if (friendRequest || (senderContactsUpdate && receiverContactsUpdate))
      res.locals.result = {
        friendRequestAction: true,
        updatedFriendRequest: friendRequest,
      };
    return next();
  } catch (err) {
    return next({
      log: `userController.friendRequestAction error: ${err}`,
      status: 500,
      message: {
        error: "Error occurred in userController.friendRequestAction.",
      },
    });
  }
};

export default friendRequestController;
