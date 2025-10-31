var express = require("express");
var app = express();
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var cors = require("cors");
var multer = require("multer"),
  bodyParser = require("body-parser"),
  path = require("path");

// mongoose.connect("mongodb://localhost:27017/productDB");
var fs = require("fs");
var product = require("./model/product.js");
var user = require("./model/user.js");
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/productDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
var dir = "./uploads";
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, "./uploads");
    },
    filename: function (req, file, callback) {
      callback(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  }),

  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(/*res.end('Only images are allowed')*/ null, false);
    }
    callback(null, true);
  },
});
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));
app.use(express.static("uploads"));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: false,
  })
);

app.use("/", (req, res, next) => {
  try {
    if (
      req.path == "/login" ||
      req.path == "/register" ||
      req.path == "/" ||
      req.path == "/check-user" ||
      req.path == "/reset-password"
    ) {
      next();
    } else {
      /* decode jwt token if authorized*/
      jwt.verify(req.headers.token, "shhhhh11111", function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: "User unauthorized!",
            status: false,
          });
        }
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: "Apis",
  });
});

/* login api */
app.post("/login", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {
      user.find({ username: req.body.username }, (err, data) => {
        if (data.length > 0) {
          if (bcrypt.compareSync(req.body.password, data[0].password)) {
            checkUserAndGenerateToken(data[0], req, res);
          } else {
            res.status(400).json({
              errorMessage: "Username or password is incorrect!",
              status: false,
            });
          }
        } else {
          res.status(400).json({
            errorMessage: "Username or password is incorrect!",
            status: false,
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: "Add proper parameter first!",
        status: false,
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

/* register api */
app.post("/register", upload.any(), (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password && req.body.name) {
      user.find({ username: req.body.username }, (err, data) => {
        if (data.length == 0) {
          let profileImage = null;
          if (req.files && req.files[0]) {
            profileImage = req.files[0].filename;
          }

          let User = new user({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10),
            name: req.body.name,
            profileImage: profileImage,
          });
          User.save((err, data) => {
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false,
              });
            } else {
              res.status(200).json({
                status: true,
                title: "Registered Successfully.",
              });
            }
          });
        } else {
          res.status(400).json({
            errorMessage: `UserName ${req.body.username} Already Exist!`,
            status: false,
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage:
          "Add proper parameter first! (username, password, name required)",
        status: false,
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

function checkUserAndGenerateToken(data, req, res) {
  jwt.sign(
    { user: data.username, id: data._id },
    "shhhhh11111",
    { expiresIn: "1d" },
    (err, token) => {
      if (err) {
        res.status(400).json({
          status: false,
          errorMessage: err,
        });
      } else {
        res.json({
          message: "Login Successfully.",
          token: token,
          status: true,
          user: {
            id: data._id,
            username: data.username,
            name: data.name,
            profileImage: data.profileImage,
          },
        });
      }
    }
  );
}

/*Api to create product*/
app.post("/create-product", upload.single("product_image"), (req, res) => {
  try {
    console.log("Create product request:");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    console.log("User:", req.user);

    if (req.body.name && req.body.desc && req.body.price) {
      var obj = {
        name: req.body.name,
        desc: req.body.desc,
        price: req.body.price,
        discount: req.body.discount || 0,
        category: req.body.category || "General",
        user_id: req.user.id,
        image: req.file ? req.file.filename : null,
      };

      console.log("Product object to save:", obj);

      var Product = new product(obj);
      Product.save((err, item) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false,
          });
        } else {
          res.status(200).json({
            status: true,
            title: "Product Added successfully.",
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: "Add proper parameter first!",
        status: false,
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

/*Api to update product*/
app.put("/update-product/:id", upload.single("product_image"), (req, res) => {
  try {
    if (req.params.id && req.body.name && req.body.desc && req.body.price) {
      var updateObj = {
        name: req.body.name,
        desc: req.body.desc,
        price: req.body.price,
        discount: req.body.discount || 0,
        category: req.body.category || "General",
      };

      if (req.file) {
        updateObj.image = req.file.filename;
      }

      product.findByIdAndUpdate(
        req.params.id,
        updateObj,
        { new: true },
        (err, data) => {
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false,
            });
          } else {
            res.status(200).json({
              status: true,
              title: "Product updated successfully.",
            });
          }
        }
      );
    } else {
      res.status(400).json({
        errorMessage: "Add proper parameter first!",
        status: false,
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

/* Api to delete Product */
app.post("/delete-product", (req, res) => {
  try {
    if (req.body && req.body.id) {
      console.log("Deleting product with ID:", req.body.id);
      console.log("User ID:", req.user.id);

      // First check if product exists and belongs to user
      product.findOne(
        { _id: req.body.id, user_id: req.user.id, is_delete: false },
        (err, existingProduct) => {
          if (err) {
            console.log("Error finding product:", err);
            return res.status(400).json({
              errorMessage: "Error finding product!",
              status: false,
            });
          }

          if (!existingProduct) {
            console.log("Product not found or already deleted");
            return res.status(404).json({
              errorMessage: "Product not found!",
              status: false,
            });
          }

          // Now update the product to mark as deleted
          product.findByIdAndUpdate(
            req.body.id,
            { is_delete: true },
            { new: true },
            (updateErr, updatedData) => {
              if (updateErr) {
                console.log("Error updating product:", updateErr);
                return res.status(400).json({
                  errorMessage: "Failed to delete product!",
                  status: false,
                });
              }

              if (updatedData && updatedData.is_delete) {
                console.log("Product successfully marked as deleted");
                res.status(200).json({
                  status: true,
                  title: "Product deleted successfully.",
                });
              } else {
                console.log("Failed to mark product as deleted");
                res.status(400).json({
                  errorMessage: "Failed to delete product!",
                  status: false,
                });
              }
            }
          );
        }
      );
    } else {
      res.status(400).json({
        errorMessage: "Product ID is required!",
        status: false,
      });
    }
  } catch (e) {
    console.log("Delete product error:", e);
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

/*Api to get and search product with pagination, search, and filters*/
app.get("/get-product", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false,
      user_id: req.user.id,
    });
    // Search by name or description
    if (req.query && req.query.search) {
      query["$and"].push({
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { desc: { $regex: req.query.search, $options: "i" } },
        ],
      });
    }

    // Filter by category
    if (req.query.category && req.query.category !== "") {
      query["$and"].push({
        category: req.query.category,
      });
    }

    // Filter by price range
    if (req.query.priceMin || req.query.priceMax) {
      let priceFilter = {};
      if (req.query.priceMin) priceFilter.$gte = parseFloat(req.query.priceMin);
      if (req.query.priceMax) priceFilter.$lte = parseFloat(req.query.priceMax);
      query["$and"].push({ price: priceFilter });
    }

    var perPage = 6;
    var page = req.query.page || 1;

    // Sort options
    let sortOptions = {};
    switch (req.query.sortBy) {
      case "price_low":
        sortOptions = { price: 1 };
        break;
      case "price_high":
        sortOptions = { price: -1 };
        break;
      case "name":
        sortOptions = { name: 1 };
        break;
      default:
        sortOptions = { date: -1 }; // newest first
    }

    product
      .find(query, {
        date: 1,
        name: 1,
        id: 1,
        desc: 1,
        price: 1,
        discount: 1,
        image: 1,
        category: 1,
      })
      .sort(sortOptions)
      .skip(perPage * page - perPage)
      .limit(perPage)
      .then((data) => {
        console.log("Database returned products:", data.length, "items");

        // Debug each product's image field
        data.forEach((product, index) => {
          console.log(`Product ${index + 1}: ${product.name}`);
          console.log(`  Image: ${product.image || "No image"}`);
          console.log(`  Category: ${product.category}`);
          console.log(`  Price: ${product.price}`);
        });

        product
          .find(query)
          .countDocuments()
          .then((count) => {
            const response = {
              status: true,
              title:
                data.length > 0 ? "Products retrieved." : "No products found.",
              products: data || [],
              current_page: parseInt(page),
              total: count,
              pages: Math.ceil(count / perPage),
            };

            // Always return 200 with proper data structure
            res.status(200).json(response);
          });
      })
      .catch((err) => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false,
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

/* Api to check user exists for forgot password */
app.post("/check-user", (req, res) => {
  try {
    if (req.body && req.body.username) {
      user.findOne({ username: req.body.username }, (err, userData) => {
        if (err) {
          res.status(400).json({
            errorMessage: "Something went wrong!",
            status: false,
          });
        } else if (userData) {
          res.status(200).json({
            status: true,
            message: "User found!",
          });
        } else {
          res.status(404).json({
            errorMessage: "Username not found!",
            status: false,
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: "Username is required!",
        status: false,
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

/* Api to reset password */
app.post("/reset-password", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.newPassword) {
      // Hash the new password
      const hashedPassword = bcrypt.hashSync(req.body.newPassword, 10);

      user.findOneAndUpdate(
        { username: req.body.username },
        { password: hashedPassword },
        { new: true },
        (err, userData) => {
          if (err) {
            res.status(400).json({
              errorMessage: "Failed to update password!",
              status: false,
            });
          } else if (userData) {
            res.status(200).json({
              status: true,
              message: "Password reset successfully!",
            });
          } else {
            res.status(404).json({
              errorMessage: "Username not found!",
              status: false,
            });
          }
        }
      );
    } else {
      res.status(400).json({
        errorMessage: "Username and new password are required!",
        status: false,
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

/* Api to update user profile */
app.put("/update-profile", upload.single("profileImage"), (req, res) => {
  try {
    if (req.body && req.body.name && req.body.username) {
      const updateData = {
        name: req.body.name,
        username: req.body.username,
      };

      // If new profile image is uploaded
      if (req.file) {
        updateData.profileImage = req.file.filename;
      }

      // Check if username is already taken by another user
      user.findOne(
        {
          username: req.body.username,
          _id: { $ne: req.user.id },
        },
        (err, existingUser) => {
          if (err) {
            return res.status(400).json({
              errorMessage: "Something went wrong!",
              status: false,
            });
          }

          if (existingUser) {
            return res.status(400).json({
              errorMessage: "Username already exists!",
              status: false,
            });
          }

          // Update the user profile
          user.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true },
            (updateErr, updatedUser) => {
              if (updateErr) {
                res.status(400).json({
                  errorMessage: "Failed to update profile!",
                  status: false,
                });
              } else if (updatedUser) {
                res.status(200).json({
                  status: true,
                  message: "Profile updated successfully!",
                  user: {
                    id: updatedUser._id,
                    username: updatedUser.username,
                    name: updatedUser.name,
                    profileImage: updatedUser.profileImage,
                  },
                });
              } else {
                res.status(404).json({
                  errorMessage: "User not found!",
                  status: false,
                });
              }
            }
          );
        }
      );
    } else {
      res.status(400).json({
        errorMessage: "Name and username are required!",
        status: false,
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

/* Api to get user info */
app.get("/user-info", (req, res) => {
  try {
    user.findById(req.user.id, { password: 0 }, (err, userData) => {
      if (err) {
        res.status(400).json({
          errorMessage: "User not found!",
          status: false,
        });
      } else {
        res.status(200).json({
          status: true,
          user: {
            id: userData._id,
            username: userData.username,
            name: userData.name,
            profileImage: userData.profileImage,
          },
        });
      }
    });
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

app.listen(2000, () => {
  console.log("Server is Runing On port 2000");
});
