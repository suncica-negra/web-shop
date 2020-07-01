const express = require("express");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const Handlebars = require('handlebars')
const {
  allowInsecurePrototypeAccess
} = require('@handlebars/allow-prototype-access')
const expressHbs = require("express-handlebars");
const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const request = require("request");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo")(session);

const app = express();

app.engine(".hbs", expressHbs({
  defaultLayout: "layout",
  extname: ".hbs",
  handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set("view engine", ".hbs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.use(session({
  secret: "Naša mala tajna.",
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  cookie: {
    maxAge: 120 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals.session = req.session;
  res.locals.login = req.isAuthenticated();
  next();
});

mongoose.connect("mongodb+srv://dea:test-123@cluster0.0fmas.mongodb.net/web-shopDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  password: String
});

const productSchema = new mongoose.Schema({
  action2: Boolean,
  price2: Number,
  action3: Boolean,
  price3: Number,
  bannerMessage: String,
  identifier: Number,
  name: String,
  price: Number,
  link: String,
  description: String
});

const orderSchema = new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  basket: {
    type: Object,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cardHolderName: {
    type: String,
    required: true
  },
  creditCardNumber: {
    type: Number,
    required: true
  },
  expMonth: {
    type: Number,
    required: true
  },
  expYear: {
    type: Number,
    required: true
  },
  cvc: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  paidPrice: {
    type: Number,
    required: true
  }
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(uniqueValidator);

const User = new mongoose.model("User", userSchema);
const Product = new mongoose.model("Product", productSchema);
const Order = new mongoose.model("Order", orderSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function Basket(oldBasket) {
  this.items = oldBasket.items || {};
  this.totalQty = oldBasket.totalQty || 0;
  this.totalPrice = oldBasket.totalPrice || 0;

  this.add = function (item, id) {
    var storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = {
        item: item,
        qty: 0,
        price: 0
      };
    }
    var identifier = storedItem.item.identifier;
    var modulo3 = (storedItem.qty + 1) % identifier;
    var modulo2 = (storedItem.qty + 1) % identifier;

    if (item.action3 === true) {
      if (storedItem.qty >= (identifier - 1) & modulo3 === 0) {
        storedItem.qty++;
        storedItem.price = storedItem.item.price3 * storedItem.qty;
        this.totalQty++;
        var a = this.totalPrice - (storedItem.item.price * (identifier - 1));
        this.totalPrice = a + (storedItem.item.price3 * identifier);
      } else if (storedItem.qty >= identifier & modulo3 != 0) {
        storedItem.qty++;
        storedItem.price += storedItem.item.price;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
      } else {
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
      }
    } else if (item.action2 === true) {
      if (storedItem.qty >= (identifier - 1) & modulo2 === 0) {
        storedItem.qty++;
        storedItem.price = storedItem.item.price2 * storedItem.qty;
        this.totalQty++;
        var a = this.totalPrice - (storedItem.item.price * (identifier - 1));
        this.totalPrice = a + (storedItem.item.price2 * identifier);
      } else {
        storedItem.qty++;
        storedItem.price = (storedItem.item.price2 * (storedItem.qty - 1)) + storedItem.item.price;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
      }
    } else {
      storedItem.qty++;
      storedItem.price = storedItem.item.price * storedItem.qty;
      this.totalQty++;
      this.totalPrice += storedItem.item.price;
    }
  };

  this.reduceByOne = function (id) {
    var identifier = this.items[id].item.identifier;

    if (this.items[id].item.action3 === true) {
      var qty = this.items[id].price;
      this.items[id].qty--;
      var x = this.items[id].qty / identifier;
      var x1 = Math.trunc(x);
      var x2 = x1 * identifier;
      var y = this.items[id].qty - x2;
      this.items[id].price = (this.items[id].item.price3 * x2) + (this.items[id].item.price * y);
      this.totalQty--;
      this.totalPrice -= (qty - this.items[id].price);
    } else if (this.items[id].item.action2 === true) {
      var qty = this.items[id].price;
      this.items[id].qty--;
      var x = this.items[id].qty / identifier;
      var x1 = Math.trunc(x);
      var x2 = x1 * identifier;
      var y = this.items[id].qty - x2;
      this.items[id].price = (this.items[id].item.price2 * x2) + (this.items[id].item.price * y);
      this.totalQty--;
      this.totalPrice -= (qty - this.items[id].price);
    } else {
      this.items[id].qty--;
      this.items[id].price -= this.items[id].item.price;
      this.totalQty--;
      this.totalPrice -= this.items[id].item.price;
    }

    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
  };

  this.increaseByOne = function (id) {
    var identifier = this.items[id].item.identifier;

    if (this.items[id].item.action3 === true) {
      var qty = this.items[id].price;
      this.items[id].qty++;
      var x = this.items[id].qty / identifier;
      var x1 = Math.trunc(x);
      var x2 = x1 * identifier; //broj po povlašetnoj cijeni
      var y = this.items[id].qty - x2; //broj po normalnoj cijeni

      this.items[id].price = (this.items[id].item.price3 * x2) + (this.items[id].item.price * y);
      this.totalQty++;
      this.totalPrice = (this.totalPrice - qty) + this.items[id].price;
    } else if (this.items[id].item.action2 === true) {
      var qty = this.items[id].price;
      this.items[id].qty++;
      var x = this.items[id].qty / identifier;
      var x1 = Math.trunc(x);
      var x2 = x1 * identifier;
      var y = this.items[id].qty - x2;

      this.items[id].price = (this.items[id].item.price2 * x2) + (this.items[id].item.price * y);
      this.totalQty++;
      this.totalPrice = (this.totalPrice - qty) + this.items[id].price;
    } else {
      this.items[id].qty++;
      this.items[id].price += this.items[id].item.price;
      this.totalQty++;
      this.totalPrice += this.items[id].item.price;
    }
  };

  this.removeItem = function (id) {
    this.totalQty -= this.items[id].qty;
    this.totalPrice -= this.items[id].price;
    delete this.items[id];
  };

  this.generateArray = function () {
    var arr = [];
    for (var id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };
};

app.get("/", async function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
  } else {
    var korisnik = req.session.passport.user;
  }

  if (!req.session.basket) {
    var totalQty = "";
  } else {
    totalQty = req.session.basket.totalQty;
  }

  Product.find({}).sort({
    price: 1
  }).exec(function (err, products) {

    res.render("index", {
      korisnik: korisnik,
      products: products,
      totalQty: totalQty
    });
  });
});

app.get("/my-orders", isLoggedIn, function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
  } else {
    var korisnik = req.session.passport.user;
  }

  if (!req.session.basket) {
    var totalQty = "";
  } else {
    totalQty = req.session.basket.totalQty;
  }

  Order.find({
    username: req.user
  }).sort({
    date: -1
  }).exec(function (err, orders) {
    if (err) {
      console.log(err);
      return res.write("Error!");
    } else {
      var basket;
      orders.forEach(function (order) {
        basket = new Basket(order.basket);
        order.items = basket.generateArray();
      });
      res.render("my-orders", {
        korisnik: korisnik,
        totalQty: totalQty,
        orders: orders
      });
    }
  });
});

app.get("/register", notLoggedIn, function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
  } else {
    var korisnik = req.session.passport.user;
  }

  if (!req.session.basket) {
    var totalQty = "";
  } else {
    totalQty = req.session.basket.totalQty;
  }

  res.render("register", {
    korisnik: korisnik,
    totalQty: totalQty
  });
});

app.post("/register", notLoggedIn, function (req, res) {
  const newUser = new User({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });

  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});

app.get("/login", notLoggedIn, function (req, res) {
  if (!req.session.basket) {
    var korisnik = "";
    var totalQty = "";

    res.render("login", {
      korisnik: korisnik,
      totalQty: totalQty
    });

  } else {
    var korisnik = "";
    var totalQty = req.session.basket.totalQty;

    res.render("login", {
      korisnik: korisnik,
      totalQty: totalQty
    });
  }
});

app.post("/login", notLoggedIn, function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function (err) {
    if (err) {
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function () {
        var korisnik = req.session.passport.user;
        res.redirect("/");
      });
    }
  });
});

app.get("/basket", function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
  } else {
    var korisnik = req.session.passport.user;
  }

  if (!req.session.basket) {
    var totalQty = "";
    res.render("basket", {
      totalQty: totalQty,
      korisnik: korisnik
    });
  } else {
    var totalQty = req.session.basket.totalQty;
    var basket = new Basket(req.session.basket);
    var items = basket.generateArray();
    var totalPrice = basket.totalPrice.toFixed(2);

    res.render("basket", {
      totalQty: totalQty,
      basket: basket,
      korisnik: korisnik,
      totalPrice: totalPrice,
      items: items
    });
  }
});

app.post("/checkout", isLoggedIn, function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
  } else {
    var korisnik = req.session.passport.user;
  }

  if (!req.session.basket) {
    var totalQty = "";
    res.render("error", {
      korisnik: korisnik,
      userId: korisnik,
      totalQty: totalQty
    });
  } else {
    var totalQty = req.session.basket.totalQty;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      var order = new Order({
        username: userId,
        basket: req.session.basket,
        address: req.body.address,
        name: req.body.name,
        email: req.body.email,
        cardHolderName: req.body.cardName,
        creditCardNumber: req.body.cardNumber,
        expMonth: req.body.expMonth,
        expYear: req.body.expYear,
        cvc: req.body.cvc,
        paidPrice: req.body.newTotalPrice
      });
      order.save(function (err, result) {
        if (err) {
          console.log(err);
        } else {
          req.session.basket = null;
          res.redirect("/success");
        }
      });
    });
  }
});

app.get("/add-to-basket/:productId", function (req, res) {
  var productId = req.params.productId;
  var basket = new Basket(req.session.basket ? req.session.basket : {});

  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect("/");
    }
    basket.add(product, product._id);
    req.session.basket = basket;
    res.redirect("/");
  });
});

app.get("/reduce/:productId", function (req, res) {
  var productId = req.params.productId;
  var basket = new Basket(req.session.basket ? req.session.basket : {});

  basket.reduceByOne(productId);
  req.session.basket = basket;
  res.redirect("/basket");
});

app.get("/increase/:productId", function (req, res) {
  var productId = req.params.productId;
  var basket = new Basket(req.session.basket ? req.session.basket : {});

  basket.increaseByOne(productId);
  req.session.basket = basket;
  res.redirect("/basket");
});

app.get("/remove/:productId", function (req, res) {
  var productId = req.params.productId;
  var basket = new Basket(req.session.basket ? req.session.basket : {});

  basket.removeItem(productId);
  req.session.basket = basket;
  res.redirect("/basket");
});

app.get("/product/:productId", function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
  } else {
    var korisnik = req.session.passport.user;
  }

  if (!req.session.basket) {
    var totalQty = "";
  } else {
    totalQty = req.session.basket.totalQty;
  }

  var prod = req.params.productId;

  Product.findOne({
    _id: prod
  }, function (err, product) {
    res.render("product", {
      korisnik: korisnik,
      product: product,
      totalQty: totalQty
    });
  });
});

app.get("/error", function (req, res) {
  var totalQty = req.session.basket.totalQty;
  if (!req.session.passport) {
    var korisnik = "";
    res.render("error", {
      korisnik: korisnik,
      userId: korisnik,
      totalQty: totalQty
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("error", {
        korisnik: korisnik,
        userId: userId,
        totalQty: totalQty
      });
    });
  }
});

app.get("/success", function (req, res) {
  if (!req.session.basket) {
    var totalQty = "";
    res.render("success", {
      totalQty: totalQty
    });
  } else {
    var totalQty = req.session.basket.totalQty;
    res.render("success", {
      totalQty: totalQty
    });
  }
});

app.get("/logout", isLoggedIn, function (req, res) {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running.")
});