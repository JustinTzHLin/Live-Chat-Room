import jwt from "jsonwebtoken";
const { JWT_SECRET } = process.env;
const tokenController = {};

/* verify token for registration */
tokenController.verifyParamToken = async (req, res, next) => {
  try {
    // check if token exists
    const { token } = req.body;
    if (!token) throw new Error("A token is required for registration.");
    // verify registration token
    const decoded = jwt.verify(token, JWT_SECRET);
    res.locals.result = { tokenVerified: true, decoded };
    return next();
  } catch (err) {
    console.log(err);
    // handle jwt errors
    switch (err.message) {
      case "jwt malformed":
        res.locals.result = {
          tokenVerified: false,
          errorMessage: "jwt malformed",
        };
        return next();
      case "jwt expired":
        res.locals.result = {
          tokenVerified: false,
          errorMessage: "jwt expired",
        };
        return next();
      default:
        return next({
          log: `userController.verifyParamToken error: ${err}`,
          status: 500,
          message: {
            error: "Error occurred in userController.verifyParamToken.",
          },
        });
    }
  }
};

/* issue token after authentication */
tokenController.issueToken = async (req, res, next) => {
  // skip issue token under certain conditions
  if (res.locals.skipIssueToken) {
    res.locals.skipSendOTPEmail = true;
    return next();
  }
  try {
    // issue token with user data
    const {
      id,
      userId,
      username,
      email,
      jicId,
      twoFactor,
      theme,
      timeZone,
      createdAt,
      lastActive,
    } = res.locals.result.authenticatedUser;
    const generateOtp = res.locals.generateOtp || false;
    const otpCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const loggedInToken = jwt.sign(
      {
        userId: id || userId,
        username,
        email,
        jicId,
        twoFactor,
        theme,
        timeZone,
        createdAt,
        lastActive,
        ...(generateOtp && { otpCode }),
      },
      JWT_SECRET,
      { expiresIn: generateOtp ? "10m" : "1h" }
    );
    // Store the token in HTTP-only cookie
    res.cookie(
      generateOtp ? "just.in.chat.2fa" : "just.in.chat.user",
      loggedInToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: generateOtp ? 10 * 60 * 1000 : 60 * 60 * 1000,
      }
    );
    res.locals.otpCode = otpCode;
    return next();
  } catch (err) {
    return next({
      log: `userController.issueToken error: ${err}`,
      status: 500,
      message: { error: "Error occurred in userController.issueToken." },
    });
  }
};

/* verify token for logged in */
tokenController.verifyLoggedInToken = async (req, res, next) => {
  // check if token exists
  const loggedInToken = req.cookies["just.in.chat.user"];
  if (!loggedInToken) {
    res.locals.result = {
      tokenVerified: false,
      errorMessage: "no token found",
    };
    return next();
  }
  try {
    // verify logged in token
    const decoded = jwt.verify(loggedInToken, JWT_SECRET);
    res.locals.result = { tokenVerified: true, user: decoded };
    return next();
  } catch (err) {
    console.log(err);
    // handle jwt errors
    switch (err.message) {
      case "jwt malformed":
        res.locals.result = {
          tokenVerified: false,
          errorMessage: "jwt malformed",
        };
        return next();
      case "jwt expired":
        res.locals.result = {
          tokenVerified: false,
          errorMessage: "jwt expired",
        };
        return next();
      default:
        return next({
          log: `userController.verifyLoggedInToken error: ${err}`,
          status: 500,
          message: {
            error: "Error occurred in userController.verifyLoggedInToken.",
          },
        });
    }
  }
};

/* verify login otp */
tokenController.verifyOTPCode = async (req, res, next) => {
  const { otp } = req.body;
  // check if token exists
  const otpToken = req.cookies["just.in.chat.2fa"];
  if (!otpToken) {
    res.locals.skipIssueToken = true;
    res.locals.result = {
      otpVerified: false,
      errorMessage: "no token found",
    };
    return next();
  }
  try {
    // verify login otp
    const decoded = jwt.verify(otpToken, JWT_SECRET);
    if (decoded.otpCode === otp) {
      res.locals.result = {
        otpVerified: true,
        authenticatedUser: decoded,
      };
      res.clearCookie("just.in.chat.2fa");
    } else {
      res.locals.skipIssueToken = true;
      res.locals.result = {
        otpVerified: false,
        errorMessage: "incorrect otp code",
      };
    }
    return next();
  } catch (err) {
    console.log(err);
    res.locals.skipIssueToken = true;
    // handle jwt errors
    switch (err.message) {
      case "jwt malformed":
        res.locals.result = {
          tokenVerified: false,
          errorMessage: "jwt malformed",
        };
        return next();
      case "jwt expired":
        res.locals.result = {
          tokenVerified: false,
          errorMessage: "jwt expired",
        };
        return next();
      default:
        return next({
          log: `userController.verifyOTPCode error: ${err}`,
          status: 500,
          message: {
            error: "Error occurred in userController.verifyOTPCode.",
          },
        });
    }
  }
};

/* issue token after authentication */
tokenController.issueOtherToken = async (req, res, next) => {
  if (!res.locals.result.tokenVerified) {
    res.locals.skipIssueToken = true;
    return next();
  }
  try {
    const otherToken = jwt.sign(req.body, JWT_SECRET, {
      expiresIn: "5m",
    });
    res.locals.result = {
      generatedToken: true,
      otherToken,
      authenticatedUser: res.locals.result.user,
    };
    return next();
  } catch (err) {
    return next({
      log: `tokenController.issueOtherToken error: ${err}`,
      status: 500,
      message: { error: "Error occurred in tokenController.issueOtherToken." },
    });
  }
};

/* logout */
tokenController.logout = async (req, res, next) => {
  try {
    res.clearCookie("just.in.chat.user");
    res.locals.result = { success: true };
    return next();
  } catch (err) {
    return next({
      log: `userController.logout error: ${err}`,
      status: 500,
      message: { error: "Error occurred in userController.logout." },
    });
  }
};

export default tokenController;
