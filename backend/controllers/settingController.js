import bcrypt from "bcrypt";
import User from "../models/usersModel.js";
const SALT_WORK_FACTOR = 10;
const settingController = {};

/* change password */
settingController.changePassword = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) {
    res.locals.skipIssueToken = true;
    return next();
  }
  const { userId } = res.locals.result.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (isPasswordValid) {
      const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );
      res.locals.result = {
        passwordChanged: true,
        authenticatedUser: updatedUser,
      };
      return next();
    } else {
      res.locals.result = {
        passwordChanged: false,
        errorMessage: "incorrect password",
      };
      res.locals.skipIssueToken = true;
      return next();
    }
  } catch (err) {
    return next({
      log: `settingController.changePassword error: ${err}`,
      status: 500,
      message: {
        error: "Error occurred in settingController.changePassword.",
      },
    });
  }
};

// change 2FA setting
settingController.change2FA = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) {
    res.locals.skipIssueToken = true;
    return next();
  }
  const { userId } = res.locals.result.user;
  const { twoFactor } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { twoFactor },
      { new: true }
    );
    res.locals.result = {
      twoFactorChanged: true,
      authenticatedUser: updatedUser,
    };
    return next();
  } catch (err) {
    return next({
      log: `settingController.change2FA error: ${err}`,
      status: 500,
      message: {
        error: "Error occurred in settingController.change2FA.",
      },
    });
  }
};

// change time zone setting
settingController.changeTimeZone = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) {
    res.locals.skipIssueToken = true;
    return next();
  }
  const { userId } = res.locals.result.user;
  const { timeZone } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { timeZone },
      { new: true }
    );
    res.locals.result = {
      timeZoneChanged: true,
      authenticatedUser: updatedUser,
    };
    return next();
  } catch (err) {
    return next({
      log: `settingController.changeTimeZone error: ${err}`,
      status: 500,
      message: {
        error: "Error occurred in settingController.changeTimeZone.",
      },
    });
  }
};

// change theme setting
settingController.changeTheme = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) {
    res.locals.skipIssueToken = true;
    return next();
  }
  const { userId } = res.locals.result.user;
  const { theme } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { theme },
      { new: true }
    );
    res.locals.result = {
      themeChanged: true,
      authenticatedUser: updatedUser,
    };
    return next();
  } catch (err) {
    return next({
      log: `settingController.changeTheme error: ${err}`,
      status: 500,
      message: {
        error: "Error occurred in settingController.changeTheme.",
      },
    });
  }
};

// change username
settingController.updateUsername = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) {
    res.locals.skipIssueToken = true;
    return next();
  }
  const { userId } = res.locals.result.user;
  const { newUsername } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: newUsername },
      { new: true }
    );
    res.locals.result = {
      usernameChanged: true,
      authenticatedUser: updatedUser,
    };
    return next();
  } catch (err) {
    return next({
      log: `settingController.updateUsername error: ${err}`,
      status: 500,
      message: {
        error: "Error occurred in settingController.updateUsername.",
      },
    });
  }
};

// change JIC Id
settingController.updateJicId = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) {
    res.locals.skipIssueToken = true;
    return next();
  }
  const { userId } = res.locals.result.user;
  const { newJicId } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { jicId: newJicId },
      { new: true }
    );
    res.locals.result = {
      jicIdChanged: true,
      authenticatedUser: updatedUser,
    };
    return next();
  } catch (err) {
    return next({
      log: `settingController.updateJicId error: ${err}`,
      status: 500,
      message: {
        error: "Error occurred in settingController.updateJicId.",
      },
    });
  }
};

export default settingController;
