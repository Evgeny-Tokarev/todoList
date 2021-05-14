const express = require("express");
const app = express();
const mongoose = require("mongoose");
ObjectID = require("mongodb").ObjectID;
// const date = require(__dirname + "/date.js");
const port = 3000;
// let items = ["by food"];
let workItems = [];
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect("mongodb://localhost:27017/todoListDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((res) => console.log("mongoose connected"));

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name required"],
  },
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "By food",
});

const item2 = new Item({
  name: "Make breakfast",
});

const item3 = new Item({
  name: "Eat breakfast",
});
const defaultItems = [item1, item2, item3];
let todos = [];

app.get("/", (req, res) => {
  Item.find({}, (err, todos) => {
    if (!err) {
      if (todos.length === 0) {
        console.log("No Items");
        Item.insertMany(defaultItems, (err) => {
          if (!err) {
            console.log("Default items succesfully added");
          } else {
            console.log("1 " + err);
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: todos });
      }
    } else {
      console.log("2 " + err);
    }
  });
});

app.post("/", (req, res) => {
  const nextItem = new Item({
    name: req.body.newItem,
  });

  nextItem.save();
  res.redirect("/");
  // console.log(req.body);

  // if (req.body.list === "Work") {
  //   Item.insertOne(nextItem, (err) => {

  //   });
  //   res.redirect("/work");
  // } else {
  //   Item.insertOne(nextItem);
  //   res.redirect("/");
  // }
});

app.post("/delete", (req, res) => {
  // console.log(typeof req.body.deleteCheckbox);

  const idToDelete = req.body.deleteCheckbox;
  // console.log("idToDelete  " + idToDelete);
  Item.findByIdAndRemove(idToDelete.trim(), (err) => {
    console.log("3 " + err);
    res.redirect("/");
  });
});

app.get("/work", (req, res) => {
  res.render("list", { listTitle: "Work list", newListItems: workItems });
});

app.get("/about", (req, res) => {
  res.render("about");
});
app.listen(port, () => {
  console.log("Server started on port " + port);
});
